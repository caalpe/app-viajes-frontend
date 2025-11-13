import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'app-viajes-front';
  isUserAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios de autenticación
    this.authService.authStatus$.subscribe(status => {
      this.isUserAuthenticated = status;
    });
  }
}
