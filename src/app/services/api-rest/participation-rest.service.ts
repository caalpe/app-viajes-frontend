import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IParticipant, IParticipantInfo, participationStatus } from '../../interfaces/IParticipant';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ParticipationApiService
{
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/participants';

    /**
   * Obtiene los headers con la autorización del token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('🛫 TripApiService - Token obtenido de AuthService:', token);
    return new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });
  }
  /**
  * VER UNA DETERMINADA SOLICITUD
  * GET /api/participants/:participation_id/
  */
  getParticipation(participantId : number): Promise<IParticipant[]>
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/${participantId}`));
  }

  /**
  * VER SOLICITUDES/PARTICIPANTES DE UN VIAJE ACEPTADAS, PENDIENTES,
  * RECHAZADAS Y ABANDONADAS (TODAS)
  * GET /api/participants/trip/:trip_id/
  */
  getTripParticipations(tripId : number): Promise<IParticipant[]>
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/trip/${tripId}`, { headers: this.getAuthHeaders() }));
  }

  /**
  * VER INFORMACION DE PARTICIPANTES DE UN VIAJE
  * AL AÑADIR UN TOKEN DEVUELVE MAS INFORMACION
  * GET /api/participants/trip-info/:trip_id/
  */
  getTripParticipantInformation(tripId : number)
  {
    return firstValueFrom(this.http.get<IParticipantInfo[]>(`${this.baseUrl}/trip-info/${tripId}`, { headers: this.getAuthHeaders() }));
  }

  /**
  * VER SOLICITUDES/PARTICIPANTES DE UN VIAJE POR ESTADO
  * GET /api/participants/trip/:trip_id?status=pending
  * {pending, accepted, rejected, left}
  */
  getTripParticipationsByStatus(tripId : number, status : participationStatus): Promise<IParticipant[]>
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/trip/${tripId}`, { params,  headers: this.getAuthHeaders() }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENE UN USUARIO COMO SOLICITANTE
  * GET /api/participants/my-requests
  */
  getUserParticipationRequests(): Promise<IParticipant[]>
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-requests`, { headers: this.getAuthHeaders() }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENE UN USUARIO COMO SOLICITANTE
  * POR ESTADO
  * GET /api/participants/my-requests?status=pending
  */
  getUserParticipationRequestsByStatus(status : participationStatus): Promise<IParticipant[]>
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-requests`, { params, headers: this.getAuthHeaders() }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENEN TODOS LOS VIAJES
  * QUE HE CREADO
  * GET /api/participants/my-creator-requests
  */
  getParticipationRequestsForMyTrips(): Promise<IParticipant[]>
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-creator-requests`, { headers: this.getAuthHeaders() }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENEN TODOS LOS VIAJES
  * QUE HE CREADO
  * GET /api/participants/my-creator-requests?status=pending
  * {pending, accepted, rejected, left}
  */
  getParticipationRequestsForMyTripsByStatus(status : participationStatus): Promise<IParticipant[]>
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-creator-requests`, { params, headers: this.getAuthHeaders() }));
  }

  /**
  * CREAR UNA SOLICITUD DE PARTICIPACIÓN  PARA UN VIAJE
  * POST /api/participants/:trip_id
  */
  createParticipationRequest(tripId : number, message : string): Promise<IParticipant>
  {
    return firstValueFrom(this.http.post<IParticipant>(`${this.baseUrl}/${tripId}`, message, { headers: this.getAuthHeaders() }));
  }

  /**
  * CAMBIAR EL ESTADO DE UNA SOLICITUD/PARTICIPANTE DE UN VIAJE
  * PATCH /api/participants/:participation_id
  * {pending, accepted, rejected, left}
  */
  updateParticipationStatus(participationId : number, status : participationStatus): Promise<IParticipant>
  {
    return firstValueFrom(this.http.patch<IParticipant>(`${this.baseUrl}/${participationId}`, status, { headers: this.getAuthHeaders() }));
  }
}
