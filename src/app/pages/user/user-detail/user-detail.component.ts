import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { IUser } from '../../../interfaces/IUser';
import { extractErrorMessage } from '../../../shared/utils/http-error.utils';
import { formatDateToSpanish } from '../../../shared/utils/data.utils';
import { getIdFromRoute } from '../../../shared/utils/route.utils';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, ModalAlertComponent, SpinnerComponent],
  styleUrl: './user-detail.component.css',
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
  private authService = inject(AuthService);
  private userApi = inject(UserApiService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  user: IUser | null = null;
  isLoading = true;
  isOwnProfile = false;
  targetUserId: number | null = null;

  // Modal properties
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';
  modalRedirectUrl: string | null = null;

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserData();
  }

  async loadUserData(): Promise<void> {
    try {
      // Obtener el ID del usuario de la ruta (si existe)
      const idFromRoute = await getIdFromRoute(this.activatedRoute, 'idUser');

      // Si hay ID en la ruta, mostrar ese usuario; si no, mostrar perfil propio
      const userId = idFromRoute || this.authService.getUserId();

      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      this.targetUserId = userId;
      this.isOwnProfile = userId === this.authService.getUserId();
      this.user = await this.userApi.getUser(userId);
      console.log('Datos del usuario cargados:', this.user);
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      this.showModal('Error', errorMessage, 'error');
      console.error('Error cargando usuario', error);
    } finally {
      this.isLoading = false;
    }
  }

  onEditProfile(): void {
    this.router.navigate(['/user/profile/edit']);
  }

  onBack(): void {
    this.router.navigate(['/']);
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

  formatDate(date: string | Date | undefined | null): string {
    return formatDateToSpanish(date);
  }

  /**
   * Parsear los intereses desde una cadena separada por comas
   * @param interests - String con intereses separados por comas o ", "
   * @returns Array de intereses limpios
   */
  parseInterests(interests: string | undefined | null): string[] {
    if (!interests) {
      return [];
    }
    return interests
      .split(/,\s*/)
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
  }
}

