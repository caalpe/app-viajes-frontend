import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { ITrip as TripModel } from '../interfaces/ITrip';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private apiUrl = 'https://app-viajes-backend-amla.onrender.com/api/trips';

  constructor(private http: HttpClient) { }

  getTrips(): Observable<TripModel[]> {
    // IMPORTANTE: Para usar la API real, descomenta la línea siguiente y comenta el bloque de datos mock
    // return this.http.get<TripModel[]>(this.apiUrl);
    // NOTA: El servidor Render tarda ~15 segundos en la primera petición si estaba inactivo
    
    // ============= DATOS MOCK PARA DESARROLLO =============
    // Comentar todo este bloque cuando la API esté lista y funcione correctamente
    const data: TripModel[] = [
      { 
        id: 1, 
        title: 'Escapada a Barcelona', 
        price: '120€', 
        priceNumber: 120, 
        cost_per_person: 120,
        img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop', 
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
        img: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&h=600&fit=crop', 
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
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', 
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

    return of(data).pipe(delay(300));
  }
}
