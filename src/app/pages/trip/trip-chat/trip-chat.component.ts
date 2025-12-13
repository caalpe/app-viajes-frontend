import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { IMessage } from '../../../interfaces/IMessage';
import { ISurvey } from '../../../interfaces/ISurvey';
import { ChatApiService } from '../../../services/api-rest/chat-rest.service';
import { SurveyRestService } from '../../../services/api-rest/survey-rest.service';
import { MessageStateService } from '../../../services/message.service';
import { AuthService } from '../../../services/auth.service';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { SurveyModalComponent } from '../../../shared/components/survey-modal/survey-modal.component';
import { MessageListComponent } from './message-list/message-list.component';

@Component({
  selector: 'app-trip-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SurveyModalComponent, MessageListComponent],
  templateUrl: './trip-chat.component.html',
  styleUrls: ['./trip-chat.component.css']
})
export class TripChatComponent implements OnInit {
  tripId!: number;
  messages: IMessage[] = [];
  surveys: ISurvey[] = [];
  messageForm: FormGroup;
  loading = false;
  sending = false;
  loadingSurveys = false;
  currentUserId: number | null = null;
  currentUserName: string = '';
  isOrganizer = false;
  showSurveyModal = false;
  replyingTo: IMessage | null = null; // Mensaje al que se está respondiendo

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageStateService,
    private chatApi: ChatApiService,
    private surveyApi: SurveyRestService,
    private authService: AuthService,
    private userApi: UserApiService,
    private tripApi: TripApiService
  ) {
    this.messageForm = this.messageService.getForm();
  }

  async ngOnInit(): Promise<void> {
    // Obtener ID del viaje desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/trips']);
      return;
    }
    this.tripId = Number(id);

    // Obtener información del usuario actual
    this.currentUserId = this.authService.getUserId();
    if (this.currentUserId) {
      try {
        const user = await this.userApi.getUser(this.currentUserId);
        this.currentUserName = user?.name || 'Usuario';
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        this.currentUserName = 'Usuario';
      }
    }

    // Verificar si el usuario es el organizador
    await this.checkIfOrganizer();

    // Cargar mensajes y encuestas
    await Promise.all([
      this.loadMessages(),
      this.loadSurveys()
    ]);
  }

  async checkIfOrganizer(): Promise<void> {
    try {
      const trip = await this.tripApi.getTrip(this.tripId);
      this.isOrganizer = trip.id_creator === this.currentUserId;
    } catch (error) {
      console.error('Error al verificar organizador:', error);
      this.isOrganizer = false;
    }
  }

  async loadMessages(): Promise<void> {
    this.loading = true;
    try {
      this.messages = await this.chatApi.getMessagesByTrip(this.tripId);
      // Scroll al final después de cargar mensajes
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.messageForm.invalid || !this.currentUserId) {
      return;
    }

    this.sending = true;
    try {
      const messageText = this.messageService.getValue();

      // Si estamos respondiendo, usar el ID del mensaje al que respondemos
      const parentMessageId = this.replyingTo?.id_message;

      const newMessage = await this.chatApi.sendMessage(
        this.tripId,
        this.currentUserId,
        this.currentUserName,
        messageText,
        parentMessageId
      );

      // Si es una respuesta, agregarla al array de replies del mensaje padre
      if (this.replyingTo) {
        const parentMessage = this.findMessageById(this.messages, this.replyingTo.id_message);
        if (parentMessage) {
          parentMessage.replies = parentMessage.replies || [];
          parentMessage.replies.push(newMessage);
        }
      } else {
        // Si es un mensaje principal, agregarlo a la lista
        this.messages.push(newMessage);
      }

      // Limpiar formulario y estado de respuesta
      this.messageService.resetForm();
      this.cancelReply();

      // Scroll al final
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    } finally {
      this.sending = false;
    }
  }

  // Buscar mensaje por ID en el árbol de mensajes
  private findMessageById(messages: IMessage[], id: number): IMessage | null {
    for (const msg of messages) {
      if (msg.id_message === id) {
        return msg;
      }
      if (msg.replies && msg.replies.length > 0) {
        const found = this.findMessageById(msg.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  async deleteMessage(messageId: number): Promise<void> {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      await this.chatApi.deleteMessage(messageId);
      this.messages = this.messages.filter(msg => msg.id_message !== messageId);
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      alert('Error al eliminar el mensaje. Por favor, intenta de nuevo.');
    }
  }

  canDeleteMessage(message: IMessage): boolean {
    return message.id_user === this.currentUserId;
  }

  private scrollToBottom(): void {
    const messageList = document.querySelector('.messages-list');
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }

  goBack(): void {
    this.router.navigate(['/trips', this.tripId]);
  }

  // Iniciar respuesta a un mensaje
  onReplyToMessage(message: IMessage): void {
    this.replyingTo = message;
    // Enfocar el textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea[formControlName="message"]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  // Cancelar respuesta
  cancelReply(): void {
    this.replyingTo = null;
  }

  // Obtener preview del mensaje (primeros 15 caracteres)
  getMessagePreview(message: string): string {
    if (!message) return '';
    return message.length > 15 ? message.substring(0, 15) + '...' : message;
  }

  get messageControl() {
    return this.messageForm.get('message');
  }

  // ============ MÉTODOS DE ENCUESTAS ============

  async loadSurveys(): Promise<void> {
    if (!this.currentUserId) return;

    this.loadingSurveys = true;
    try {
      this.surveys = await this.surveyApi.getSurveysByTrip(this.tripId, this.currentUserId);
    } catch (error) {
      console.error('Error al cargar encuestas:', error);
    } finally {
      this.loadingSurveys = false;
    }
  }

  openSurveyModal(): void {
    if (!this.currentUserId) {
      alert('No se pudo identificar al usuario');
      return;
    }
    console.log('Abriendo modal de encuesta. Usuario:', this.currentUserId, this.currentUserName);
    this.showSurveyModal = true;
  }

  closeSurveyModal(): void {
    this.showSurveyModal = false;
  }

  onSurveyCreated(newSurvey: ISurvey): void {
    console.log('Nueva encuesta creada:', newSurvey);
    console.log('Encuestas antes:', this.surveys.length);
    // Crear una nueva referencia del array para forzar detección de cambios
    this.surveys = [...this.surveys, newSurvey];
    console.log('Encuestas después:', this.surveys.length);
    console.log('Todas las encuestas:', this.surveys);
  }

  onSurveyUpdated(updatedSurvey: ISurvey): void {
    const index = this.surveys.findIndex(s => s.id_survey === updatedSurvey.id_survey);
    if (index !== -1) {
      this.surveys[index] = updatedSurvey;
    }
  }

  onSurveyError(errorMessage: string): void {
    alert(errorMessage);
  }
}
