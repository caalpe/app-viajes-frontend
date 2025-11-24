import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { IUser } from '../interfaces/IUser';
import {
  NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHOTO_URL_MAX_LENGTH,
  BIO_MAX_LENGTH,
  INTERESTS_MAX_LENGTH
} from '../shared/constants/field-lengths.constants';

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
      name: new FormControl<IUser['name']>('', [Validators.required, Validators.minLength(2), Validators.maxLength(NAME_MAX_LENGTH)]),
      email: new FormControl<IUser['email']>('', [Validators.required, Validators.email, Validators.maxLength(EMAIL_MAX_LENGTH)]),
      password: new FormControl<IUser['password']>('', [Validators.required, Validators.minLength(8), Validators.maxLength(PASSWORD_MAX_LENGTH)]),
      phone: new FormControl<IUser['phone']>('', [Validators.maxLength(PHONE_MAX_LENGTH)]),
      photo_url: new FormControl<IUser['photo_url']>('', [Validators.maxLength(PHOTO_URL_MAX_LENGTH)]),
      bio: new FormControl<IUser['bio']>('', [Validators.maxLength(BIO_MAX_LENGTH)]),
      interests: new FormControl<IUser['interests']>('', [Validators.maxLength(INTERESTS_MAX_LENGTH)]),
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
