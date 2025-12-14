export interface ISurveyOption {
  id_option: number;
  option_text: string;
  vote_count: number;
}

export interface ISurvey {
  id_survey: number;
  id_trip: number;
  id_creator: number;
  creator_name: string;
  question: string;
  options: ISurveyOption[];
  is_closed: boolean;
  created_at: string;
  user_voted_option?: number | null; // ID de la opción que votó el usuario actual
}

export interface ISurveyVote {
  id_vote: number;
  id_survey: number;
  id_user: number;
  id_option: number;
  created_at: string;
}
