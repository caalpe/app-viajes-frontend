import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// Use a flexible model for the UI's mocked trips; backend uses `ITrip`.
type TripModel = any;
import { TripService } from '../../services/trip';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features = [
    { title: 'Explora destinos', desc: 'Encuentra viajes hechos a tu medida.' },
    { title: 'Reservas seguras', desc: 'Transacciones protegidas y confirmaciones instantáneas.' },
    { title: 'Soporte 24/7', desc: 'Asistencia antes, durante y después del viaje.' }
  ];

  searchForm: FormGroup;
  trips$!: Observable<TripModel[]>;
  destinations: string[] = [];
  private searchTrigger$ = new BehaviorSubject<any>({});

  constructor(private tripService: TripService, fb: FormBuilder) {
    this.searchForm = fb.group({
      destination: [''],
      from: [''],
      to: [''],
      budget: ['', [Validators.min(0)]]
    }, { validators: this.dateRangeValidator() });

    const tripsSource$ = this.tripService.getTrips();

    // Filtrar solo cuando se dispara la búsqueda
    this.trips$ = combineLatest([tripsSource$, this.searchTrigger$]).pipe(
      map(([trips, _]) => this.filterTrips(trips, this.searchForm.value))
    );

    // Obtener lista única de destinos
    tripsSource$.subscribe(trips => {
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
      if (fromVal && toVal) {
        const fromDate = new Date(fromVal);
        const toDate = new Date(toVal);
        if (fromDate > toDate) {
          return { dateRange: true };
        }
      }
      return null;
    };
  }

  // convenience getters for template
  get budgetControl() { return this.searchForm.get('budget'); }
  get fromControl() { return this.searchForm.get('from'); }
  get toControl() { return this.searchForm.get('to'); }
}
