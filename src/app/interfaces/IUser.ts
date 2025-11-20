export interface IUser {
  id_user?: number;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  interests?: string | null;
  average_rating?: number;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
}
