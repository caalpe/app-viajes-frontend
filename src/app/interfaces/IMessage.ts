export interface IMessage {
  id_message: number;
  id_trip: number;
  id_user: number;
  user_name: string;
  message: string;
  created_at: string;
  id_parent_message?: number | null; // ID del mensaje al que responde
  parent_message?: string | null; // Texto del mensaje padre (opcional)
  replies?: IMessage[]; // Respuestas a este mensaje
}
