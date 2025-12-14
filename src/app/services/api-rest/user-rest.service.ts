import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../interfaces/IUser';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/users';

  /**
   * Obtiene los headers con la autorización del token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token || '',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Recuperar todos los usuarios
   * GET /api/usuarios
   */
  getUsers(): Promise<IUser[]> {
    return firstValueFrom(
      this.http.get<IUser[]>(this.baseUrl)
    );
  }

  /**
   * Recuperar un usuario específico
   * GET /api/usuarios/:idUser
   */
  getUser(idUser: number): Promise<IUser> {
    const headers = this.getAuthHeaders();
    console.log('🔐 Petición getUser - ID:', idUser, 'Token:', this.authService.getToken()?.substring(0, 20) + '...');
    return firstValueFrom(
      this.http.get<IUser>(`${this.baseUrl}/${idUser}`, { headers })
    );
  }

  /**
   * Crear un nuevo usuario
   * POST /api/usuarios
   */
  createUser(payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.post<IUser>(this.baseUrl, payload, { headers: this.getAuthHeaders() })
    );
  }

  /**
   * Actualizar un usuario con PATCH
   * PATCH /api/usuarios/:idUser
   */
  updateUserPatch(idUser: number, payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.patch<IUser>(`${this.baseUrl}/${idUser}`, payload, { headers: this.getAuthHeaders() })
    );
  }

  /**
   * Actualizar un usuario con PUT
   * PUT /api/usuarios/:idUser
   */
  updateUserPut(idUser: number, payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.put<IUser>(`${this.baseUrl}/${idUser}`, payload, { headers: this.getAuthHeaders() })
    );
  }

  /**
   * Borrar un usuario
   * DELETE /api/usuarios/:idUser
   */
  deleteUser(idUser: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${idUser}`, { headers: this.getAuthHeaders() })
    );
  }
}
