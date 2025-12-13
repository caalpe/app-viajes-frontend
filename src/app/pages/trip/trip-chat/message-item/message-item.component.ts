import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMessage } from '../../../../interfaces/IMessage';
import { formatDateDDMMYYYY } from '../../../../shared/utils/data.utils';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent {
  @Input() message!: IMessage;
  @Input() currentUserId: number | null = null;
  @Input() isReply: boolean = false;

  @Output() reply = new EventEmitter<IMessage>();
  @Output() delete = new EventEmitter<number>();

  onReply(): void {
    this.reply.emit(this.message);
  }

  onDelete(): void {
    this.delete.emit(this.message.id_message);
  }

  canDelete(): boolean {
    return this.message.id_user === this.currentUserId;
  }

  isOwnMessage(): boolean {
    return this.message.id_user === this.currentUserId;
  }

  formatDate(dateString: string): string {
    return formatDateDDMMYYYY(dateString);
  }

  linkifyText(text: string): string {
    if (!text) return '';

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return escapedText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
    });
  }
}
