import { ActivatedRoute } from '@angular/router';

/**
 * Obtiene el ID de la URL desde los parámetros de la ruta
 * @param activatedRoute - Instancia de ActivatedRoute
 * @returns Promise que resuelve el ID como número o null si no existe
 */
export function getIdFromRoute(activatedRoute: ActivatedRoute): Promise<number | null> {
  return new Promise((resolve) => {
    activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        resolve(+params['id']);
      } else {
        resolve(null);
      }
    });
  });
}
