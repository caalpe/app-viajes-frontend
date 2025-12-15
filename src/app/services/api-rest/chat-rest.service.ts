import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IMessage } from '../../interfaces/IMessage';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/trips';

  /**
   * Obtiene los headers con la autorización del token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene todos los mensajes de un viaje específico
   * @param tripId ID del viaje
   * @returns Promise con array de mensajes organizados con sus respuestas
   */
  async getMessagesByTrip(tripId: number): Promise<IMessage[]> {
    const headers = this.getAuthHeaders();
    const allMessages = await firstValueFrom(
      this.http.get<IMessage[]>(`${this.baseUrl}/${tripId}/messages`, { headers })
    );

    // Organizar mensajes con jerarquía ilimitada
    const messageMap = new Map<number, IMessage>();
    const mainMessages: IMessage[] = [];

    // Ordenar por fecha (UTC)
    const sortedMessages = allMessages.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Primera pasada: crear mapa de todos los mensajes con replies vacío
    sortedMessages.forEach(msg => {
      messageMap.set(msg.id_message, { ...msg, replies: [] });
    });

    // Segunda pasada: organizar jerarquía (puede ser de cualquier nivel)
    sortedMessages.forEach(msg => {
      const message = messageMap.get(msg.id_message)!;
      if (msg.id_parent_message) {
        // Es una respuesta, agregarla al mensaje padre
        const parent = messageMap.get(msg.id_parent_message);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(message);
        } else {
          // Si no se encuentra el padre, tratarlo como mensaje principal
          mainMessages.push(message);
        }
      } else {
        // Es un mensaje principal
        mainMessages.push(message);
      }
    });

    return mainMessages;
  }

  /**
   * Envía un nuevo mensaje al chat de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario que envía el mensaje
   * @param userName Nombre del usuario
   * @param message Contenido del mensaje
   * @param parentMessageId ID del mensaje padre (si es una respuesta)
   * @returns Promise con el mensaje creado
   */
  async sendMessage(
    tripId: number,
    userId: number,
    userName: string,
    message: string,
    parentMessageId?: number
  ): Promise<IMessage> {
    const headers = this.getAuthHeaders();
    const body: any = { message };

    if (parentMessageId) {
      body.id_parent_message = parentMessageId;
    }

    const newMessage = await firstValueFrom(
      this.http.post<IMessage>(`${this.baseUrl}/${tripId}/messages`, body, { headers })
    );

    // Asegurar que tenga el array de replies inicializado
    return { ...newMessage, replies: [] };
  }

  /**
   * Elimina un mensaje del chat
   * @param messageId ID del mensaje a eliminar
   * @returns Promise<void>
   */
  async deleteMessage(messageId: number): Promise<void> {
    const headers = this.getAuthHeaders();
    await firstValueFrom(
      this.http.delete<void>(`https://app-viajes-backend-amla.onrender.com/api/messages/${messageId}`, { headers })
    );
  }
}
