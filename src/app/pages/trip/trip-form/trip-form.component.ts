import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TripStateService } from '../../../services/trip.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { AuthService } from '../../../services/auth.service';
import { ModalAlertComponent } from '../../../shared/components/modal-alert/modal-alert.component';
import { getIdFromRoute } from '../../../shared/utils/route.utils';
import { validateDateNotPast, validateDateRange, convertIsoToDateInputFormat } from '../../../shared/utils/data.utils';
import { extractErrorMessage, extractSuccessMessage } from '../../../shared/utils/http-error.utils';

@Component({
  selector: 'app-trip-form',
  imports: [CommonModule, ReactiveFormsModule, ModalAlertComponent],
  styleUrl: './trip-form.component.css',
  templateUrl: './trip-form.component.html',
})
export class TripFormComponent implements OnInit {
  private tripState = inject(TripStateService);
  private tripApi = inject(TripApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  tripForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  tripId: number | null = null;
  minDate: string = ''; // Fecha mínima para el campo start_date
  minEndDate: string = ''; // Fecha mínima para el campo end_date (dinámica basada en start_date)

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
    this.tripForm = this.tripState.getForm();

    // Establecer la fecha mínima como hoy en formato YYYY-MM-DD
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.minEndDate = this.minDate;

    // Suscribirse a cambios en start_date para actualizar minEndDate
    this.tripForm.get('start_date')?.valueChanges.subscribe((startDate: string) => {
      if (startDate) {
        this.minEndDate = startDate;
      } else {
        this.minEndDate = this.minDate;
      }
    });

    // Aplicar estilos dinámicos a los inputs de fecha
    setTimeout(() => this.updateDateInputStyles(), 100);
    this.tripForm.valueChanges.subscribe(() => this.updateDateInputStyles());

    // Verificar si estamos en modo edición
    this.loadEditModeData();

    // Si estamos en modo edición, verificar autenticación
    if (this.isEditMode && !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // TODO: Remover - Solo para pruebas
    console.log('URL actual:', this.router.url);
    console.log('Token en AuthService:', this.authService.getToken());
  }

  /**
   * Actualizar estilos de los inputs de fecha según su valor
   */
  private updateDateInputStyles(): void {
    const startDateInput = document.getElementById('start_date') as HTMLInputElement;
    const endDateInput = document.getElementById('end_date') as HTMLInputElement;

    if (startDateInput) {
      if (startDateInput.value) {
        startDateInput.style.color = '#212529';
      } else {
        startDateInput.style.color = '#adb5bd';
      }
    }

    if (endDateInput) {
      if (endDateInput.value) {
        endDateInput.style.color = '#212529';
      } else {
        endDateInput.style.color = '#adb5bd';
      }
    }
  }

  async loadEditModeData(): Promise<void> {
    const id = await getIdFromRoute(this.activatedRoute);
    if (id) {
      this.isEditMode = true;
      this.tripId = id;
      await this.loadTripData(id);
    }
  }

  async loadTripData(tripId: number): Promise<void> {
    try {
      const trip = await this.tripApi.getTrip(tripId);
      console.log('Trip cargado:', trip);

      // Convertir las fechas de ISO a formato YYYY-MM-DD para los inputs date
      if (trip.start_date) {
        trip.start_date = convertIsoToDateInputFormat(trip.start_date);
      }
      if (trip.end_date) {
        trip.end_date = convertIsoToDateInputFormat(trip.end_date);
      }

      // Llenar el formulario con los datos del viaje
      this.tripState.patchForm(trip);
    } catch (error) {
      console.error('Error cargando trip', error);
      this.router.navigate(['/trips']);
    }
  }

  async onSubmit(): Promise<void> {
    console.log('onSubmit llamado');
    console.log('tripForm.invalid:', this.tripForm.invalid);
    console.log('tripForm.valid:', this.tripForm.valid);
    console.log('tripForm.value:', this.tripForm.value);

    const payload = this.tripForm.value;

    // Validar datos del formulario con validaciones personalizadas
    console.log('Llamando a validateFormData');
    const customValidationsPassed = this.validateFormData(payload);

    // Validar que el formulario sea válido según Angular
    const angularValidationsPassed = this.tripForm.valid;

    // Si no pasa las validaciones de Angular, marcar como touched para mostrar errores
    if (!angularValidationsPassed) {
      console.log('Formulario inválido según Angular, marcando como touched');
      this.tripForm.markAllAsTouched();
    }

    // Retornar si falla cualquiera de las validaciones
    if (!customValidationsPassed || !angularValidationsPassed) {
      console.log('Validaciones fallidas - Custom:', customValidationsPassed, 'Angular:', angularValidationsPassed);
      return;
    }

    this.isSubmitting = true;

    try {
      let successMessage = '';

      if (this.isEditMode && this.tripId) {
        // Modo edición: actualizar viaje existente
        const tripActualizado = await this.tripApi.updateTrip(this.tripId, payload);
        console.log('Viaje actualizado', tripActualizado);
        successMessage = extractSuccessMessage(tripActualizado, 'Viaje actualizado correctamente');
      } else {
        // Modo alta: crear nuevo viaje
        const tripCreado = await this.tripApi.createTrip(payload);
        console.log('Viaje creado', tripCreado);
        successMessage = extractSuccessMessage(tripCreado, 'Viaje creado correctamente');
      }

      this.showModal('¡Éxito!', successMessage, 'success', '/trips');
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      this.showModal('Error', errorMessage, 'error');
      console.error('Error procesando trip', error);
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
      this.tripState.resetForm();
    }
  }

  onCancel(): void {
    this.tripState.resetForm();
  }

  onBack(): void {
    this.tripState.resetForm();
    this.router.navigate(['/trips']);
  }

  /**
   * Validador personalizado para fechas
   * Verifica que start_date >= hoy y start_date < end_date
   */
  private validateDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) {
      return true; // Dejar que los validadores requeridos manejen valores vacíos
    }

    // Validar que start_date no sea en el pasado
    if (!validateDateNotPast(startDate)) {
      return false;
    }

    // Validar que start_date < end_date
    if (!validateDateRange(startDate, endDate)) {
      return false;
    }

    return true;
  }

  /**
   * Validador personalizado para costo por persona
   * Verifica que sea un número positivo dentro del rango permitido
   */
  private validateCost(cost: any): boolean {
    if (!cost) {
      return true; // Es opcional
    }

    const numValue = parseFloat(cost);

    if (isNaN(numValue) || numValue < 0) {
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
    console.log('Validando payload:', payload);

    // Validar rango de fechas
    if (!this.validateDateRange(payload.start_date, payload.end_date)) {
      if (!validateDateNotPast(payload.start_date)) {
        this.validationErrors['start_date'] = 'La fecha de inicio no puede ser en el pasado';
      } else {
        this.validationErrors['start_date'] = 'La fecha de inicio debe ser anterior a la fecha de fin';
      }
      return false;
    }

    // Validar costo por persona
    if (!this.validateCost(payload.cost_per_person)) {
      this.validationErrors['cost_per_person'] = 'El costo debe ser un número positivo';
      return false;
    }

    return true;
  }
}
