import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ITrip as TripModel } from '../interfaces/ITrip';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor() { }

  getTrips(): Observable<TripModel[]> {
    // Mocked data: replace with real HTTP call when backend is ready
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
