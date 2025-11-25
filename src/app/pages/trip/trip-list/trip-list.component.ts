import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cardType, TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';
import { RouterLink } from '@angular/router';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { UserApiService } from '../../../services/api-rest/user-rest.service';

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
    a = inject(UserApiService);

    userTrips : ITrip[] = [];

    ngOnInit()
    {
        this.loadUserTrips();
    }

    async loadUserTrips()
    {
        try 
        {
            
            const b = await this.a.getUsers();
            console.log(b);
        } catch (error) 
        {
            
        }

        //Load user created trips
        try 
        {

            this.userTrips = await this.tripService.getCreatedTrip();
            console.log(this.userTrips);
            
        } 
        catch (error) 
        {
            console.log("Error loading user created trips: " + error);
        }

        //Load user participation 
        try 
        {
            const participationsTrips = await this.tripService.getParticipationsTrip();
            console.log(this.userTrips);
        } 
        catch (error) 
        {
            console.log("Error loading trips where user send participation: " + error);
        }
        
    }
}
