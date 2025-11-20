import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, RouterLink, TripCardComponent],
  styleUrl: './trip-list.component.css',
  templateUrl: './trip-list.component.html',
})
export class TripListComponent 
{

}
