import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ITrip } from '../interfaces/ITrip';

@Injectable({
  providedIn: 'root',
})
export class TripStateService {
  private fb = inject(FormBuilder);
  private tripForm: FormGroup | null = null;

  /** Crea el form con la estructura de la tabla `trips` */
  private createForm(): FormGroup {
    return this.fb.group({
      title: new FormControl<ITrip['title']>('', [Validators.required, Validators.maxLength(150)]),
      description: new FormControl<ITrip['description']>('', [Validators.required]),
      origin: new FormControl<ITrip['origin']>('', [Validators.required]),
      destination: new FormControl<ITrip['destination']>(''),
      start_date: new FormControl<ITrip['start_date']>('', [Validators.required]),
      end_date: new FormControl<ITrip['end_date']>('', [Validators.required]),
      cost_per_person: new FormControl<ITrip['cost_per_person']>(null),
      min_participants: new FormControl<ITrip['min_participants']>(1, [Validators.required, Validators.min(1)]),
      transport_info: new FormControl<ITrip['transport_info']>(''),
      accommodation_info: new FormControl<ITrip['accommodation_info']>(''),
      itinerary: new FormControl<ITrip['itinerary']>(''),
      status: new FormControl<ITrip['status']>('open'),
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
