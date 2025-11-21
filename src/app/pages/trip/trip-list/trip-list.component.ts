import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cardType, TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';
import { RouterLink } from '@angular/router';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, TripCardComponent, RouterLink],
  styleUrl: './trip-list.component.css',
  templateUrl: './trip-list.component.html',
})
export class TripListComponent 
{
    cardType = cardType;

    tripService = inject(TripApiService);

    userTrips : ITrip[] = [];

    ngOnInit()
    {
        this.loadUserTrips();
    }

    async loadUserTrips()
    {
        try 
        {
            this.userTrips = await this.tripService.getTripsByCreator("Juan Manolito");
        } 
        catch (error) 
        {
            console.log("Error loading user trips: " + error);
        }
    }
}
