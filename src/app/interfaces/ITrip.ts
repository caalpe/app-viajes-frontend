export interface ITrip {
  id_trip?: number;
  id_creator?: number;
  title: string;
  description: string;
  departure?: string;
  destination?: string | null;
  start_date?: string;
  end_date?: string;
  cost_per_person?: number | null;
  min_participants: number;
  accepted_participants: number;
  transport_info?: string | null;
  accommodation_info?: string | null;
  itinerary?: string | null;
  status?: 'open' | 'closed' | 'completed';
  created_at?: string;
  updated_at?: string;
  creator_name?: string;
  image_url?: string;
  // UI / frontend convenience fields (optional)
  id?: number;
  price?: string;
  priceNumber?: number;
  availableFrom?: string;
  availableTo?: string;
}
