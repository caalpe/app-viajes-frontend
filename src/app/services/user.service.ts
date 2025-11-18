import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.maxLength(30)]],
      photo_url: [''],
      bio: ['', [Validators.maxLength(1000)]],
      interests: ['', [Validators.maxLength(500)]],
    });
  }

  getForm(): FormGroup {
    return this.userForm;
  }

  resetForm(): void {
    this.userForm.reset();
    this.initializeForm();
  }

  patchForm(data: Partial<any>): void {
    this.userForm.patchValue(data);
  }
}
