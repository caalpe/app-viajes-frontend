import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { validateDateRange, validateDateNotPast } from '../../shared/utils/data.utils';
// Use a flexible model for the UI's mocked trips; backend uses `ITrip`.
type TripModel = any;
import { TripApiService } from '../../services/api-rest/trip-rest.service';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/api-rest/user-rest.service';
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
  totalPages = 1;
  totalItems = 0;
  pageSize = 9;
  currentPage$ = new BehaviorSubject<number>(1);
  destinations: string[] = [];
  minDate: string = '';
  minEndDate: string = '';
  private query$ = new BehaviorSubject<{ page: number; filters: any }>({ page: 1, filters: {} });

  userName: string | null = null;

  constructor(
    private tripApi: TripApiService,
    private fb: FormBuilder,
    private authService: AuthService,
    private userApi: UserApiService,
  ) {
    this.searchForm = fb.group({
      destination: [''],
      from: [''],
      to: [''],
      budget: ['', [Validators.min(0)]]
    }, { validators: this.dateRangeValidator() });
  }

  ngOnInit(): void {
        // Si está logado, obtener el nombre del usuario para el saludo
        if (this.authService.isLoggedIn()) {
          const uid = this.authService.getUserId();
          if (uid) {
            this.userApi.getUser(uid).then(u => {
              this.userName = u?.name || null;
            }).catch(() => {
              this.userName = null;
            });
          }
        }
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

    // Fuente: cuando se busca o cambia la página, pedir al backend paginado
    const pagedSource$ = this.query$.pipe(
      switchMap(({ page, filters }) => {
        const cost = filters?.budget ? Number(filters.budget) : undefined;
        return from(this.tripApi.getTripsPaged('open', page, this.pageSize, cost));
      })
    );

    // Aplicar filtros locales sobre el data paginado y exponer info de paginación
    this.trips$ = pagedSource$.pipe(
      map((resp: any) => {
        const trips = resp?.data || resp || [];
        const pagination = resp?.pagination;
        if (pagination) {
          this.totalPages = pagination.totalPages;
          this.totalItems = pagination.total;
          this.pageSize = pagination.pageSize;
        }
        console.log('Viajes paginados recibidos:', trips, 'pagination:', pagination);
        return this.filterTrips(trips, this.searchForm.value);
      })
    );

    // Obtener lista única de destinos (desde la primera página)
    this.tripApi.getTripsPaged('open', 1, this.pageSize).then(resp => {
      const trips = resp?.data || [];
      const uniqueDestinations = new Set<string>();
      trips.forEach(trip => {
        if (trip.destination) uniqueDestinations.add(trip.destination);
        if (trip.title) uniqueDestinations.add(trip.title);
      });
      this.destinations = Array.from(uniqueDestinations).sort();
    }).catch(err => {
      console.error('Error cargando destinos:', err);
    });
  }

  onSearch(): void {
    if (this.searchForm.valid) {
      this.currentPage$.next(1);
      this.query$.next({ page: 1, filters: this.searchForm.value });
    }
  }

  // Cambiar tamaño de página y reiniciar a la primera
  setPageSize(size: number): void {
    const parsed = Number(size);
    if (!isNaN(parsed) && parsed > 0) {
      this.pageSize = parsed;
      this.currentPage$.next(1);
      this.query$.next({ page: 1, filters: this.searchForm.value });
    }
  }

  // Navegación de páginas
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage$.next(page);
    this.query$.next({ page, filters: this.searchForm.value });
  }

  // Limpiar filtros y volver a primera página
  clearFilters(): void {
    this.searchForm.reset({ destination: '', from: '', to: '', budget: '' });
    this.currentPage$.next(1);
    this.query$.next({ page: 1, filters: this.searchForm.value });
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

      // Budget filter: compare against cost (primary), then fallbacks
      if (budget != null && !isNaN(budget)) {
        const cost =
          typeof t.cost === 'number' ? t.cost :
          typeof t.cost_per_person === 'number' ? t.cost_per_person :
          typeof t.priceNumber === 'number' ? t.priceNumber :
          (t.price ? Number(String(t.price).replace(/[^0-9.-]+/g, '')) : NaN);
        if (!isFinite(cost) || cost > budget) return false;
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
