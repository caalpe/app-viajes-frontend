import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../interfaces/IUser';

export interface IAuthResponse {
  message: string;
  token: string;
  userId?: number;
  id?: number; // Alternativa si el backend usa 'id' en lugar de 'userId'
}

@Injectable({
  providedIn: 'root',
})
export class AuthRestService {
  private http = inject(HttpClient);

  private baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/auth';

  /**
   * Registrar un nuevo usuario
   * POST /api/auth/new-user
   */
  register(userData: Partial<IUser>): Promise<IAuthResponse> {
    return firstValueFrom(
      this.http.post<IAuthResponse>(`${this.baseUrl}/new-user`, userData)
    );
  }

  /**
   * Login de usuario
   * POST /api/users/login
   */
  login(credentials: { email: string; password: string }): Promise<IAuthResponse> {
    return firstValueFrom(
      this.http.post<IAuthResponse>(`${this.baseUrl}/login`, credentials)
    );
  }
}
