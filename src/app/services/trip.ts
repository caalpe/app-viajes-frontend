import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ITrip as TripModel } from '../interfaces/ITrip';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'https://app-viajes-backend-amla.onrender.com/api/trips';

  constructor(private http: HttpClient) { }

  getTrips(status?: string): Observable<TripModel[]> {
    // Conectado con el backend real
    // NOTA: El servidor Render tarda ~15 segundos en la primera petición si estaba inactivo
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<{ data: TripModel[], pagination: any }>(this.apiUrl, { params }).pipe(
      map(response => response.data), // Extraer el array de viajes de la respuesta paginada
      catchError(error => {
        console.error('❌ Error al obtener viajes del backend:', error);
        console.warn('⚠️ Usando datos mock como fallback');
        // Si falla, devuelve datos mock como fallback
        return of(this.getMockData());
      })
    );
  }

  /** Datos mock de respaldo por si falla el backend */
  private getMockData(): TripModel[] {
    return [
      {
        id: 1,
        title: 'Escapada a Barcelona',
        price: '120€',
        priceNumber: 120,
        cost_per_person: 120,
        image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop',
        description: 'Costa mediterránea',
        departure: 'Madrid',
        destination: 'Barcelona',
        start_date: '2025-04-01',
        min_participants: 4,
        accepted_participants: 2,
        availableFrom: '2025-04-01',
        availableTo: '2025-10-31'
      },
      {
        id: 2,
        title: 'Ruta por Andalucía',
        price: '340€',
        priceNumber: 340,
        cost_per_person: 340,
        image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop',
        description: 'Sur de España',
        departure: 'Madrid',
        destination: 'Sevilla',
        start_date: '2025-03-15',
        min_participants: 6,
        accepted_participants: 4,
        availableFrom: '2025-03-15',
        availableTo: '2025-11-30'
      },
      {
        id: 3,
        title: 'Aventura en el Pirineo',
        price: '255€',
        priceNumber: 255,
        cost_per_person: 255,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        description: 'Montañas del norte',
        departure: 'Zaragoza',
        destination: 'Huesca',
        start_date: '2025-05-01',
        min_participants: 5,
        accepted_participants: 3,
        availableFrom: '2025-05-01',
        availableTo: '2025-09-30'
      }
    ];
  }
}
