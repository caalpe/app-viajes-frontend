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
        img: 'https://source.unsplash.com/800x600/?barcelona', 
        description: 'Costa mediterránea', 
        departure: 'Madrid',
        destination: 'Barcelona',
        start_date: '2025-04-01',
        min_participants: 4,
        availableFrom: '2025-04-01', 
        availableTo: '2025-10-31' 
      },
      { 
        id: 2, 
        title: 'Ruta por Andalucía', 
        price: '340€', 
        priceNumber: 340, 
        cost_per_person: 340,
        img: 'https://source.unsplash.com/800x600/?andalucia', 
        description: 'Sur de España', 
        departure: 'Madrid',
        destination: 'Sevilla',
        start_date: '2025-03-15',
        min_participants: 6,
        availableFrom: '2025-03-15', 
        availableTo: '2025-11-30' 
      },
      { 
        id: 3, 
        title: 'Aventura en el Pirineo', 
        price: '255€', 
        priceNumber: 255, 
        cost_per_person: 255,
        img: 'https://source.unsplash.com/800x600/?mountains', 
        description: 'Montañas del norte', 
        departure: 'Zaragoza',
        destination: 'Huesca',
        start_date: '2025-05-01',
        min_participants: 5,
        availableFrom: '2025-05-01', 
        availableTo: '2025-09-30' 
      }
    ];

    return of(data).pipe(delay(300));
  }
}
