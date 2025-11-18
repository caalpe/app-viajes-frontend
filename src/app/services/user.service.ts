import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

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
      name: new FormControl<string>('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
      phone: new FormControl<string>('', [Validators.maxLength(30)]),
      photo_url: new FormControl<string>(''),
      bio: new FormControl<string>('', [Validators.maxLength(1000)]),
      interests: new FormControl<string>('', [Validators.maxLength(500)]),
      average_rating: new FormControl<number>(0.0),
      rating_count: new FormControl<number>(0),
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
