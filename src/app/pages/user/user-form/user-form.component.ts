import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserStateService } from '../../../services/user.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { AuthRestService } from '../../../services/api-rest/auth-rest.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';
import { AuthService } from '../../../services/auth.service';
import { validateEmail, validatePhone, validateUrl, containsNumbers, onlyCharacters } from '../../../shared/utils/data.utils';
import { extractErrorMessage, extractSuccessMessage } from '../../../shared/utils/http-error.utils';
import { VALIDATION_MESSAGES } from '../../../shared/constants/validation-messages.constants';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent, RouterLink],
  styleUrl: './user-form.component.css',
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private userState = inject(UserStateService);
  private userApi = inject(UserApiService);
  private authRest = inject(AuthRestService);
  private authService = inject(AuthService);
  private router = inject(Router);

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

  // Propiedades para mostrar errores de validación custom
  validationErrors: { [key: string]: string } = {};

  ngOnInit(): void {
    // El FormGroup viene del state service
    this.userForm = this.userState.getForm();

    // Verificar si estamos en modo edición (Mi Perfil)
    this.loadEditModeData();

    // Si estamos en modo edición, verificar autenticación
    if (this.isEditMode && !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  async loadEditModeData(): Promise<void> {
    // Obtener ID del usuario autenticado (del JWT decodificado)
    const userId = this.authService.getUserId();

    if (userId) {
      this.isEditMode = true;
      this.userId = userId;
      // En modo edición, la password viene del backend y es readonly
      // No es necesario ajustar validadores
      await this.loadUserData(userId);
    }
  }

  async loadUserData(userId: number): Promise<void> {
    try {
      const user = await this.userApi.getUser(userId);
      // En modo edición, llenamos el formulario con todos los datos incluyendo password
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
    const payload = this.userForm.value;

    // Validar datos del formulario con validaciones personalizadas
    const customValidationsPassed = this.validateFormData(payload);

    // Validar que el formulario sea válido según Angular
    const angularValidationsPassed = this.userForm.valid;

    // Si no pasa las validaciones de Angular, marcar como touched para mostrar errores
    if (!angularValidationsPassed) {
      this.userForm.markAllAsTouched();
    }

    // Retornar si falla cualquiera de las validaciones
    if (!customValidationsPassed || !angularValidationsPassed) {
      return;
    }

    this.isSubmitting = true;

    try {
      let successMessage = '';
      let payload = this.userForm.value;

      if (this.isEditMode && this.userId) {
        // Modo edición: actualizar usuario existente
        // No enviar la password al backend en edición usando el operador spread
        const { password, ...payloadWithoutPassword } = payload;
        const userActualizado = await this.userApi.updateUserPut(this.userId, payloadWithoutPassword);
        successMessage = extractSuccessMessage(userActualizado, 'Usuario actualizado correctamente');
      } else {
        // Modo alta: crear nuevo usuario usando register del auth-rest
        const response = await this.authRest.register(payload);
        // Guardar el token en el AuthService (decodifica JWT automáticamente)
        this.authService.setToken(response.token);
        successMessage = extractSuccessMessage(response, 'Usuario registrado correctamente');
      }

      this.showModal('¡Éxito!', successMessage, 'success', '/user/profile');
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
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
    // Si estamos en modo edición, volver a user-detail, sino a home
    if (this.isEditMode) {
      this.router.navigate(['/user/profile']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Validador personalizado para el nombre
   * Verifica que no contenga números y que solo contenga caracteres alfabéticos
   */
  private nameValidator(value: any): boolean {
    if (!value) {
      return true; // Dejar que los validadores requeridos manejen valores vacíos
    }

    // No puede contener números
    if (containsNumbers(value)) {
      return false;
    }

    // Solo caracteres alfabéticos
    if (!onlyCharacters(value)) {
      return false;
    }

    return true;
  }

  /**
   * Validar los datos del formulario antes de enviar
   * @returns true si todas las validaciones pasan, false en caso contrario
   */
  private validateFormData(payload: any): boolean {
    // Limpiar errores previos
    this.validationErrors = {};

    // Validar nombre: no puede contener números y debe ser solo caracteres
    if (payload.name && !this.nameValidator(payload.name)) {
      this.validationErrors['name'] = VALIDATION_MESSAGES.name.invalid;
      return false;
    }

    // Validar email: formato válido
    if (payload.email && !validateEmail(payload.email)) {
      this.validationErrors['email'] = VALIDATION_MESSAGES.email.invalid;
      return false;
    }

    // Validar teléfono: opcional, pero si está presente validar formato
    if (payload.phone && payload.phone.trim() !== '') {
      if (!validatePhone(payload.phone)) {
        this.validationErrors['phone'] = VALIDATION_MESSAGES.phone.invalid;
        return false;
      }
    }

    // Validar photo_url: opcional, pero si está presente validar formato
    if (payload.photo_url && payload.photo_url.trim() !== '') {
      if (!validateUrl(payload.photo_url)) {
        this.validationErrors['photo_url'] = VALIDATION_MESSAGES.photo_url.invalid;
        return false;
      }
    }

    return true;
  }
}
