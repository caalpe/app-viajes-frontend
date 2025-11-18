import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Trip {
  id_trip: number;
  id_creator: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  cost_per_person?: number | string | null;
  min_participants: number;
  transport_info?: string | null;
  accommodation_info?: string | null;
  itinerary?: string | null;
  status: 'open' | 'closed' | 'completed';
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export type CreateTripDto = Omit<
  Trip,
  'id_trip' | 'created_at' | 'updated_at' | 'creator_name'
>;

export type UpdateTripDto = Partial<CreateTripDto> & {
  trip_id?: number;
};

@Injectable({
  providedIn: 'root',
})
export class TripApiService {
  private http = inject(HttpClient);

  // Ajusta a tu backend real
  private readonly baseUrl = 'http://localhost:3000/api/trips'; // Cambiar según tu backend

  /**
   * Recuperar todos los viajes
   * GET /api/trips
   */
  getTrips(): Promise<Trip[]> {
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl)
    );
  }

  /**
   * Recuperar viajes por estado
   * GET /api/trips?status=estado
   */
  getTripsByStatus(status: 'open' | 'closed' | 'completed'): Promise<Trip[]> {
    let params = new HttpParams().set('status', status);
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por destino
   * GET /api/trips?destination=pais, provincia o ciudad
   */
  getTripsByDestination(destination: string): Promise<Trip[]> {
    let params = new HttpParams().set('destination', destination);
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por fecha
   * GET /api/trips?date=yyyy-mm-dd
   */
  getTripsByDate(date: string): Promise<Trip[]> {
    let params = new HttpParams().set('date', date);
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes por organizador
   * GET /api/trips?creator=nombre_creador
   * Los espacios deben sustituirse por %20
   */
  getTripsByCreator(creatorName: string): Promise<Trip[]> {
    const encodedName = creatorName.replace(/ /g, '%20');
    let params = new HttpParams().set('creator', encodedName);
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar viajes activos de un usuario
   * GET /api/trips?destination={destination}&participants={id_usuario}
   */
  getTripsByDestinationAndUser(destination: string, userId: number): Promise<Trip[]> {
    let params = new HttpParams()
      .set('destination', destination)
      .set('participants', userId.toString());
    return firstValueFrom(
      this.http.get<Trip[]>(this.baseUrl, { params })
    );
  }

  /**
   * Recuperar datos de un viaje específico
   * GET /api/trips/:id
   */
  getTrip(id: number): Promise<Trip> {
    return firstValueFrom(
      this.http.get<Trip>(`${this.baseUrl}/${id}`)
    );
  }

  /**
   * Creación de un viaje
   * POST /api/trips
   * Body: id_creator, title, description, destination, start_date, end_date, cost_per_person, min_participants, transport_info, accommodation_info, itinerary, status
   */
  createTrip(payload: Partial<CreateTripDto>): Promise<Trip> {
    return firstValueFrom(
      this.http.post<Trip>(this.baseUrl, payload)
    );
  }

  /**
   * Actualizar datos de un viaje
   * PUT /api/trips/:id
   * Body: id_creator, title, description, destination, start_date, end_date, cost_per_person, min_participants, transport_info, accommodation_info, itinerary, status, trip_id
   */
  updateTrip(id: number, payload: UpdateTripDto): Promise<Trip> {
    return firstValueFrom(
      this.http.put<Trip>(`${this.baseUrl}/${id}`, payload)
    );
  }

  /**
   * Borrar un viaje
   * DELETE /api/trips/:id
   */
  deleteTrip(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`)
    );
  }
}
