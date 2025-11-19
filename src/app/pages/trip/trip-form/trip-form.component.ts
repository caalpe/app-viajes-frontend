import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TripStateService } from '../../../services/trip.service';
import { FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';

@Component({
  selector: 'app-trip-form',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './trip-form.component.css',
  templateUrl: './trip-form.component.html',
})
export class TripFormComponent implements OnInit {
  private tripState = inject(TripStateService);
  private tripApi = inject(TripApiService);
  private router = inject(Router);

  tripForm!: FormGroup;
  isSubmitting = false;

  ngOnInit(): void {
    // El FormGroup viene del state service
    this.tripForm = this.tripState.getForm();
  }

  async onSubmit(): Promise<void> {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.tripForm.value;

    try {
      const tripCreado = await this.tripApi.createTrip(payload);
      console.log('Trip creado', tripCreado);
      // Navegar a la lista de viajes después de crear
      this.router.navigate(['/trips']);
    } catch (error) {
      console.error('Error creando trip', error);
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
