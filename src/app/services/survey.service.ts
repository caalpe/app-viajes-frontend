import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { ISurvey } from '../interfaces/ISurvey';
import {
  SURVEY_QUESTION_MAX_LENGTH,
  SURVEY_OPTION_MAX_LENGTH,
  SURVEY_MIN_OPTIONS,
  SURVEY_MAX_OPTIONS
} from '../shared/constants/field-lengths.constants';

@Injectable({
  providedIn: 'root',
})
export class SurveyStateService {
  private surveyForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.surveyForm = this.fb.group({
      question: new FormControl<ISurvey['question']>('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(SURVEY_QUESTION_MAX_LENGTH)
      ]),
      options: this.fb.array(
        [this.createOption(), this.createOption()],
        [Validators.minLength(SURVEY_MIN_OPTIONS), Validators.maxLength(SURVEY_MAX_OPTIONS)]
      )
    });
  }

  getForm(): FormGroup {
    return this.surveyForm;
  }

  getOptions(): FormArray {
    return this.surveyForm.get('options') as FormArray;
  }

  createOption(): FormGroup {
    return this.fb.group({
      text: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(SURVEY_OPTION_MAX_LENGTH)
      ])
    });
  }

  addOption(): void {
    const options = this.getOptions();
    if (options.length < SURVEY_MAX_OPTIONS) {
      options.push(this.createOption());
    }
  }

  removeOption(index: number): void {
    const options = this.getOptions();
    if (options.length > SURVEY_MIN_OPTIONS) {
      options.removeAt(index);
    }
  }

  resetForm(): void {
    this.surveyForm.reset();
    // Limpiar el array y agregar 2 opciones por defecto
    const options = this.getOptions();
    while (options.length > 0) {
      options.removeAt(0);
    }
    options.push(this.createOption());
    options.push(this.createOption());
  }

  patchForm(data: Partial<ISurvey>): void {
    if (data.question) {
      this.surveyForm.patchValue({ question: data.question });
    }
  }

  getQuestion(): string {
    return this.surveyForm.get('question')?.value?.trim() || '';
  }

  getOptionTexts(): string[] {
    const options = this.getOptions();
    return options.controls
      .map(control => control.get('text')?.value?.trim())
      .filter(text => text && text.length > 0);
  }

  canAddOption(): boolean {
    return this.getOptions().length < SURVEY_MAX_OPTIONS;
  }

  canRemoveOption(): boolean {
    return this.getOptions().length > SURVEY_MIN_OPTIONS;
  }
}
