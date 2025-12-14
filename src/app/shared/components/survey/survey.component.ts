import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISurvey } from '../../../interfaces/ISurvey';
import { SurveyRestService } from '../../../services/api-rest/survey-rest.service';
import { ModalAlertComponent } from '../modal-alert/modal-alert.component';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, ModalAlertComponent],
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent {
  @Input() survey!: ISurvey;
  @Input() canClose: boolean = false; // Si el usuario actual puede cerrar la encuesta
  @Input() currentUserId: number | null = null;

  @Output() surveyUpdated = new EventEmitter<ISurvey>(); // Emite la encuesta actualizada
  @Output() error = new EventEmitter<string>(); // Emite errores

  // Modal state
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';

  constructor(private surveyApi: SurveyRestService) {}

  async onVote(optionId: number): Promise<void> {
    if (this.survey.is_closed || this.survey.user_voted_option !== null && this.survey.user_voted_option !== undefined) {
      return; // No permitir votar si está cerrada o ya votó
    }

    if (!this.currentUserId) {
      this.error.emit('No se pudo identificar al usuario');
      return;
    }

    try {
      const updatedSurvey = await this.surveyApi.voteSurvey(this.survey.id_survey, this.currentUserId, optionId);
      this.surveyUpdated.emit(updatedSurvey);
    } catch (err) {
      console.error('Error al votar:', err);
      this.error.emit('Error al registrar el voto. Por favor, intenta de nuevo.');
    }
  }

  requestCloseSurvey(): void {
    if (!this.canClose || this.survey.is_closed) {
      return;
    }

    if (!this.currentUserId) {
      this.error.emit('No se pudo identificar al usuario');
      return;
    }

    this.confirmModalTitle = 'Cerrar encuesta';
    this.confirmModalMessage = '¿Estás seguro de cerrar esta encuesta? No se podrán agregar más votos.';
    this.showConfirmModal = true;
  }

  async confirmCloseSurvey(): Promise<void> {
    this.showConfirmModal = false;

    if (!this.currentUserId) {
      this.error.emit('No se pudo identificar al usuario');
      return;
    }

    try {
      await this.surveyApi.closeSurvey(this.survey.id_survey, this.currentUserId);
      this.survey.is_closed = true;
      this.surveyUpdated.emit(this.survey);
    } catch (err) {
      console.error('Error al cerrar encuesta:', err);
      this.error.emit('Error al cerrar la encuesta. Por favor, intenta de nuevo.');
    }
  }

  closeModal(): void {
    this.showConfirmModal = false;
  }

  // Calcular el total de votos
  getTotalVotes(): number {
    return this.survey.options.reduce((sum, option) => sum + option.vote_count, 0);
  }

  // Calcular el porcentaje de una opción
  getPercentage(voteCount: number): number {
    const total = this.getTotalVotes();
    return total > 0 ? Math.round((voteCount / total) * 100) : 0;
  }

  // Verificar si el usuario ya votó
  hasUserVoted(): boolean {
    return this.survey.user_voted_option !== null && this.survey.user_voted_option !== undefined;
  }

  // Verificar si una opción es la que votó el usuario
  isUserVote(optionId: number): boolean {
    return this.survey.user_voted_option === optionId;
  }
}
