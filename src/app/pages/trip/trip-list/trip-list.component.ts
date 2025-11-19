import { Component } from '@angular/core';
import { TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';

@Component({
  selector: 'app-trip-list',
  imports: [TripCardComponent],
  styleUrl: './trip-list.component.css',
  templateUrl: './trip-list.component.html',
})
export class TripListComponent 
{

}
