export interface ITrip {
  id_trip?: number;
  id_creator?: number;
  title: string;
  description: string;
  origin: string;
  destination?: string | null;
  departure: string;
  start_date: string;
  end_date: string;
  cost_per_person?: number | string | null;
  min_participants: number;
  transport_info?: string | null;
  accommodation_info?: string | null;
  itinerary?: string | null;
  status?: 'open' | 'closed' | 'completed';
  created_at?: string;
  updated_at?: string;
  creator_name?: string;
}