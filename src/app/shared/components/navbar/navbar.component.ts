import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() isUserAuthenticated: boolean = false;
  isUserLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  login(): void {
    if (this.isUserAuthenticated) {
      this.isUserLoggedIn = true;
    }
  }

  logout(): void {
    this.isUserLoggedIn = false;
    this.authService.setAuthStatus(false);
  }
}
