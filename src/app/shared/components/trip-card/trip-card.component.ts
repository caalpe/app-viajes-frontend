import { Component, Input } from '@angular/core';
import { ITrip } from '../../../interfaces/ITrip';
import { RouterLink } from '@angular/router';
import { formatDateDDMMYYYY } from '../../utils/data.utils';

export enum cardType
{
    none = "none",
    owner = "owner",
    accepted = "accepted",
    pending = "pending",
    rejected = "rejected",
    left = "left"

}

@Component({
  selector: 'app-trip-card',
  imports: [RouterLink],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent {
    hover: boolean = false;
    image : string = "https://www.mercurynews.com/wp-content/uploads/2021/04/SJM-L-ROADTRIP-0502-01.jpg?w=1024";

    cardType = cardType;
    @Input() type : cardType = cardType.none;
    @Input({required : true}) tripInfo! : ITrip;

    ngOnInit()
    {
    }

    ngAfterViewInit()
    {
        const observer = new ResizeObserver(entries =>
        {
            for (const entry of entries)
            {
              entry.target.parentElement!.style.height = entry.contentRect.height + "px";
            }
        });

        document.querySelectorAll('.card-image').forEach(img => observer.observe(img));
    }
    selectCardType() : string
    {
        switch(this.type)
        {
            case cardType.none:
                return "";
            case cardType.owner:
                return "Organizador";
            case cardType.accepted:
                return "Participante";
            case  cardType.pending:
                return "Pendiente";
            case  cardType.rejected:
                return "Rechazado";
            case  cardType.left:
                return "Abandonado";
        }
    }
    badgeClassMap: Record<cardType, string> =
    {
        [cardType.none]: "text-bg-secondary",
        [cardType.owner]: "text-bg-primary",
        [cardType.accepted]: "text-bg-success",
        [cardType.pending]: "text-bg-warning",
        [cardType.rejected]: "text-bg-danger",
        [cardType.left]: "text-bg-secondary",
    };

    changeDate(dateString : string | undefined) : string
    {
        if(dateString == undefined)
        {
        return "";
        }
        return formatDateDDMMYYYY(dateString);
    }
}
