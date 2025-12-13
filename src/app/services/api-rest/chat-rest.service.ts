import { Injectable } from '@angular/core';
import { IMessage } from '../../interfaces/IMessage';
import { ISurvey, ISurveyOption } from '../../interfaces/ISurvey';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  // Mock data - reemplazar con llamadas HTTP reales cuando backend esté listo
  private mockMessages: IMessage[] = [
    {
      id_message: 1,
      id_trip: 93,
      id_user: 136,
      user_name: 'Edunir Tijer',
      message: '¡Hola a todos! Muy emocionado por este viaje a Laponia 🌌',
      created_at: '2025-12-10 22:15:00'
    },
    {
      id_message: 2,
      id_trip: 93,
      id_user: 140,
      user_name: 'Jorge Ilegal',
      message: '¿Alguien ha estado antes en Finlandia? ¿Qué ropa recomendáis llevar?',
      created_at: '2025-12-11 09:30:00'
    },
    {
      id_message: 3,
      id_trip: 93,
      id_user: 136,
      user_name: 'Edunir Tijer',
      message: 'Hay que ir muy abrigado. Temperaturas bajo cero garantizadas. Recomiendo capas térmicas y buenos guantes.',
      created_at: '2025-12-11 10:45:00'
    },
    {
      id_message: 4,
      id_trip: 93,
      id_user: 142,
      user_name: 'Laura Martínez Ruiz',
      message: '¿Ya está confirmado el hotel? Me gustaría saber más detalles',
      created_at: '2025-12-11 14:20:00'
    }
  ];

  private nextId = 5;

  // Mock data para encuestas
  private mockSurveys: ISurvey[] = [
    {
      id_survey: 1,
      id_trip: 93,
      id_creator: 136,
      creator_name: 'Edunir Tijer',
      question: '¿Qué día preferís para la excursión a los renos?',
      options: [
        { id_option: 1, option_text: 'Día 1 por la mañana', vote_count: 2 },
        { id_option: 2, option_text: 'Día 2 por la tarde', vote_count: 1 },
        { id_option: 3, option_text: 'Día 3', vote_count: 0 }
      ],
      is_closed: false,
      created_at: '2025-12-11 15:00:00',
      user_voted_option: null
    }
  ];

  private nextSurveyId = 2;
  private nextOptionId = 4;

  // Registrar votos de usuarios (en memoria)
  private userVotes: Map<string, number> = new Map(); // key: "userId-surveyId", value: optionId

  constructor() {}

  /**
   * Obtiene todos los mensajes de un viaje específico
   * @param tripId ID del viaje
   * @returns Promise con array de mensajes organizados con sus respuestas
   */
  async getMessagesByTrip(tripId: number): Promise<IMessage[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filtrar mensajes por ID de viaje y ordenar por fecha (UTC)
    const allMessages = this.mockMessages
      .filter(msg => msg.id_trip === tripId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Organizar mensajes con jerarquía ilimitada
    const messageMap = new Map<number, IMessage>();
    const mainMessages: IMessage[] = [];
    
    // Primera pasada: crear mapa de todos los mensajes con replies vacío
    allMessages.forEach(msg => {
      messageMap.set(msg.id_message, { ...msg, replies: [] });
    });
    
    // Segunda pasada: organizar jerarquía (puede ser de cualquier nivel)
    allMessages.forEach(msg => {
      const message = messageMap.get(msg.id_message)!;
      if (msg.id_parent_message) {
        // Es una respuesta, agregarla al mensaje padre
        const parent = messageMap.get(msg.id_parent_message);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(message);
        } else {
          // Si no se encuentra el padre, tratarlo como mensaje principal
          mainMessages.push(message);
        }
      } else {
        // Es un mensaje principal
        mainMessages.push(message);
      }
    });

    return mainMessages;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.get<IMessage[]>(`${this.apiUrl}/trips/${tripId}/messages`).toPromise();
  }

  /**
   * Envía un nuevo mensaje al chat de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario que envía el mensaje
   * @param userName Nombre del usuario
   * @param message Contenido del mensaje
   * @param parentMessageId ID del mensaje padre (si es una respuesta)
   * @returns Promise con el mensaje creado
   */
  async sendMessage(
    tripId: number, 
    userId: number, 
    userName: string, 
    message: string,
    parentMessageId?: number
  ): Promise<IMessage> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    let parentMessage = null;
    if (parentMessageId) {
      const parent = this.mockMessages.find(m => m.id_message === parentMessageId);
      if (parent) {
        parentMessage = parent.message;
      }
    }

    const newMessage: IMessage = {
      id_message: this.nextId++,
      id_trip: tripId,
      id_user: userId,
      user_name: userName,
      message: message,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      id_parent_message: parentMessageId || null,
      parent_message: parentMessage,
      replies: []
    };

    this.mockMessages.push(newMessage);
    return newMessage;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post<IMessage>(`${this.apiUrl}/trips/${tripId}/messages`, {
    //   message: message,
    //   parent_message_id: parentMessageId
    // }).toPromise();
  }

  /**
   * Elimina un mensaje del chat
   * @param messageId ID del mensaje a eliminar
   * @returns Promise<void>
   */
  async deleteMessage(messageId: number): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.mockMessages.findIndex(msg => msg.id_message === messageId);
    if (index !== -1) {
      this.mockMessages.splice(index, 1);
    }

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`).toPromise();
  }

  // ===================== MÉTODOS DE ENCUESTAS =====================

  /**
   * Obtiene todas las encuestas de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario actual (para marcar su voto)
   * @returns Promise con array de encuestas
   */
  async getSurveysByTrip(tripId: number, userId: number): Promise<ISurvey[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filtrar encuestas por viaje y marcar el voto del usuario
    return this.mockSurveys
      .filter(survey => survey.id_trip === tripId)
      .map(survey => ({
        ...survey,
        user_voted_option: this.userVotes.get(`${userId}-${survey.id_survey}`) || null
      }));

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.get<ISurvey[]>(`${this.apiUrl}/trips/${tripId}/surveys`).toPromise();
  }

  /**
   * Crea una nueva encuesta
   * @param tripId ID del viaje
   * @param creatorId ID del creador
   * @param creatorName Nombre del creador
   * @param question Pregunta de la encuesta
   * @param optionTexts Array de textos para las opciones
   * @returns Promise con la encuesta creada
   */
  async createSurvey(
    tripId: number,
    creatorId: number,
    creatorName: string,
    question: string,
    optionTexts: string[]
  ): Promise<ISurvey> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const options: ISurveyOption[] = optionTexts.map(text => ({
      id_option: this.nextOptionId++,
      option_text: text,
      vote_count: 0
    }));

    const newSurvey: ISurvey = {
      id_survey: this.nextSurveyId++,
      id_trip: tripId,
      id_creator: creatorId,
      creator_name: creatorName,
      question: question,
      options: options,
      is_closed: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user_voted_option: null
    };

    this.mockSurveys.push(newSurvey);
    return newSurvey;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post<ISurvey>(`${this.apiUrl}/trips/${tripId}/surveys`, {
    //   question, options: optionTexts
    // }).toPromise();
  }

  /**
   * Vota en una encuesta
   * @param surveyId ID de la encuesta
   * @param userId ID del usuario que vota
   * @param optionId ID de la opción votada
   * @returns Promise con la encuesta actualizada
   */
  async voteSurvey(surveyId: number, userId: number, optionId: number): Promise<ISurvey> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const survey = this.mockSurveys.find(s => s.id_survey === surveyId);
    if (!survey) {
      throw new Error('Encuesta no encontrada');
    }

    if (survey.is_closed) {
      throw new Error('La encuesta está cerrada');
    }

    const voteKey = `${userId}-${surveyId}`;
    const previousVote = this.userVotes.get(voteKey);

    // Si ya votó, restar el voto anterior
    if (previousVote !== undefined) {
      const prevOption = survey.options.find(opt => opt.id_option === previousVote);
      if (prevOption && prevOption.vote_count > 0) {
        prevOption.vote_count--;
      }
    }

    // Agregar nuevo voto
    const option = survey.options.find(opt => opt.id_option === optionId);
    if (!option) {
      throw new Error('Opción no encontrada');
    }

    option.vote_count++;
    this.userVotes.set(voteKey, optionId);

    return {
      ...survey,
      user_voted_option: optionId
    };

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post<ISurvey>(`${this.apiUrl}/surveys/${surveyId}/vote`, {
    //   option_id: optionId
    // }).toPromise();
  }

  /**
   * Cierra una encuesta (solo el creador)
   * @param surveyId ID de la encuesta
   * @param userId ID del usuario (debe ser el creador)
   * @returns Promise<void>
   */
  async closeSurvey(surveyId: number, userId: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const survey = this.mockSurveys.find(s => s.id_survey === surveyId);
    if (!survey) {
      throw new Error('Encuesta no encontrada');
    }

    if (survey.id_creator !== userId) {
      throw new Error('Solo el creador puede cerrar la encuesta');
    }

    survey.is_closed = true;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.patch<void>(`${this.apiUrl}/surveys/${surveyId}/close`, {}).toPromise();
  }
}
