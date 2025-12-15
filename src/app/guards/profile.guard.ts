import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ParticipationApiService } from '../services/api-rest/participation-rest.service';

export const profileGuard = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const participationApi = inject(ParticipationApiService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }

  const currentUserId = authService.getUserId();
  const targetUserId = route.paramMap.get('idUser');

  // Si no hay ID en la ruta, permitir acceso (es el perfil propio)
  if (!targetUserId) {
    return true;
  }

  const targetUserIdNum = Number(targetUserId);

  // Si es el perfil propio, permitir acceso
  if (currentUserId === targetUserIdNum) {
    return true;
  }

  // Verificar si el usuario target es participante de algún viaje del usuario actual
  try {
    // Obtener viajes creados por el usuario actual
    const myCreatedTripsRequests = await participationApi.getParticipationRequestsForMyTrips();
    const isParticipantInMyTrips = myCreatedTripsRequests.some(
      (participant) => participant.id_user === targetUserIdNum
    );

    if (isParticipantInMyTrips) {
      return true;
    }

    // Obtener viajes en los que el usuario actual participa
    const myParticipations = await participationApi.getUserParticipationRequests();
    
    // Para cada viaje donde participo, verificar si el target user también participa
    for (const participation of myParticipations) {
      if (participation.id_trip) {
        const tripParticipants = await participationApi.getTripParticipations(participation.id_trip);
        const isInSameTrip = tripParticipants.some(
          (p) => p.id_user === targetUserIdNum
        );
        if (isInSameTrip) {
          return true;
        }
      }
    }

    // Si no se encontró ninguna relación, denegar acceso
    router.navigate(['/']);
    return false;
  } catch (error) {
    console.error('Error verificando permisos de perfil:', error);
    router.navigate(['/']);
    return false;
  }
};
