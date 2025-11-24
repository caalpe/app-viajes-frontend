import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IParticipant, participationStatus } from '../../interfaces/participant';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipationRestService 
{
  private http = inject(HttpClient);
  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/participants';

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
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/trip/${tripId}`));
  }

  /**
  * VER SOLICITUDES/PARTICIPANTES DE UN VIAJE POR ESTADO
  * GET /api/participants/trip/:trip_id?status=pending
  * {pending, accepted, rejected, left}
  */
  getTripParticipationsByStatus(tripId : number, status : participationStatus): Promise<IParticipant[]> 
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/trip/${tripId}`, { params }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENE UN USUARIO COMO SOLICITANTE
  * GET /api/participants/my-requests
  * TODO: CAMBIAR ESTA FUNCION YA QUE ESTA AUN EN TESTEO EN BACKEND
  */
  getUserParticipationRequests(): Promise<IParticipant[]> 
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-requests`));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENE UN USUARIO COMO SOLICITANTE
  * POR ESTADO
  * GET /api/participants/my-requests?status=pending
  * TODO: CAMBIAR ESTA FUNCION YA QUE ESTA AUN EN TESTEO EN BACKEND
  */
  getUserParticipationRequestsByStatus(status : participationStatus): Promise<IParticipant[]> 
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-requests`, { params }));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENEN TODOS LOS VIAJES
  * QUE HE CREADO
  * GET /api/participants/my-creator-requests
  * TODO: CAMBIAR ESTA FUNCION YA QUE ESTA AUN EN TESTEO EN BACKEND
  */
  getParticipationRequestsForMyTrips(): Promise<IParticipant[]> 
  {
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-creator-requests`));
  }

  /**
  * VER TODAS LAS SOLICITUDES/PARTICIPACIONES QUE TIENEN TODOS LOS VIAJES
  * QUE HE CREADO
  * GET /api/participants/my-creator-requests?status=pending
  * {pending, accepted, rejected, left}
  * TODO: CAMBIAR ESTA FUNCION YA QUE ESTA AUN EN TESTEO EN BACKEND
  */
  getParticipationRequestsForMyTripsByStatus(status : participationStatus): Promise<IParticipant[]> 
  {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(this.http.get<IParticipant[]>(`${this.baseUrl}/my-creator-requests`, { params }));
  }

  /**
  * CREAR UNA SOLICITUD DE PARTICIPACIÓN  PARA UN VIAJE
  * POST /api/participants/:trip_id
  */
  createParticipationRequest(tripId : number, message : string): Promise<IParticipant> 
  {
    return firstValueFrom(this.http.post<IParticipant>(`${this.baseUrl}/${tripId}`, message));
  }

  /**
  * CAMBIAR EL ESTADO DE UNA SOLICITUD/PARTICIPANTE DE UN VIAJE
  * PATCH /api/participants/:participation_id
  * {pending, accepted, rejected, left}
  */
  updateParticipationStatus(participationId : number, status : participationStatus): Promise<IParticipant> 
  {
    return firstValueFrom(this.http.patch<IParticipant>(`${this.baseUrl}/${participationId}`, status));
  }
}
