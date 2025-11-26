import { Component, inject, Input } from '@angular/core';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { ActivatedRoute } from '@angular/router';
import { ParticipationApiService } from '../../../services/api-rest/participation-rest.service';
import { IParticipant } from '../../../interfaces/participant';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
import { IUser } from '../../../interfaces/IUser';
import { changeISODate } from '../../../shared/utils/data.utils';

@Component({
  selector: 'app-trip-detail',
  imports: [],
  styleUrl: './trip-detail.component.css',
  templateUrl: './trip-detail.component.html',
})
export class TripDetailComponent 
{
	activatedRoute        = inject(ActivatedRoute);
  tripService           = inject(TripApiService);
  participationService  = inject(ParticipationApiService);
  userService           = inject(UserApiService);

	tripId! : number;
  tripInfo! : ITrip;
  tripParticipants : IParticipant[] = [];
  tripParticipantsInfo : IUser[] = [];
  image : string = "https://www.mercurynews.com/wp-content/uploads/2021/04/SJM-L-ROADTRIP-0502-01.jpg?w=1024";

  
  ngOnInit()
  {
		//Get the tripId
		this.activatedRoute.params.subscribe(params => 
		{
 			this.tripId = params['id'];
 		});

    this.loadTrip();
  }

  async loadTrip()
  {
    //Load trip information
    try 
    {  
      this.tripInfo = await this.tripService.getTrip(this.tripId);
      
      console.log(this.tripInfo);
    } 
    catch (error) 
    {
      console.log('Couldn`t get the trip info:' + error);
    }
    //Load participation information
    try 
    {
      this.tripParticipants = await this.participationService.getTripParticipations(this.tripId);
    } 
    catch (error) 
    {
      console.log('Couldn`t get the trip participants:' + error);
    }
    //Get participations name
    for(var i = 0; i < this.tripParticipants.length; i++)
    {
      try 
      {
        this.tripParticipantsInfo.push( await this.userService.getUser(this.tripParticipants[i].id_user));
      } 
      catch (error) 
      {
        console.log(`Couldn't get the trip participants ${this.tripParticipants[i].id_user} information:` + error);
      }
    }

    //Check if the user seeing this trip is the owner
  }

  changeDate(dateString : string) : string
  {
    return changeISODate(dateString);
  }
}
