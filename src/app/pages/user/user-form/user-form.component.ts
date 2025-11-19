import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService } from '../../../services/user.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent],
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

  // Modal properties
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  modalRedirectUrl: string | null = null;

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
      const userCreated = await this.userApi.createUser(payload);
      console.log('Usuario creado', userCreated);

      if (userCreated) {
        this.showModal('¡Éxito!', 'Usuario creado correctamente', 'success', '/');
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al crear el usuario. Intenta nuevamente.';
      this.showModal('Error', errorMessage, 'error');
      console.error('Error creando usuario', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  showModal(title: string, message: string, type: 'success' | 'error', redirectUrl: string | null = null): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalRedirectUrl = redirectUrl;
    this.modalVisible = true;
  }

  onModalClose(): void {
    this.modalVisible = false;
    if (this.modalType === 'success') {
      this.userState.resetForm();
    }
  }

  onBack(): void {
    this.userState.resetForm();
    this.router.navigate(['/']);
  }
}
