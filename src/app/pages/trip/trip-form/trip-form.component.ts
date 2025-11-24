import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TripStateService } from '../../../services/trip.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { getIdFromRoute } from '../../../shared/utils/route.utils';

@Component({
  selector: 'app-trip-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './trip-form.component.css',
  templateUrl: './trip-form.component.html',
})
export class TripFormComponent implements OnInit {
  private tripState = inject(TripStateService);
  private tripApi = inject(TripApiService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  tripForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  tripId: number | null = null;

  ngOnInit(): void {
    // El FormGroup viene del state service
    this.tripForm = this.tripState.getForm();

    // Verificar si estamos en modo edición
    this.loadEditModeData();

    // TODO: Remover - Solo para pruebas
    console.log('URL actual:', this.router.url);
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
      // Llenar el formulario con los datos del viaje
      this.tripState.patchForm(trip);
    } catch (error) {
      console.error('Error cargando trip', error);
      this.router.navigate(['/trips']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.tripForm.value;

    try {
      if (this.isEditMode && this.tripId) {
        // Modo edición: actualizar viaje existente
        const tripActualizado = await this.tripApi.updateTrip(this.tripId, payload);
        console.log('Trip actualizado', tripActualizado);
      } else {
        // Modo alta: crear nuevo viaje
        const tripCreado = await this.tripApi.createTrip(payload);
        console.log('Trip creado', tripCreado);
      }
      // Navegar a la lista de viajes después de crear/editar
      this.router.navigate(['/trips']);
    } catch (error) {
      console.error('Error procesando trip', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel(): void {
    this.tripState.resetForm();
  }

  onBack(): void {
    this.tripState.resetForm();
    this.router.navigate(['/trips']);
  }
}
