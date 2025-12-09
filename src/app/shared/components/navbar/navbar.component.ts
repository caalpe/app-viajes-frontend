import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private subscription!: Subscription;

  isUserLoggedIn: boolean = false;

  ngOnInit(): void {
    // Suscribirse a los cambios de estado de autenticación
    this.subscription = this.authService.authStatus$.subscribe((status) => {
      this.isUserLoggedIn = status;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.isUserLoggedIn = false;
    this.cdr.detectChanges();
    this.router.navigate(['/']);
  }
}

