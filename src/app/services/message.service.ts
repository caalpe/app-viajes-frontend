import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IMessage } from '../interfaces/IMessage';
import { MESSAGE_MAX_LENGTH } from '../shared/constants/field-lengths.constants';

@Injectable({
  providedIn: 'root',
})
export class MessageStateService {
  private messageForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.messageForm = this.fb.group({
      message: new FormControl<IMessage['message']>('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(MESSAGE_MAX_LENGTH)
      ])
    });
  }

  getForm(): FormGroup {
    return this.messageForm;
  }

  resetForm(): void {
    this.messageForm.reset();
  }

  patchForm(data: Partial<IMessage>): void {
    this.messageForm.patchValue(data);
  }

  getValue(): string {
    return this.messageForm.get('message')?.value?.trim() || '';
  }
}
