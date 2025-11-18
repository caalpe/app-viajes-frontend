import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id_user: number;
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  interests?: string | null;
  average_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type CreateUserDto = Omit<
  User,
  'id_user' | 'created_at' | 'updated_at' | 'average_rating' | 'rating_count'
>;

export type UpdateUserDto = Partial<CreateUserDto>;

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private http = inject(HttpClient);

  // Ajusta a tu backend real
private baseUrl = 'https://app-viajes-backend-amla.onrender.com/api/users'
  /**
   * Recuperar todos los usuarios
   * GET /api/usuarios
   */
  getUsers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(this.baseUrl)
    );
  }

  /**
   * Recuperar un usuario específico
   * GET /api/usuarios/:idUser
   */
  getUser(idUser: number): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.baseUrl}/${idUser}`)
    );
  }

  /**
   * Crear un nuevo usuario
   * POST /api/usuarios
   */
  createUser(payload: Partial<CreateUserDto>): Promise<User> {
    return firstValueFrom(
      this.http.post<User>(this.baseUrl, payload)
    );
  }

  /**
   * Actualizar un usuario con PATCH
   * PATCH /api/usuarios/:idUser
   */
  updateUserPatch(idUser: number, payload: UpdateUserDto): Promise<User> {
    return firstValueFrom(
      this.http.patch<User>(`${this.baseUrl}/${idUser}`, payload)
    );
  }

  /**
   * Actualizar un usuario con PUT
   * PUT /api/usuarios/:idUser
   */
  updateUserPut(idUser: number, payload: UpdateUserDto): Promise<User> {
    return firstValueFrom(
      this.http.put<User>(`${this.baseUrl}/${idUser}`, payload)
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
