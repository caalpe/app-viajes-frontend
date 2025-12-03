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
import { FormControl, FormGroup, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-detail',
  imports: [CommonModule, RouterLink, SpinnerComponent, ɵInternalFormsSharedModule, ReactiveFormsModule],
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

  userIsOwner         	: boolean = false; //To display if its the owner
  userHasSendRequest  	: boolean = false; //To know when the user has "Send" a new request to the trip he is seeing 
	userRequestIsAccepted	: boolean = false; //To dispplay the button for more information in participants
  requestingPetition  	: boolean = false; //To start the animation when the user sends the request
  showForm      				: boolean = false; //To show de form when the user hits the "send request" button

  pageLoaded          	: boolean = false; //To load the page when all the promises comes 

  animationTimeOut : number = 500;//ms

	petitionForm = new FormGroup
	({
  	text: new FormControl<string>('')   // este será el textarea
  });
  
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
					//Check if the request is accepted
					if(this.userTripParticipation.status == participationStatus.accepted)
					{
						this.userRequestIsAccepted = true;
					}
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
      this.showForm = true;  
    }, this.animationTimeOut);
  }

  async sendPetitionButtonPressed()
  {
		console.log(this.petitionForm.value);
		try 
		{
			console.log(this.tripId);
			this.userTripParticipation = await this.participationService.createParticipationRequest(this.tripId, this.petitionForm.get("text")?.value ?? "");	
		} 
		catch (error) 
		{
			console.log("Couldn't send the participation petition:", error);
			//TODO:modal to warm the user that something whent wrong he will need to retry
		}

		if(this.userTripParticipation)
		{
			//TODO MODAL PARA AVISAR DE QUE LA PETICION HA SIDO ENVIADA
			
			//refres the card info
			this.userHasSendRequest = true;
		}
		this.cancelPetitionButtonPressed();
  }

  cancelPetitionButtonPressed()
  {
    this.showForm = false;
    this.requestingPetition = false;
		this.petitionForm.reset();
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
