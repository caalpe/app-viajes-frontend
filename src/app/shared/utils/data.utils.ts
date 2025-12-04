/**
 * Convertir una fecha ISO 8601 a formato YYYY-MM-DD
 * @param isoDate - Fecha en formato ISO 8601 (ej: "2025-10-10T00:00:00.000Z")
 * @returns Fecha en formato YYYY-MM-DD, o string vacío si la entrada es falsy
 */
export function convertIsoToDateInputFormat(isoDate: string | Date | undefined | null): string {
  if (!isoDate) {
    return '';
  }
  return new Date(isoDate).toISOString().split('T')[0];
}

/**
 * Convertir una fecha YYYY-MM-DD a formato ISO 8601
 * @param dateInput - Fecha en formato YYYY-MM-DD (ej: "2025-10-10")
 * @returns Fecha en formato ISO 8601 (ej: "2025-10-10T00:00:00.000Z"), o string vacío si la entrada es falsy
 */
export function convertDateInputToIso(dateInput: string | undefined | null): string {
  if (!dateInput) {
    return '';
  }
  // Crear la fecha a partir del formato YYYY-MM-DD (asume UTC)
  const date = new Date(dateInput + 'T00:00:00.000Z');
  return date.toISOString();
}

/**
 * Validar que una fecha no sea anterior al día de hoy
 * @param date - La fecha a validar (string en formato YYYY-MM-DD o Date)
 * @returns true si la fecha es válida (hoy o futura), false si es anterior a hoy
 */
export function validateDateNotPast(date: string | Date): boolean {
  const dateToCheck = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateToCheck.setHours(0, 0, 0, 0);
  return dateToCheck >= today;
}

/**
 * Validar que la fecha de inicio sea menor que la fecha de fin
 * @param startDate - Fecha de inicio (string en formato YYYY-MM-DD o Date)
 * @param endDate - Fecha de fin (string en formato YYYY-MM-DD o Date)
 * @returns true si startDate < endDate, false en caso contrario
 */
export function validateDateRange(startDate: string | Date, endDate: string | Date): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return start < end;
}

/**
 * Validar formato de email con expresión regular
 * @param email - Email a validar
 * @returns true si el email es válido, false en caso contrario
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar que una cadena contenga solo números
 * @param value - Valor a validar
 * @returns true si contiene solo números, false en caso contrario
 */
export function onlyNumbers(value: string): boolean {
  const numbersRegex = /^\d+$/;
  return numbersRegex.test(value);
}

/**
 * Validar que una cadena NO contenga números
 * @param value - Valor a validar
 * @returns true si NO contiene números, false si contiene al menos un número
 */
export function containsNumbers(value: string): boolean {
  const hasNumbersRegex = /\d/;
  return hasNumbersRegex.test(value);
}

/**
 * Validar que una cadena contenga solo caracteres alfabéticos (sin números ni caracteres especiales)
 * @param value - Valor a validar
 * @returns true si contiene solo caracteres alfabéticos, false en caso contrario
 */
export function onlyCharacters(value: string): boolean {
  const charsRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  return charsRegex.test(value);
}

/**
 * Validar que una cadena contenga solo caracteres alfanuméricos (letras y números)
 * @param value - Valor a validar
 * @returns true si contiene solo caracteres alfanuméricos, false en caso contrario
 */
export function onlyAlphanumeric(value: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
  return alphanumericRegex.test(value);
}

/**
 * Validar formato de teléfono
 * @param phone - Teléfono a validar
 * @returns true si el teléfono tiene un formato válido, false en caso contrario
 */
export function validatePhone(phone: string): boolean {
  // Acepta formatos como: +34 123 456 789, +34-123-456-789, +341234567890, etc.
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validar URL
 * @param url - URL a validar
 * @returns true si la URL tiene un formato válido, false en caso contrario
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar que un número esté dentro de un rango
 * @param value - Valor a validar
 * @param min - Valor mínimo permitido
 * @param max - Valor máximo permitido
 * @returns true si el número está en el rango, false en caso contrario
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validar que el máximo de participantes sea estrictamente mayor que el mínimo
 * @param min - Mínimo de participantes
 * @param max - Máximo de participantes
 * @returns true si max > min, false en caso contrario
 */
export function validateMaxGreaterThanMin(min: number | undefined | null, max: number | undefined | null): boolean {
  const minVal = typeof min === 'number' ? min : Number(min);
  const maxVal = typeof max === 'number' ? max : Number(max);
  if (isNaN(minVal) || isNaN(maxVal)) return false;
  return maxVal > minVal;
}

/**
 * Convertir una fecha a formato en español legible
 * @param date - Fecha a convertir (string ISO o Date)
 * @returns Fecha formateada en español (ej: "26 de noviembre de 2025")
 */
export function formatDateToSpanish(date: string | Date | undefined | null): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC'
  };

  return dateObj.toLocaleDateString('es-ES', options);
}
