import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app-viajes-front';
  mobileOpen = false;
  isUserAuthenticated = false;

  constructor(private authService: AuthService) {}

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación
    this.authService.authStatus$.subscribe(status => {
      this.isUserAuthenticated = status;
    });
  }
}
