import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ITrip as TripModel } from '../interfaces/trip';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  constructor() { }

  getTrips(): Observable<TripModel[]> {
    // Mocked data: replace with real HTTP call when backend is ready
    const data: TripModel[] = [
      { id: 1, title: 'Escapada a Barcelona', price: '120€', priceNumber: 120, img: 'https://source.unsplash.com/800x600/?barcelona', description: 'Disfruta la arquitectura y la playa.', availableFrom: '2025-04-01', availableTo: '2025-10-31' },
      { id: 2, title: 'Ruta por Andalucía', price: '340€', priceNumber: 340, img: 'https://source.unsplash.com/800x600/?andalucia', description: 'Cultura, sol y gastronomía.', availableFrom: '2025-03-15', availableTo: '2025-11-30' },
      { id: 3, title: 'Aventura en el Pirineo', price: '255€', priceNumber: 255, img: 'https://source.unsplash.com/800x600/?mountains', description: 'Trekking y naturaleza pura.', availableFrom: '2025-05-01', availableTo: '2025-09-30' }
    ];

    return of(data).pipe(delay(300));
  }
}
