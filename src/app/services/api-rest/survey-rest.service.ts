import { Injectable } from '@angular/core';
import { ISurvey, ISurveyOption } from '../../interfaces/ISurvey';

@Injectable({
  providedIn: 'root'
})
export class SurveyRestService {
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
