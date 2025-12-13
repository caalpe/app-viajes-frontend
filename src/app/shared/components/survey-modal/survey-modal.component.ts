import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { ISurvey } from '../../../interfaces/ISurvey';
import { SurveyRestService } from '../../../services/api-rest/survey-rest.service';
import { SurveyStateService } from '../../../services/survey.service';

@Component({
  selector: 'app-survey-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './survey-modal.component.html',
  styleUrls: ['./survey-modal.component.css']
})
export class SurveyModalComponent {
  surveyForm: FormGroup;
  isSubmitting = false;

  @Input() tripId!: number;
  @Input() userId!: number;
  @Input() userName!: string;

  @Output() close = new EventEmitter<void>();
  @Output() surveyCreated = new EventEmitter<ISurvey>();
  @Output() error = new EventEmitter<string>();

  constructor(
    private surveyService: SurveyStateService,
    private surveyApi: SurveyRestService
  ) {
    this.surveyForm = this.surveyService.getForm();
  }

  get options(): FormArray {
    return this.surveyService.getOptions();
  }

  addOption(): void {
    this.surveyService.addOption();
  }

  removeOption(index: number): void {
    this.surveyService.removeOption(index);
  }

  canAddOption(): boolean {
    return this.surveyService.canAddOption();
  }

  canRemoveOption(): boolean {
    return this.surveyService.canRemoveOption();
  }

  async onSubmit(): Promise<void> {
    if (this.surveyForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.surveyForm.controls).forEach(key => {
        this.surveyForm.get(key)?.markAsTouched();
      });
      this.options.controls.forEach(control => {
        control.get('text')?.markAsTouched();
      });
      return;
    }

    const question = this.surveyService.getQuestion();
    const options = this.surveyService.getOptionTexts();

    if (options.length < 2) {
      this.error.emit('Debes proporcionar al menos 2 opciones');
      return;
    }

    this.isSubmitting = true;
    try {
      console.log('Creando encuesta con datos:', { tripId: this.tripId, userId: this.userId, userName: this.userName, question, options });
      const newSurvey = await this.surveyApi.createSurvey(
        this.tripId,
        this.userId,
        this.userName,
        question,
        options
      );
      console.log('Encuesta creada en modal:', newSurvey);
      console.log('Emitiendo surveyCreated...');
      this.surveyCreated.emit(newSurvey);
      this.surveyService.resetForm();
      this.onClose();
    } catch (err) {
      console.error('Error al crear encuesta:', err);
      this.error.emit('Error al crear la encuesta. Por favor, intenta de nuevo.');
    } finally {
      this.isSubmitting = false;
    }
  }

  onClose(): void {
    this.close.emit();
  }

  get questionControl() {
    return this.surveyForm.get('question');
  }
}
