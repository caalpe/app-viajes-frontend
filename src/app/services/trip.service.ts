import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class TripStateService {
  private fb = inject(FormBuilder);
  private tripForm: FormGroup | null = null;

  /** Crea el form con la estructura de la tabla `trips` */
  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      cost_per_person: [null],
      min_participants: [1, [Validators.required, Validators.min(1)]],
      transport_info: [''],
      accommodation_info: [''],
      itinerary: [''],
      status: ['open'],
    });
  }

  /** Devuelve siempre el mismo FormGroup (lo crea si no existe) */
  getForm(): FormGroup {
    if (!this.tripForm) {
      this.tripForm = this.createForm();
    }
    return this.tripForm;
  }

  resetForm(): void {
    if (this.tripForm) {
      this.tripForm.reset({
        min_participants: 1,
        status: 'open',
      });
    }
  }

  patchForm(value: Partial<any>): void {
    if (this.tripForm) {
      this.tripForm.patchValue(value);
    }
  }
}
