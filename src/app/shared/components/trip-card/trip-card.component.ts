import { Component, Input } from '@angular/core';
import { ITrip } from '../../../interfaces/ITrip';

export enum cardType
{
    none = "none",
    owner = "owner",
    participant = "participant",
    pending = "pending",

}

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

    cardType = cardType;
    @Input() type : cardType = cardType.none;
    @Input({required : true}) tripInfo! : ITrip;
    
    ngOnInit()
    {
    }

    selectCardType() : string
    {
        switch(this.type)
        {
            case cardType.none:
                return "";
            case cardType.owner:
                return "Organizador";
            case cardType.participant:
                return "Participante";
            case  cardType.pending:
                return "Pendiente";
        }
    }
    badgeClassMap: Record<cardType, string> = 
    {
        [cardType.none]: "text-bg-secondary",
        [cardType.owner]: "text-bg-primary",
        [cardType.participant]: "text-bg-success",
        [cardType.pending]: "text-bg-warning",
    };

}
