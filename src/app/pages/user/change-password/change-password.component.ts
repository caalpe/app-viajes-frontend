import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { AuthService } from '../../../services/auth.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';
import { extractErrorMessage, extractSuccessMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent, RouterLink],
  styleUrl: './change-password.component.css',
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userApi = inject(UserApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  // Modal properties
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  modalRedirectUrl: string | null = null;

  // Propiedades para mostrar errores de validación custom
  validationErrors: { [key: string]: string } = {};

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForm();
    this.setupPasswordMatchValidation();
  }

  private initializeForm(): void {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  /**
   * Validador personalizado que verifica que las contraseñas coincidan
   */
  private passwordMatchValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  /**
   * Configurar reactividad para limpiar el error cuando las contraseñas coincidan
   */
  private setupPasswordMatchValidation(): void {
    this.changePasswordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordMatchError();
    });

    this.changePasswordForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordMatchError();
    });
  }

  /**
   * Actualizar el error de contraseña en tiempo real
   */
  private updatePasswordMatchError(): void {
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const confirmPassword = this.changePasswordForm.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      // Las contraseñas coinciden, limpiar el error
      delete this.validationErrors['confirmPassword'];
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      // Las contraseñas no coinciden, mostrar el error
      this.validationErrors['confirmPassword'] = 'Las contraseñas no coinciden';
    } else {
      // Si uno de los campos está vacío, limpiar el error
      delete this.validationErrors['confirmPassword'];
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  async onSubmit(): Promise<void> {

    // Validar datos del formulario
    const customValidationsPassed = this.validateFormData(this.changePasswordForm.value);

    // Validar que el formulario sea válido según Angular
    const angularValidationsPassed = this.changePasswordForm.valid;

    // Si no pasa las validaciones de Angular, marcar como touched para mostrar errores
    if (!angularValidationsPassed) {
      // Formulario inválido, marcar como touched
      this.changePasswordForm.markAllAsTouched();
    }

    // Retornar si falla cualquiera de las validaciones
    if (!customValidationsPassed || !angularValidationsPassed) {
      // Validaciones fallidas
      return;
    }

    this.isSubmitting = true;

    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        throw new Error('Usuario no identificado');
      }

      const payload = {
        password: this.changePasswordForm.value.newPassword
      };

      // Realizar PATCH solo del campo password
      const response = await this.userApi.updateUserPatch(userId, payload);


      const successMessage = extractSuccessMessage(response, 'Contraseña actualizada correctamente');
      this.showModal('¡Éxito!', successMessage, 'success', '/user/profile/edit');
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      this.showModal('Error', errorMessage, 'error');
      console.error('Error actualizando contraseña', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private validateFormData(payload: any): boolean {
    // Limpiar errores previos
    this.validationErrors = {};


    // La validación de coincidencia de contraseñas ya se hace de forma reactiva
    // Solo verificar que ambas contraseñas tengan contenido
    if (!payload.newPassword || !payload.confirmPassword) {
      return false;
    }

    return true;
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
  }

  onCancel(): void {
    this.router.navigate(['/user/profile/edit']);
  }
}
