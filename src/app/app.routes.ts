
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { UserDetailComponent } from './pages/user/user-detail/user-detail.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { TripDetailComponent } from './pages/trip/trip-detail/trip-detail.component';
import { TripFormComponent } from './pages/trip/trip-form/trip-form.component';
import { TripListComponent } from './pages/trip/trip-list/trip-list.component';

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

  // Rutas de Usuarios
  {
    path: 'users',
    children: [
      {
        path: '',
        component: UserListComponent
      },
      {
        path: 'new',
        component: UserFormComponent
      },
      {
        path: ':id',
        component: UserDetailComponent
      },
      {
        path: ':id/edit',
        component: UserFormComponent
      }
    ]
  },

  // Rutas de Viajes
  {
    path: 'trips',
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
      }
    ]
  },

  // Ruta wildcard (debe ser la última)
  {
    path: '**',
    redirectTo: ''
  }
];
