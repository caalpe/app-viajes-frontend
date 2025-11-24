/**
 * Constantes con los límites de caracteres para los campos de la base de datos
 * Basadas en la estructura de la tabla 'users'
 */

// Campo: name (VARCHAR(100))
export const NAME_MAX_LENGTH = 100;

// Campo: email (VARCHAR(150))
export const EMAIL_MAX_LENGTH = 150;

// Campo: password (VARCHAR(255))
export const PASSWORD_MAX_LENGTH = 255;

// Campo: phone (VARCHAR(30))
export const PHONE_MAX_LENGTH = 30;

// Campo: photo_url (VARCHAR(255))
export const PHOTO_URL_MAX_LENGTH = 255;

// Campo: bio (TEXT)
export const BIO_MAX_LENGTH = 65535;

// Campo: interests (TEXT)
export const INTERESTS_MAX_LENGTH = 65535;

/**
 * Constantes con los límites de caracteres para los campos de la tabla 'trips'
 */

// Campo: title (VARCHAR(150))
export const TRIP_TITLE_MAX_LENGTH = 150;

// Campo: description (TEXT)
export const TRIP_DESCRIPTION_MAX_LENGTH = 65535;

// Campo: destination (VARCHAR(150))
export const TRIP_DESTINATION_MAX_LENGTH = 150;

// Campo: transport_info (TEXT)
export const TRIP_TRANSPORT_INFO_MAX_LENGTH = 65535;

// Campo: accommodation_info (TEXT)
export const TRIP_ACCOMMODATION_INFO_MAX_LENGTH = 65535;

// Campo: itinerary (TEXT)
export const TRIP_ITINERARY_MAX_LENGTH = 65535;

// Campo: min_participants (INT UNSIGNED) - límite razonable
export const TRIP_MIN_PARTICIPANTS_MAX = 1000;

// Campo: cost_per_person (DECIMAL(10,2)) - máximo 9,999,999.99
export const TRIP_COST_PER_PERSON_MAX = 9999999.99;
