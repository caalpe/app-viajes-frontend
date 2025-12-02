export interface IRating {
  id_rating?: number;
  id_participation: number;
  id_rater: number; // Usuario que valora (creador del viaje)
  id_rated: number; // Usuario valorado (participante)
  rating: number; // 1-5
  comment?: string;
  created_at?: string;
}

export interface IRatingSubmit {
  rating: number;
  comment?: string;
}
