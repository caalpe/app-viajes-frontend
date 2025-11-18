import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService } from '../../../services/user.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/api-rest/user-rest.service';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './user-form.component.css',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private userState = inject(UserStateService);
  private userApi = inject(UserApiService);
  private router = inject(Router);

  userForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;

  ngOnInit(): void {
    // El FormGroup viene del state service
    this.userForm = this.userState.getForm();
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.userForm.value;

    try {
      const userCreado = await this.userApi.createUser(payload);
      console.log('Usuario creado', userCreado);
      // Navegar a la lista de usuarios o a home después de crear
      this.router.navigate(['/users']);
    } catch (error) {
      console.error('Error creando usuario', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onBack(): void {
    this.userState.resetForm();
    this.router.navigate(['/']);
  }
}
