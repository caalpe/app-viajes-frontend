import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
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
      title: new FormControl<string>('', [Validators.required, Validators.maxLength(150)]),
      description: new FormControl<string>('', [Validators.required]),
      destination: new FormControl<string>('', [Validators.required]),
      start_date: new FormControl<string>('', [Validators.required]),
      end_date: new FormControl<string>('', [Validators.required]),
      cost_per_person: new FormControl<number | null>(null),
      min_participants: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
      transport_info: new FormControl<string>(''),
      accommodation_info: new FormControl<string>(''),
      itinerary: new FormControl<string>(''),
      status: new FormControl<string>('open'),
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
