export interface ITrip {
  id?: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  cost_per_person: number | null;
  min_participants: number;
  transport_info: string;
  accommodation_info: string;
  itinerary: string;
  status: string;
}
