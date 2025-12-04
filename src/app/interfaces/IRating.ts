export interface IRating {
  id_rating?: number;
  id_trip: number;
  id_reviewer: number; // Usuario que valora
  id_reviewed: number; // Usuario valorado
  score: number; // 1-10
  comment?: string;
  created_at?: string;
}

export interface IRatingSubmit {
  id_trip: number;
  id_reviewed: number;
  score: number;
  comment?: string;
}
