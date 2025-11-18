import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IUser } from '../interfaces/IUser';

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
      name: new FormControl<IUser['name']>('', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
      email: new FormControl<IUser['email']>('', [Validators.required, Validators.email]),
      password: new FormControl<IUser['password']>('', [Validators.required, Validators.minLength(8)]),
      phone: new FormControl<IUser['phone']>('', [Validators.maxLength(30)]),
      photo_url: new FormControl<IUser['photo_url']>(''),
      bio: new FormControl<IUser['bio']>('', [Validators.maxLength(1000)]),
      interests: new FormControl<IUser['interests']>('', [Validators.maxLength(500)]),
      average_rating: new FormControl<IUser['average_rating']>(0.0),
      rating_count: new FormControl<IUser['rating_count']>(0),
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
