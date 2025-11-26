import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cardType, TripCardComponent } from '../../../shared/components/trip-card/trip-card.component';
import { Router, RouterLink } from '@angular/router';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { ParticipationApiService } from '../../../services/api-rest/participation-rest.service';
import { IParticipant, participationStatus } from '../../../interfaces/participant';
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
    tripIdToEdit: number = 2; // Por defecto id 2
    isLoadingTrip = false;

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

    async onEditTrip(): Promise<void>
    {
        if (!this.tripIdToEdit || this.tripIdToEdit <= 0) {
            alert('Por favor ingresa un ID de viaje válido');
            return;
        }

        this.isLoadingTrip = true;

        try {
            const trip = await this.tripService.getTrip(this.tripIdToEdit);
            console.log('Viaje cargado para editar:', trip);
            // Navegar a trip-form con el id
            this.router.navigate([`/trips/${this.tripIdToEdit}/edit`]);
        } catch (error) {
            console.error('Error cargando viaje:', error);
            alert('No se pudo cargar el viaje. Verifica el ID e intenta de nuevo.');
        } finally {
            this.isLoadingTrip = false;
        }
    }
}