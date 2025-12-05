import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../interfaces/IUser';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.css']
})
export class UserProfileModalComponent {
  @Input() user: IUser | null = null;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  getDefaultAvatar(): string {
    return '/favicon.svg';
  }
}
