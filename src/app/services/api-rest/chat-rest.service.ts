import { Injectable } from '@angular/core';
import { IMessage } from '../../interfaces/IMessage';

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  // Mock data - reemplazar con llamadas HTTP reales cuando backend esté listo
  private mockMessages: IMessage[] = [
    {
      id_message: 1,
      id_trip: 93,
      id_user: 136,
      user_name: 'Edunir Tijer',
      message: '¡Hola a todos! Muy emocionado por este viaje a Laponia 🌌',
      created_at: '2025-12-10 22:15:00'
    },
    {
      id_message: 2,
      id_trip: 93,
      id_user: 140,
      user_name: 'Jorge Ilegal',
      message: '¿Alguien ha estado antes en Finlandia? ¿Qué ropa recomendáis llevar?',
      created_at: '2025-12-11 09:30:00'
    },
    {
      id_message: 3,
      id_trip: 93,
      id_user: 136,
      user_name: 'Edunir Tijer',
      message: 'Hay que ir muy abrigado. Temperaturas bajo cero garantizadas. Recomiendo capas térmicas y buenos guantes.',
      created_at: '2025-12-11 10:45:00'
    },
    {
      id_message: 4,
      id_trip: 93,
      id_user: 142,
      user_name: 'Laura Martínez Ruiz',
      message: '¿Ya está confirmado el hotel? Me gustaría saber más detalles',
      created_at: '2025-12-11 14:20:00'
    }
  ];

  private nextId = 5;

  constructor() {}

  /**
   * Obtiene todos los mensajes de un viaje específico
   * @param tripId ID del viaje
   * @returns Promise con array de mensajes organizados con sus respuestas
   */
  async getMessagesByTrip(tripId: number): Promise<IMessage[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filtrar mensajes por ID de viaje y ordenar por fecha (UTC)
    const allMessages = this.mockMessages
      .filter(msg => msg.id_trip === tripId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Organizar mensajes con jerarquía ilimitada
    const messageMap = new Map<number, IMessage>();
    const mainMessages: IMessage[] = [];

    // Primera pasada: crear mapa de todos los mensajes con replies vacío
    allMessages.forEach(msg => {
      messageMap.set(msg.id_message, { ...msg, replies: [] });
    });

    // Segunda pasada: organizar jerarquía (puede ser de cualquier nivel)
    allMessages.forEach(msg => {
      const message = messageMap.get(msg.id_message)!;
      if (msg.id_parent_message) {
        // Es una respuesta, agregarla al mensaje padre
        const parent = messageMap.get(msg.id_parent_message);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(message);
        } else {
          // Si no se encuentra el padre, tratarlo como mensaje principal
          mainMessages.push(message);
        }
      } else {
        // Es un mensaje principal
        mainMessages.push(message);
      }
    });

    return mainMessages;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.get<IMessage[]>(`${this.apiUrl}/trips/${tripId}/messages`).toPromise();
  }

  /**
   * Envía un nuevo mensaje al chat de un viaje
   * @param tripId ID del viaje
   * @param userId ID del usuario que envía el mensaje
   * @param userName Nombre del usuario
   * @param message Contenido del mensaje
   * @param parentMessageId ID del mensaje padre (si es una respuesta)
   * @returns Promise con el mensaje creado
   */
  async sendMessage(
    tripId: number,
    userId: number,
    userName: string,
    message: string,
    parentMessageId?: number
  ): Promise<IMessage> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    let parentMessage = null;
    if (parentMessageId) {
      const parent = this.mockMessages.find(m => m.id_message === parentMessageId);
      if (parent) {
        parentMessage = parent.message;
      }
    }

    const newMessage: IMessage = {
      id_message: this.nextId++,
      id_trip: tripId,
      id_user: userId,
      user_name: userName,
      message: message,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      id_parent_message: parentMessageId || null,
      parent_message: parentMessage,
      replies: []
    };

    this.mockMessages.push(newMessage);
    return newMessage;

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post<IMessage>(`${this.apiUrl}/trips/${tripId}/messages`, {
    //   message: message,
    //   parent_message_id: parentMessageId
    // }).toPromise();
  }

  /**
   * Elimina un mensaje del chat
   * @param messageId ID del mensaje a eliminar
   * @returns Promise<void>
   */
  async deleteMessage(messageId: number): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.mockMessages.findIndex(msg => msg.id_message === messageId);
    if (index !== -1) {
      this.mockMessages.splice(index, 1);
    }

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`).toPromise();
  }
}
