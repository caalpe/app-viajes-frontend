import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-alert',
  imports: [CommonModule],
  templateUrl: './modal-alert.component.html',
  styleUrl: './modal-alert.component.css'
})
export class ModalAlertComponent {
  @Input() isVisible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'success' | 'error' = 'success';
  @Input() redirectUrl: string | null = null;
  @Output() onClose = new EventEmitter<void>();

  constructor(private router: Router) {}

  closeModal(): void {
    this.onClose.emit();
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
    }
  }
}
