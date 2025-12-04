import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { validateDateRange, validateDateNotPast } from '../../shared/utils/data.utils';
// Use a flexible model for the UI's mocked trips; backend uses `ITrip`.
type TripModel = any;
import { TripService } from '../../services/trip';
import { TripApiService } from '../../services/api-rest/trip-rest.service';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  features = [
    { title: 'Explora destinos', desc: 'Encuentra viajes hechos a tu medida.' },
    { title: 'Reservas seguras', desc: 'Transacciones protegidas y confirmaciones instantáneas.' },
    { title: 'Soporte 24/7', desc: 'Asistencia antes, durante y después del viaje.' }
  ];

  searchForm: FormGroup;
  trips$!: Observable<TripModel[]>;
  destinations: string[] = [];
  minDate: string = '';
  minEndDate: string = '';
  private searchTrigger$ = new BehaviorSubject<any>({});

  constructor(private tripService: TripService, private tripApi: TripApiService, private fb: FormBuilder) {
    this.searchForm = fb.group({
      destination: [''],
      from: [''],
      to: [''],
      budget: ['', [Validators.min(0)]]
    }, { validators: this.dateRangeValidator() });
  }

  ngOnInit(): void {
    // Establecer la fecha mínima como hoy en formato YYYY-MM-DD
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.minEndDate = this.minDate;

    // Suscribirse a cambios en from para actualizar minEndDate
    this.searchForm.get('from')?.valueChanges.subscribe((fromDate: string) => {
      if (fromDate) {
        this.minEndDate = fromDate;
      } else {
        this.minEndDate = this.minDate;
      }
    });

    const initialTrips$ = this.tripService.getTrips('open');

    // Origen de datos según el estado del formulario cuando se pulsa buscar
    const queriedTrips$ = this.searchTrigger$.pipe(
      switchMap(() => {
        const fromDate: string | undefined = this.searchForm.get('from')?.value || undefined;
        const toDate: string | undefined = this.searchForm.get('to')?.value || undefined;

        if (fromDate || toDate) {
          const dateToQuery = toDate || fromDate!;
          return from(this.tripApi.getTripsByDate(dateToQuery)).pipe(
            // En caso de error, volver al listado inicial
            switchMap(apiTrips => of(apiTrips)),
          );
        }
        // Sin fechas: usar listado inicial
        return initialTrips$;
      })
    );

    // Filtrar resultados según el formulario
    this.trips$ = queriedTrips$.pipe(
      map((trips: TripModel[]) => {
        console.log('Viajes recibidos:', trips);
        return this.filterTrips(trips, this.searchForm.value);
      })
    );

    // Obtener lista única de destinos (desde el listado inicial)
    initialTrips$.subscribe(trips => {
      const uniqueDestinations = new Set<string>();
      trips.forEach(trip => {
        if (trip.destination) uniqueDestinations.add(trip.destination);
        if (trip.title) uniqueDestinations.add(trip.title);
      });
      this.destinations = Array.from(uniqueDestinations).sort();
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.searchTrigger$.next(this.searchForm.value);
    }
  }

  private filterTrips(trips: TripModel[], form: any): TripModel[] {
    const dest = (form.destination || '').toString().trim().toLowerCase();
    const from = form.from ? new Date(form.from) : null;
    const to = form.to ? new Date(form.to) : null;
    const budget = form.budget ? Number(form.budget) : null;

    return trips.filter(t => {
      // Destination filter (title or description)
      if (dest) {
        const hay = (t.title + ' ' + (t.description || '')).toLowerCase();
        if (!hay.includes(dest)) return false;
      }

      // Budget filter (use numeric price if available)
      if (budget != null && !isNaN(budget)) {
        const price = typeof t.priceNumber === 'number' ? t.priceNumber : (t.price ? Number(t.price.replace(/[^0-9.-]+/g, '')) : NaN);
        if (!isFinite(price) || price > budget) return false;
      }

      // Date overlap: trip availableFrom..availableTo must overlap with requested from..to
      if (from || to) {
        const tripFrom = t.availableFrom ? new Date(t.availableFrom) : null;
        const tripTo = t.availableTo ? new Date(t.availableTo) : null;

        if (from && tripTo && tripTo < from) return false; // trip ends before requested start
        if (to && tripFrom && tripFrom > to) return false; // trip starts after requested end
      }

      return true;
    });
  }

  private dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fromVal = control.get('from')?.value;
      const toVal = control.get('to')?.value;
      if (fromVal && toVal && !validateDateRange(fromVal, toVal)) {
        return { dateRange: true };
      }
      return null;
    };
  }

  // convenience getters for template
  get budgetControl() { return this.searchForm.get('budget'); }
  get fromControl() { return this.searchForm.get('from'); }
  get toControl() { return this.searchForm.get('to'); }
}
