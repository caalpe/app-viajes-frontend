import { ActivatedRoute } from '@angular/router';

/**
 * Obtiene el ID de la URL desde los parámetros de la ruta
 * @param activatedRoute - Instancia de ActivatedRoute
 * @param paramName - Nombre del parámetro de ruta (por defecto 'id')
 * @returns Promise que resuelve el ID como número o null si no existe
 */
export function getIdFromRoute(activatedRoute: ActivatedRoute, paramName: string = 'id'): Promise<number | null> {
  return new Promise((resolve) => {
    activatedRoute.params.subscribe((params) => {
      if (params[paramName]) {
        resolve(+params[paramName]);
      } else {
        resolve(null);
      }
    });
  });
}
