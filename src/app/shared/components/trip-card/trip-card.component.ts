import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-trip-card',
  imports: [],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent {
    hover: boolean = false;
    image : string = "https://www.mercurynews.com/wp-content/uploads/2021/04/SJM-L-ROADTRIP-0502-01.jpg?w=1024";
    title : string = "TRIP TITLE";
    startPoint : string = "Startpoint";
    endPoint : string = "Endpoint";
    date : string = "25/12/2025";
    participant : number = 3;
    maxParticipant : number = 6;

    @Input({ required: true}) owner : boolean = false;
}
