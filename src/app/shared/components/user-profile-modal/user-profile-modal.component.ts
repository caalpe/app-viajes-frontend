import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces/IUser';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()"></div>
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Perfil de Usuario</h5>
          <button type="button" class="btn-close" (click)="close.emit()"></button>
        </div>
        <div class="modal-body">
          @if (user) {
            <div class="text-center mb-4">
              <img 
                [src]="user.photo_url || 'https://ui-avatars.com/api/?name=' + user.name.replace(' ', '+') + '&size=120'" 
                class="rounded-circle mb-3" 
                width="120" 
                height="120"
                [alt]="user.name">
              <h4 class="mb-1">{{ user.name }}</h4>
              <p class="text-muted mb-2">{{ user.email }}</p>
              
              @if (user.average_rating && user.average_rating > 0) {
                <div class="rating mb-3">
                  @for (star of [1,2,3,4,5]; track star) {
                    <i class="bi" 
                       [class.bi-star-fill]="star <= (user.average_rating || 0)"
                       [class.bi-star]="star > (user.average_rating || 0)"
                       [class.text-warning]="star <= (user.average_rating || 0)"
                       [class.text-muted]="star > (user.average_rating || 0)"></i>
                  }
                  <span class="ms-2 text-muted">({{ user.rating_count || 0 }} valoraciones)</span>
                </div>
              }
            </div>

            @if (user.phone) {
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  <i class="bi bi-telephone me-2"></i>Teléfono
                </label>
                <p class="text-muted">{{ user.phone }}</p>
              </div>
            }

            @if (user.bio) {
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  <i class="bi bi-person me-2"></i>Biografía
                </label>
                <p class="text-muted">{{ user.bio }}</p>
              </div>
            }

            @if (user.interests) {
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  <i class="bi bi-star me-2"></i>Intereses
                </label>
                <div class="d-flex flex-wrap gap-2">
                  @for (interest of user.interests.split(','); track interest) {
                    <span class="badge bg-primary bg-opacity-10 text-primary">{{ interest.trim() }}</span>
                  }
                </div>
              </div>
            }
          } @else {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
          }
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="close.emit()">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
    }

    .modal-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1050;
      width: 90%;
      max-width: 500px;
    }

    .modal-content {
      background-color: #ffffff;
      border-radius: 0.75rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      border: none;
    }

    .modal-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      border-radius: 0.75rem 0.75rem 0 0;
      padding: 1.25rem;
    }

    .modal-title {
      color: #212529;
      font-weight: 600;
      margin: 0;
    }

    .modal-body {
      background-color: #ffffff;
      padding: 1.5rem;
      color: #212529;
    }

    .modal-footer {
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      border-radius: 0 0 0.75rem 0.75rem;
      padding: 1rem 1.25rem;
    }

    .form-label {
      color: #495057;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .text-muted {
      color: #6c757d !important;
    }

    .rating i {
      font-size: 1.25rem;
    }

    .btn-close {
      background: transparent url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/1em auto no-repeat;
      border: none;
      width: 1em;
      height: 1em;
      opacity: 0.5;
      cursor: pointer;
      padding: 0;
    }

    .btn-close:hover {
      opacity: 1;
    }

    .badge {
      padding: 0.35rem 0.65rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class UserProfileModalComponent {
  @Input() user: IUser | null = null;
  @Output() close = new EventEmitter<void>();
}
