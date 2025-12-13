import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ISurvey } from '../../../interfaces/ISurvey';
import { ChatApiService } from '../../../services/api-rest/chat-rest.service';

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
    private fb: FormBuilder,
    private chatApi: ChatApiService
  ) {
    this.surveyForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      options: this.fb.array([
        this.createOption(),
        this.createOption()
      ])
    });
  }

  get options(): FormArray {
    return this.surveyForm.get('options') as FormArray;
  }

  createOption(): FormGroup {
    return this.fb.group({
      text: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]]
    });
  }

  addOption(): void {
    if (this.options.length < 10) {
      this.options.push(this.createOption());
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
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

    const question = this.surveyForm.value.question.trim();
    const options = this.surveyForm.value.options
      .map((opt: any) => opt.text.trim())
      .filter((text: string) => text.length > 0);

    if (options.length < 2) {
      this.error.emit('Debes proporcionar al menos 2 opciones');
      return;
    }

    this.isSubmitting = true;
    try {
      console.log('Creando encuesta con datos:', { tripId: this.tripId, userId: this.userId, userName: this.userName, question, options });
      const newSurvey = await this.chatApi.createSurvey(
        this.tripId,
        this.userId,
        this.userName,
        question,
        options
      );
      console.log('Encuesta creada en modal:', newSurvey);
      console.log('Emitiendo surveyCreated...');
      this.surveyCreated.emit(newSurvey);
      this.surveyForm.reset();
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
