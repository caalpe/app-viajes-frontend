
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { UserDetailComponent } from './pages/user/user-detail/user-detail.component';
import { ChangePasswordComponent } from './pages/user/change-password/change-password.component';
import { TripDetailComponent } from './pages/trip/trip-detail/trip-detail.component';
import { TripFormComponent } from './pages/trip/trip-form/trip-form.component';
import { TripListComponent } from './pages/trip/trip-list/trip-list.component';
import { TripChatComponent } from './pages/trip/trip-chat/trip-chat.component';
import { RequestsComponent } from './pages/requests/requests.component';
import { authGuard } from './guards/auth.guard';
import { profileGuard } from './guards/profile.guard';

 export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },

  // Ruta de Login
  {
    path: 'login',
    component: LoginComponent
  },

  // Ruta de Registro (sin autenticación requerida)
  {
    path: 'user/new',
    component: UserFormComponent
  },

  // Rutas de Usuario (protegidas)
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      {
        path: 'profile/edit',
        component: UserFormComponent
      },
      {
        path: 'profile',
        component: UserDetailComponent
      },
      {
        path: 'profile/:idUser',
        component: UserDetailComponent,
        canActivate: [profileGuard]
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      }
    ]
  },

  // Rutas de Viaje
  {
    path: 'trips',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: TripListComponent
      },
      {
        path: 'new',
        component: TripFormComponent
      },
      {
        path: ':id',
        component: TripDetailComponent
      },
      {
        path: ':id/edit',
        component: TripFormComponent
      },
      {
        path: ':id/chat',
        component: TripChatComponent
      }
    ]
  },

  // Ruta de Solicitudes
  {
    path: 'requests',
    component: RequestsComponent,
    canActivate: [authGuard]
  },

  // Ruta wildcard (debe ser la última)
  {
    path: '**',
    redirectTo: ''
  }
];
