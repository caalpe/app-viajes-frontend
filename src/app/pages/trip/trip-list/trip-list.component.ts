import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, RouterLink],
  styleUrl: './trip-list.component.css',
  templateUrl: './trip-list.component.html',
})
export class TripListComponent { }
