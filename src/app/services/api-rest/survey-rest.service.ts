import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ISurvey, ISurveyOption } from '../../interfaces/ISurvey';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyRestService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/trips';
  private readonly surveysUrl = 'https://app-viajes-backend-amla.onrender.com/api/surveys';

  /**
   * Obtiene los headers con la autorización del token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Obtiene todas las encuestas de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario actual (para marcar su voto)
   * @returns Promise con array de encuestas
   */
  async getSurveysByTrip(tripId: number, userId: number): Promise<ISurvey[]> {
    const headers = this.getAuthHeaders();
    return await firstValueFrom(
      this.http.get<ISurvey[]>(`${this.baseUrl}/${tripId}/surveys`, { headers })
    );
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
    const headers = this.getAuthHeaders();
    const body = {
      question,
      options: optionTexts
    };

    return await firstValueFrom(
      this.http.post<ISurvey>(`${this.baseUrl}/${tripId}/surveys`, body, { headers })
    );
  }

  /**
   * Vota en una encuesta
   * @param surveyId ID de la encuesta
   * @param userId ID del usuario que vota
   * @param optionId ID de la opción votada
   * @returns Promise con la encuesta actualizada
   */
  async voteSurvey(surveyId: number, userId: number, optionId: number): Promise<ISurvey> {
    const headers = this.getAuthHeaders();
    const body = { id_option: optionId };

    return await firstValueFrom(
      this.http.post<ISurvey>(`${this.surveysUrl}/${surveyId}/vote`, body, { headers })
    );
  }

  /**
   * Cierra una encuesta (solo el creador)
   * @param surveyId ID de la encuesta
   * @param userId ID del usuario (debe ser el creador)
   * @returns Promise<void>
   */
  async closeSurvey(surveyId: number, userId: number): Promise<void> {
    const headers = this.getAuthHeaders();
    await firstValueFrom(
      this.http.patch<void>(`${this.surveysUrl}/${surveyId}/close`, {}, { headers })
    );
  }
}
