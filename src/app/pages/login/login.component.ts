import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthRestService } from '../../services/api-rest/auth-rest.service';
import { AuthService } from '../../services/auth.service';
import { ModalAlertComponent } from '../../shared/components/modal-alert/modal-alert.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authRest = inject(AuthRestService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;
  isSubmitting = false;
  passwordVisible = false;

  // Modal properties
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  modalRedirectUrl: string | null = null;

  ngOnInit(): void {
    // Si ya está logado, redirigir a home
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const credentials = this.loginForm.value;

    try {
      const response = await this.authRest.login(credentials);
      console.log('Login exitoso:', response);

      // Guardar el token en el AuthService
      this.authService.setToken(response.token);

      // Mostrar modal de éxito y redirigir
      this.showModal('¡Bienvenido!', response.message || 'Login exitoso', 'success', '/');
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'Error al iniciar sesión. Intenta nuevamente.';
      this.showModal('Error', errorMessage, 'error');
      console.error('Error en login', error);
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
  }

  onRegisterClick(): void {
    this.router.navigate(['/users/new']);
  }
}
