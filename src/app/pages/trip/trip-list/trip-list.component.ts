import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cardType, TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';
import { Router, RouterLink } from '@angular/router';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { ParticipationApiService } from '../../../services/api-rest/participation-rest.service';
import { IParticipant } from '../../../interfaces/IParticipant';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-list',
  imports: [CommonModule, TripCardComponent, RouterLink, FormsModule],
  styleUrl: './trip-list.component.css',
  templateUrl: './trip-list.component.html',
})
export class TripListComponent
{
    cardType = cardType;

    tripService = inject(TripApiService);
    participationService = inject(ParticipationApiService);
    private router = inject(Router);

    userTrips : ITrip[] = [];
    userPetitionsTrips : ITrip[] = [];
    userPetitions : IParticipant[] = [];
    allTrips: ITrip[] = [];

    ngOnInit()
    {
        this.loadUserTrips();
        this.loadAllTrips();
    }

    async loadAllTrips(): Promise<void>
    {
        try
        {
            this.allTrips = await this.tripService.getAllTripsWithAuth();
            console.log('📋 Todos los viajes (con autenticación):');
            console.log(JSON.stringify(this.allTrips, null, 2));
            console.table(this.allTrips);
        }
        catch (error)
        {
            console.error('Error cargando todos los viajes:', error);
        }
    }

    async loadUserTrips()
    {
        //Load user created trips
        try
        {
            this.userTrips = await this.tripService.getCreatedTrip();
        }
        catch (error)
        {
            console.log("Error loading user created trips: " + error);
        }

        //Load user participation
        try
        {
            this.userPetitionsTrips = await this.tripService.getParticipationsTrip();
        }
        catch (error)
        {
            console.log("Error loading trips where user send participation: " + error);
        }

        //Get user petitions to know the status of them
        try
        {
            this.userPetitions = await this.participationService.getUserParticipationRequests();
        }
        catch (error)
        {
            console.log("Error loading trips where user send participation: " + error);
        }
    }

    getTripPetitionType(tripId? : number) : cardType
    {
        let tripPetition = this.userPetitions.find(({ id_trip }) => id_trip === tripId);

        if(tripPetition)
        {
            return cardType[tripPetition.status];
        }
        return cardType.none;
    }
}
