export const VALIDATION_MESSAGES = {
  name: {
    invalid: 'El nombre solo puede contener letras (sin números)'
  },
  email: {
    invalid: 'El correo electrónico no es válido'
  },
  phone: {
    invalid: 'El teléfono no es válido'
  },
  photo_url: {
    invalid: 'La URL de la foto no es válida'
  },
  start_date: {
    required: 'La fecha de inicio es obligatoria',
    past: 'La fecha de inicio no puede ser en el pasado',
    range: 'La fecha de inicio debe ser anterior a la fecha de fin'
  },
  end_date: {
    required: 'La fecha de fin es obligatoria'
  },
  min_participants: {
    required: 'El mínimo de participantes es obligatorio',
    min: 'Mínimo 1 participante'
  },
  max_participants: {
    required: 'El máximo de participantes es obligatorio',
    min: 'El máximo debe ser al menos 1',
    greaterThanMin: 'El máximo de participantes debe ser mayor que el mínimo',
    numeric: 'El máximo de participantes debe ser un número'
  },
  cost_per_person: {
    required: 'El coste por persona es obligatorio',
    min: 'El coste debe ser mayor o igual a 0',
    numeric: 'El costo debe ser un número positivo'
  },
  destination: {
    required: 'El destino es obligatorio',
    maxlength: 'El destino no puede exceder 150 caracteres'
  },
  title: {
    required: 'El título es obligatorio',
    minlength: 'El título debe tener al menos 3 caracteres',
    maxlength: 'El título no puede exceder 150 caracteres'
  },
  description: {
    required: 'La descripción es obligatoria',
    minlength: 'La descripción debe tener al menos 10 caracteres',
    maxlength: 'La descripción es demasiado larga',
    generic: 'Descripción inválida'
  },
  image_url: {
    pattern: 'Por favor ingresa una URL válida.'
  }
} as const;

export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
