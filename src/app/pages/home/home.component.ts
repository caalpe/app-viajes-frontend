import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  toggleAuth(value: boolean) {
    this.authService.setAuthStatus(value);
  }
}
