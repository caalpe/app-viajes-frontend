export interface IParticipant 
{
  id_participation: number;
  id_trip: number;
  id_user: number;
  status: participationStatus;
  message: string;
  created_at: string;
  updated_at: string;
}
export enum participationStatus
{
    pending = "pending",
    accepted = "accepted",
    rejected = "rejected",
    left = "left"
}

