import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IRating, IRatingSubmit } from '../../interfaces/IRating';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RatingApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/ratings';

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
   * ENVIAR VALORACIÓN A UN PARTICIPANTE
   * POST /api/ratings
   */
  submitRating(ratingData: IRatingSubmit): Promise<IRating> {
    return firstValueFrom(
      this.http.post<IRating>(this.baseUrl, ratingData, { headers: this.getAuthHeaders() })
    );
  }
}
