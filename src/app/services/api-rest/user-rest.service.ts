import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IUser } from '../../interfaces/IUser';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private http = inject(HttpClient);

  private baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/users';

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
    return firstValueFrom(
      this.http.get<IUser>(`${this.baseUrl}/${idUser}`)
    );
  }

  /**
   * Crear un nuevo usuario
   * POST /api/usuarios
   */
  createUser(payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.post<IUser>(this.baseUrl, payload)
    );
  }

  /**
   * Actualizar un usuario con PATCH
   * PATCH /api/usuarios/:idUser
   */
  updateUserPatch(idUser: number, payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.patch<IUser>(`${this.baseUrl}/${idUser}`, payload)
    );
  }

  /**
   * Actualizar un usuario con PUT
   * PUT /api/usuarios/:idUser
   */
  updateUserPut(idUser: number, payload: Partial<IUser>): Promise<IUser> {
    return firstValueFrom(
      this.http.put<IUser>(`${this.baseUrl}/${idUser}`, payload)
    );
  }

  /**
   * Borrar un usuario
   * DELETE /api/usuarios/:idUser
   */
  deleteUser(idUser: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${idUser}`)
    );
  }
}
