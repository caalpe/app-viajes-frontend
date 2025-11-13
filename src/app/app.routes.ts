
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserFormComponent } from './pages/user/user-form/user-form.component';
import { UserDetailComponent } from './pages/user/user-detail/user-detail.component';
import { UserListComponent } from './pages/user/user-list/user-list.component';
import { RequestDetailComponent } from './pages/request/request-detail/request-detail.component';
import { RequestFormComponent } from './pages/request/request-form/request-form.component';
import { TripDetailComponent } from './pages/trip/trip-detail/trip-detail.component';
import { TripFormComponent } from './pages/trip/trip-form/trip-form.component';
import { RequestListComponent } from './pages/request/request-list/request-list.component';
import { TripListComponent } from './pages/trip/trip-list/trip-list.component';

 export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
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

  // Rutas de Solicitudes
  {
    path: 'requests',
    children: [
      {
        path: '',
        component: RequestListComponent // Si tienes una lista
      },
      {
        path: 'new',
        component: RequestFormComponent
      },
      {
        path: ':id',
        component: RequestDetailComponent
      },
      {
        path: ':id/edit',
        component: RequestFormComponent
      }
    ]
  },

  // Ruta wildcard (debe ser la última)
  {
    path: '**',
    redirectTo: ''
  }
];
