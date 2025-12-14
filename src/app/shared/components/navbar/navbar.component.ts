import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserApiService } from '../../../services/api-rest/user-rest.service';
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
  private userApi = inject(UserApiService);
  private subscription!: Subscription;

  isUserLoggedIn: boolean = false;
  userName: string | null = null;

  ngOnInit(): void {
    // Suscribirse a los cambios de estado de autenticación
    this.subscription = this.authService.authStatus$.subscribe((status) => {
      this.isUserLoggedIn = status;
      if (status) {
        // Si está logueado, cargar el nombre del usuario
        this.loadUserName();
      } else {
        // Si no está logueado, limpiar el nombre
        this.userName = null;
      }
      this.cdr.detectChanges();
    });
  }

  private loadUserName(): void {
    const uid = this.authService.getUserId();
    if (uid) {
      this.userApi.getUser(uid).then(user => {
        this.userName = user?.name || null;
        this.cdr.detectChanges();
      }).catch(() => {
        this.userName = null;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.isUserLoggedIn = false;
    this.userName = null;
    this.cdr.detectChanges();
    this.router.navigate(['/']);
  }
}

