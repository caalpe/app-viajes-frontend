import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatus.asObservable();

  private token: string | null = null;

  /**
   * Establecer el token de autenticación
   */
  setToken(token: string): void {
    this.token = token;
    console.log('🔐 AuthService - Token recogido del login:', token);
    this.setAuthStatus(true);
  }

  /**
   * Obtener el token de autenticación
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Verificar si el usuario está logado (token disponible)
   */
  isLoggedIn(): boolean {
    return this.token !== null && this.token.length > 0;
  }

  /**
   * Limpiar token (logout)
   */
  logout(): void {
    this.token = null;
    this.setAuthStatus(false);
  }

  setAuthStatus(status: boolean): void {
    this.authStatus.next(status);
  }

  getAuthStatus(): boolean {
    return this.authStatus.value;
  }
}
