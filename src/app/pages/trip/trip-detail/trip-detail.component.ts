import { Component, inject, Input } from '@angular/core';
import { TripApiService } from '../../../services/api-rest/trip-rest.service';
import { ITrip } from '../../../interfaces/ITrip';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trip-detail',
  imports: [],
  styleUrl: './trip-detail.component.css',
  templateUrl: './trip-detail.component.html',
})
export class TripDetailComponent 
{
  tripService = inject(TripApiService);
	activatedRoute = inject(ActivatedRoute);

	tripId! : number;
  tripInfo! : ITrip;
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
    try 
    {  
      this.tripInfo = await this.tripService.getTrip(this.tripId);
    } 
    catch (error) 
    {
      console.log('Couldn`t get the trip info:' + error);
    }
  }
}
