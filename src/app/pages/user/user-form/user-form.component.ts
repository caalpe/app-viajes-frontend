import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserStateService } from '../../../services/user.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';
import { AuthService } from '../../../services/auth.service';
import { getIdFromRoute } from '../../../shared/utils/route.utils';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent, RouterLink],
  styleUrl: './user-form.component.css',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private userState = inject(UserStateService);
  private userApi = inject(UserApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  userForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;
  isEditMode = false;
  userId: number | null = null;

  // Modal properties
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  modalRedirectUrl: string | null = null;

  ngOnInit(): void {
    // El FormGroup viene del state service
    this.userForm = this.userState.getForm();

    // Verificar si estamos en modo edición
    this.loadEditModeData();

    // TODO: Remover - Solo para pruebas
    console.log('URL actual:', this.router.url);
  }

  async loadEditModeData(): Promise<void> {
    const id = await getIdFromRoute(this.activatedRoute);
    if (id) {
      this.isEditMode = true;
      this.userId = id;
      await this.loadUserData(id);
    }
  }

  async loadUserData(userId: number): Promise<void> {
    try {
      const user = await this.userApi.getUser(userId);
      console.log('Usuario cargado:', user);
      // Llenar el formulario con los datos del usuario
      this.userState.patchForm(user);
    } catch (error) {
      console.error('Error cargando usuario', error);
      this.router.navigate(['/']);
    }
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
      if (this.isEditMode && this.userId) {
        // Modo edición: actualizar usuario existente
        const userActualizado = await this.userApi.updateUserPut(this.userId, payload);
        console.log('Usuario actualizado', userActualizado);
      } else {
        // Modo alta: crear nuevo usuario
        const userCreado = await this.userApi.createUser(payload);
        console.log('Usuario creado', userCreado);
      }
      this.showModal('¡Éxito!',
        this.isEditMode ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente',
        'success',
        '/');
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al procesar el usuario. Intenta nuevamente.';
      this.showModal('Error', errorMessage, 'error');
      console.error('Error procesando usuario', error);
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
