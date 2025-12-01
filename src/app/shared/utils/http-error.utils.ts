/**
 * Utilidad para extraer mensajes de error y éxito de respuestas HTTP
 * Maneja diferentes estructuras de respuestas del backend
 */

/**
 * Extrae el mensaje de error de una respuesta HTTP fallida
 * Prioriza la siguiente estructura:
 * 1. error.error.error (campo error en respuesta de validación)
 * 2. error.error.message (mensaje dentro del objeto error)
 * 3. error.error como string (error como cadena de texto)
 * 4. error.message (mensaje genérico HTTP)
 * 5. Para status 500: mensaje por defecto | Para otros: cadena vacía
 *
 * @param error - El objeto de error HttpErrorResponse capturado en el catch
 * @returns El mensaje de error extraído del backend o por defecto para 500
 */
export function extractErrorMessage(error: any): string {
  // Prioridad 1: error.error.error (campo error en la respuesta)
  if (error?.error?.error) {
    return error.error.error;
  }

  // Prioridad 2: error.error.message (mensaje dentro de error)
  if (error?.error?.message) {
    return error.error.message;
  }

  // Prioridad 3: error.error como string
  if (typeof error?.error === 'string') {
    return error.error;
  }

  // Prioridad 4: error.message (mensaje genérico HTTP)
  if (error?.message) {
    return error.message;
  }

  // Prioridad 5: Para status 500, devolver mensaje por defecto
  if (error?.status === 500) {
    return 'Error interno del servidor. Por favor, intenta nuevamente más tarde.';
  }

  // Para otros errores sin mensaje, devolver cadena vacía
  return '';
}

/**
 * Extrae el mensaje de éxito de una respuesta HTTP exitosa
 * Busca en:
 * 1. response.message (mensaje de éxito del backend)
 * 2. response.data?.message (mensaje dentro de data)
 * 3. Mensaje por defecto (si no encuentra nada en el backend)
 *
 * @param response - El objeto de respuesta exitosa del backend
 * @param defaultMessage - Mensaje por defecto si no se encuentra otro en la respuesta
 * @returns El mensaje de éxito extraído
 */
export function extractSuccessMessage(
  response: any,
  defaultMessage: string = 'Operación completada exitosamente'
): string {
  // Prioridad 1: response.message
  if (response?.message) {
    return response.message;
  }

  // Prioridad 2: response.data?.message
  if (response?.data?.message) {
    return response.data.message;
  }

  // Fallback: mensaje por defecto
  return defaultMessage;
}

/**
 * Extrae mensaje de respuesta HTTP (éxito o error)
 * Determina automáticamente si es éxito o error basado en la estructura
 *
 * @param response - Objeto de respuesta HTTP
 * @param isError - true si es una respuesta de error, false si es éxito
 * @param defaultSuccessMessage - Mensaje por defecto para éxitos
 * @returns El mensaje extraído
 */
export function extractHttpMessage(
  response: any,
  isError: boolean = false,
  defaultSuccessMessage: string = 'Operación completada exitosamente'
): string {
  if (isError) {
    return extractErrorMessage(response);
  }
  return extractSuccessMessage(response, defaultSuccessMessage);
}
