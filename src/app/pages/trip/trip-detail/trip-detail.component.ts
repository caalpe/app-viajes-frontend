import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipationApiService } from '../../../services/api-rest/participation-rest.service';
import { IParticipant, IParticipantInfo, participationStatus } from '../../../interfaces/participant';
import { convertIsoToDateInputFormat } from '../../../shared/utils/data.utils';
import { AuthService } from '../../../services/auth.service';
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-trip-detail',
  imports: [CommonModule, RouterLink, SpinnerComponent],
  styleUrl: './trip-detail.component.css',
  templateUrl: './trip-detail.component.html',
})
export class TripDetailComponent 
{
	activatedRoute        = inject(ActivatedRoute);
  tripService           = inject(TripApiService);
  participationService  = inject(ParticipationApiService);
  authService           = inject(AuthService);

	tripId! : number;
  tripInfo! : ITrip;
  tripParticipantsInfo : IParticipantInfo[] = [];
  userParticipationRequests : IParticipant[] = [];
  userTripParticipation? : IParticipant;
  image : string = "https://www.mercurynews.com/wp-content/uploads/2021/04/SJM-L-ROADTRIP-0502-01.jpg?w=1024";

  userIsOwner         : boolean = false;
  userHasSendRequest  : boolean = false
  pageLoaded          : boolean = false;
  requestingPetition  : boolean = false;
  showMessageBox      : boolean = false;

  animationTimeOut : number = 500;//ms
  
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
      this.tripParticipantsInfo = await this.participationService.getTripParticipantInformation(this.tripId);
    } 
    catch (error) 
    {
      console.log('Couldn`t get the trip participants:' + error);
    }

    //Get user petitions to check if he already sended one
    try 
    {
      this.userParticipationRequests = await this.participationService.getUserParticipationRequests();
    } 
    catch (error) 
    {
      console.log('Couldn`t get the trip participants:' + error);
    }

    //Check if the user seeing this trip is the owner
    let userID = this.authService.getUserId();
    if(userID)
    {
      if(userID == this.tripInfo.id_creator)
      {
        this.userIsOwner = true;
      }
      else
      {
        //Check if the user has sent petition
        this.userTripParticipation = this.userParticipationRequests.find((value) =>
        {
          return value.id_trip == this.tripId;
        })
        if(this.userTripParticipation)
        {
          this.userHasSendRequest = true;
        }
      }
    }
    //Page loaded, we can show it 
    this.pageLoaded = true;
  }

  changeDate(dateString : string | undefined) : string
  {
    if(dateString == undefined)
    {
      return "";
    }
    return convertIsoToDateInputFormat(dateString);
  }

  changePetitionText() : string
  {
    switch(this.userTripParticipation?.status)
    {
      case(participationStatus.pending):
        return "Pendiente"
      case(participationStatus.accepted):
        return "Aceptado"
      case(participationStatus.rejected):
        return "Rechazado"
      case(participationStatus.left):
        return "Abandonado"
    }
    return "";
  }

  petitionButtonPressed()
  {
    this.requestingPetition = true;
    
    setTimeout(() => 
    {
      this.showMessageBox = true;  
    }, this.animationTimeOut);
  }

  sendPetitionButtonPressed()
  {

  }

  cancelPetitionButtonPressed()
  {
    this.showMessageBox = false;
    this.requestingPetition = false;
  }

  get participationClass(): string 
  {
    const status = this.userTripParticipation?.status ?? participationStatus.pending;
    return this.participationStatusMap[status];
  }

  participationStatusMap: Record<participationStatus, string> = 
  {
      [participationStatus.pending]: "text-bg-info",
      [participationStatus.accepted]: "text-bg-success",
      [participationStatus.rejected]: "text-bg-danger",
      [participationStatus.left]: "text-bg-secondary",
  };
}
