import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStatus = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatus.asObservable();

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_ID_KEY = 'user_id';

  private token: string | null = null;
  private userId: number | null = null;

  constructor() {
    this.restoreSession();
  }

  /**
   * Restaurar sesión desde localStorage al inicializar el servicio
   */
  private restoreSession(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    const storedUserId = localStorage.getItem(this.USER_ID_KEY);

    if (storedToken) {
      this.token = storedToken;
      this.userId = storedUserId ? Number(storedUserId) : null;
      this.setAuthStatus(true);
    }
  }

  /**
   * Decodificar un JWT sin librerías externas
   * Extrae el payload del token JWT (sin verificar la firma)
   */
  private decodeJWT(token: string): any {
    try {
      // Validar que token sea un string válido
      if (!token || typeof token !== 'string') {
        console.error('❌ Token JWT inválido: no es un string válido');
        return null;
      }

      // JWT tiene 3 partes separadas por puntos: header.payload.signature
      const parts = token.split('.');

      if (parts.length !== 3) {
        console.error('❌ Token JWT inválido: no tiene 3 partes');
        return null;
      }

      // Decodificar el payload (segunda parte)
      const payload = parts[1];

      // Agregar padding si es necesario
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

      // Decodificar de base64
      const decoded = atob(paddedPayload);

      // Parsear JSON
      return JSON.parse(decoded);
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
      return null;
    }
  }

  /**
   * Extraer el ID del usuario del token JWT
   */
  private getUserIdFromToken(token: string): number | null {
    const decoded = this.decodeJWT(token);

    if (!decoded) {
      return null;
    }

    // Intentar obtener el ID de diferentes campos posibles
    const userId = decoded.id || decoded.userId || decoded.sub;

    if (userId) {
      return Number(userId);
    }
    return null;
  }

  /**
   * Establecer el token de autenticación y el ID del usuario
   * Decodifica el JWT para extraer el ID automáticamente
   * Guarda el token en localStorage para persistencia
   */
  setToken(token: string, userId?: number): void {
    // Validar que token sea válido
    if (!token || typeof token !== 'string') {
      console.error('❌ Error en setToken: token no es un string válido', token);
      return;
    }

    this.token = token;

    // Si no se proporciona userId, intentar extraerlo del JWT
    if (!userId) {
      userId = this.getUserIdFromToken(token) || undefined;
    }

    if (userId) {
      this.userId = userId;
    }

    // Guardar en localStorage para persistencia
    localStorage.setItem(this.TOKEN_KEY, token);
    if (this.userId) {
      localStorage.setItem(this.USER_ID_KEY, String(this.userId));
    }

    this.setAuthStatus(true);
  }

  /**
   * Obtener el token de autenticación
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtener el ID del usuario autenticado
   */
  getUserId(): number | null {
    return this.userId;
  }

  /**
   * Verificar si el usuario está logado (token disponible)
   */
  isLoggedIn(): boolean {
    return this.token !== null && this.token.length > 0;
  }

  /**
   * Limpiar token y datos de usuario (logout)
   * Elimina también del localStorage
   */
  logout(): void {
    this.token = null;
    this.userId = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.setAuthStatus(false);
  }

  setAuthStatus(status: boolean): void {
    this.authStatus.next(status);
  }

  getAuthStatus(): boolean {
    return this.authStatus.value;
  }
}
