import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ITrip } from '../../interfaces/ITrip';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class TripApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/trips';

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
   * Recuperar todos los viajes
   * GET /api/trips
   */
  getTrips(): Promise<ITrip[]> {
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl)
    );
  }

  /**
   * Recuperar viajes por estado
   * GET /api/trips?status=estado
   */
  getTripsByStatus(status: 'open' | 'closed' | 'completed'): Promise<ITrip[]> {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por salida/departure
   * GET /api/trips?departure=pais, provincia o ciudad
   */
  getTripsByDeparture(departure: string): Promise<ITrip[]> {
    let params = new HttpParams().set('departure', departure);
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por destino
   * GET /api/trips?destination=pais, provincia o ciudad
   */
  getTripsByDestination(destination: string): Promise<ITrip[]> {
    let params = new HttpParams().set('destination', destination);
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por fecha
   * GET /api/trips?date=yyyy-mm-dd
   */
  getTripsByDate(date: string): Promise<ITrip[]> {
    let params = new HttpParams().set('date', date);
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por organizador
   * GET /api/trips?creator=nombre_creador
   * Los espacios deben sustituirse por %20
   */
  getTripsByCreator(creatorName: string): Promise<ITrip[]> {
    let params = new HttpParams().set('creator', creatorName);
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes activos de un usuario
   * GET /api/trips?destination={destination}&participants={id_usuario}
   */
  getTripsByDestinationAndUser(destination: string, userId: number): Promise<ITrip[]> {
    let params = new HttpParams()
      .set('destination', destination)
      .set('participants', userId.toString());
    return firstValueFrom(
      this.http.get<ITrip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar datos de un viaje específico
   * GET /api/trips/:id
   */
  getTrip(id: number): Promise<ITrip> {
    return firstValueFrom(
      this.http.get<ITrip>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * Creación de un viaje
   * POST /api/trips
   * Body: id_creator, title, description, destination, start_date, end_date, cost_per_person, min_participants, transport_info, accommodation_info, itinerary, status
   */
  createTrip(payload: Partial<ITrip>): Promise<ITrip> {
    const headers = this.getAuthHeaders();
    console.log('📤 TripApiService - createTrip con headers:', headers.get('Authorization'));
    return firstValueFrom(
      this.http.post<ITrip>(this.baseUrl, payload, { headers })
    );
  }

  /**
   * Actualizar datos de un viaje
   * PUT /api/trips/:id
   * Body: id_creator, title, description, destination, start_date, end_date, cost_per_person, min_participants, transport_info, accommodation_info, itinerary, status, trip_id
   */
  updateTrip(id: number, payload: Partial<ITrip>): Promise<ITrip> {
    return firstValueFrom(
      this.http.put<ITrip>(`${this.baseUrl}/${id}`, payload, { headers: this.getAuthHeaders() })
    );
  }

  /**
   * Borrar un viaje
   * DELETE /api/trips/:id
   */
  deleteTrip(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() })
    );
  }
}
