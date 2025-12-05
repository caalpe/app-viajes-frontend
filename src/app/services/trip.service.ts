import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ITrip } from '../interfaces/ITrip';
import {
  TRIP_TITLE_MAX_LENGTH,
  TRIP_DESCRIPTION_MAX_LENGTH,
  TRIP_DESTINATION_MAX_LENGTH,
  TRIP_TRANSPORT_INFO_MAX_LENGTH,
  TRIP_ACCOMMODATION_INFO_MAX_LENGTH,
  TRIP_ITINERARY_MAX_LENGTH,
  TRIP_MIN_PARTICIPANTS_MAX,
  TRIP_COST_PER_PERSON_MAX,
} from '../shared/constants/field-lengths.constants';

@Injectable({
  providedIn: 'root',
})
export class TripStateService {
  private fb = inject(FormBuilder);
  private tripForm: FormGroup | null = null;

  /** Crea el form con la estructura de la tabla `trips` */
  private createForm(): FormGroup {
    const form = this.fb.group({
      title: new FormControl<ITrip['title']>('', [Validators.required, Validators.minLength(3), Validators.maxLength(TRIP_TITLE_MAX_LENGTH)]),
      departure: new FormControl<string>('', [Validators.required]),
      destination: new FormControl<ITrip['destination']>('', [Validators.required, Validators.maxLength(TRIP_DESTINATION_MAX_LENGTH)]),
      description: new FormControl<ITrip['description']>('', [Validators.required, Validators.minLength(10), Validators.maxLength(TRIP_DESCRIPTION_MAX_LENGTH)]),
      start_date: new FormControl<ITrip['start_date']>('', [Validators.required]),
      end_date: new FormControl<ITrip['end_date']>('', [Validators.required]),
      cost_per_person: new FormControl<ITrip['cost_per_person']>(null, [Validators.required, Validators.min(0)]),
      min_participants: new FormControl<ITrip['min_participants']>(1, [Validators.required, Validators.min(1), Validators.max(TRIP_MIN_PARTICIPANTS_MAX)]),
      max_participants: new FormControl<ITrip['max_participants']>(null, [Validators.required, Validators.min(1)]),
      transport_info: new FormControl<ITrip['transport_info']>('', [Validators.maxLength(TRIP_TRANSPORT_INFO_MAX_LENGTH)]),
      accommodation_info: new FormControl<ITrip['accommodation_info']>('', [Validators.maxLength(TRIP_ACCOMMODATION_INFO_MAX_LENGTH)]),
      itinerary: new FormControl<ITrip['itinerary']>('', [Validators.maxLength(TRIP_ITINERARY_MAX_LENGTH)]),
      status: new FormControl<ITrip['status']>('open', [Validators.required]),
      image_url: new FormControl<string>(''),
    });

    // Validador cruzado: max_participants > min_participants
    form.valueChanges.subscribe(() => {
      const minCtrl = form.get('min_participants');
      const maxCtrl = form.get('max_participants');
      const minVal = Number(minCtrl?.value);
      const maxVal = Number(maxCtrl?.value);
      if (maxCtrl) {
        const errors = { ...(maxCtrl.errors || {}) };
        if (!isNaN(minVal) && !isNaN(maxVal) && maxVal <= minVal) {
          errors['greaterThanMin'] = true;
          maxCtrl.setErrors(errors);
        } else {
          if (errors['greaterThanMin']) {
            delete errors['greaterThanMin'];
            // If no other errors remain, clear; else set remaining
            if (Object.keys(errors).length === 0) {
              maxCtrl.setErrors(null);
            } else {
              maxCtrl.setErrors(errors);
            }
          }
        }
      }
    });

    return form;
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
