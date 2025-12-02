import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipationApiService } from '../../services/api-rest/participation-rest.service';
import { TripApiService } from '../../services/api-rest/trip-rest.service';
import { UserApiService } from '../../services/api-rest/user-rest.service';
import { IParticipant, participationStatus } from '../../interfaces/participant';
import { ITrip } from '../../interfaces/ITrip';
import { IUser } from '../../interfaces/IUser';
import { UserProfileModalComponent } from '../../shared/components/user-profile-modal/user-profile-modal.component';

interface RequestWithTrip extends IParticipant {
  trip?: ITrip;
}

type TabType = 'all' | 'uncompleted' | 'completed' | 'past';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, UserProfileModalComponent],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  private participationService = inject(ParticipationApiService);
  private tripService = inject(TripApiService);
  private userService = inject(UserApiService);
  private router = inject(Router);

  myTrips: ITrip[] = [];
  allRequests: RequestWithTrip[] = [];
  activeTab: TabType = 'all';
  loading = true;
  selectedApplicantId: string | null = null;
  selectedUserId: number | null = null;

  // Cache de perfiles de usuarios
  userProfiles: Record<number, IUser> = {};

  participationStatus = participationStatus;

  // Rating states for past trips
  userRatings: Record<number, { rating: number; comment: string }> = {};
  expandedRatings: Record<number, boolean> = {};

  async ngOnInit() {
    await this.loadMyTripsAndRequests();
    await this.loadUserProfiles();
  }

  async loadMyTripsAndRequests() {
    try {
      this.loading = true;
      
      // Cargar todos los viajes que he creado
      this.myTrips = await this.tripService.getCreatedTrip();
      console.log('🚗 Mis viajes creados:', this.myTrips);
      console.log('📊 Total de viajes:', this.myTrips.length);
      
      // Para cada viaje, cargar sus solicitudes
      const requestsPromises = this.myTrips.map(async (trip) => {
        try {
          const requests = await this.participationService.getTripParticipations(trip.id_trip!);
          console.log(`📝 Solicitudes del viaje ${trip.title}:`, requests);
          return requests.map(req => ({ ...req, trip }));
        } catch (error) {
          console.error(`Error loading requests for trip ${trip.id_trip}:`, error);
          return [];
        }
      });

      const allRequestsArrays = await Promise.all(requestsPromises);
      this.allRequests = allRequestsArrays.flat();
      console.log('📋 Total de solicitudes:', this.allRequests.length);
      
    } catch (error) {
      console.error('Error loading trips and requests:', error);
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tab: TabType) {
    this.activeTab = tab;
  }

  get filteredRequests(): RequestWithTrip[] {
    if (this.activeTab === 'all') {
      return this.allRequests;
    }
    return [];
  }

  get uncompletedTrips(): ITrip[] {
    const today = new Date();
    const filtered = this.myTrips.filter(trip => {
      const startDate = new Date(trip.start_date!);
      const isFull = (trip.accepted_participants || 0) >= (trip.min_participants || 0);
      const isUpcoming = startDate > today;
      console.log(`🔍 Viaje ${trip.title}: startDate=${startDate.toISOString()}, today=${today.toISOString()}, isUpcoming=${isUpcoming}, isFull=${isFull}, accepted=${trip.accepted_participants}, min=${trip.min_participants}`);
      return isUpcoming && !isFull;
    });
    console.log('🟡 Viajes Incompletos:', filtered.length);
    return filtered;
  }

  get completedTrips(): ITrip[] {
    const today = new Date();
    const filtered = this.myTrips.filter(trip => {
      const startDate = new Date(trip.start_date!);
      const isFull = (trip.accepted_participants || 0) >= (trip.min_participants || 0);
      return startDate > today && isFull;
    });
    console.log('🟢 Viajes Completados:', filtered.length);
    return filtered;
  }

  get pastTrips(): ITrip[] {
    const today = new Date();
    const filtered = this.myTrips.filter(trip => {
      const endDate = new Date(trip.end_date!);
      const isPast = endDate < today;
      console.log(`🕐 Viaje ${trip.title}: endDate=${endDate.toISOString()}, today=${today.toISOString()}, isPast=${isPast}`);
      return isPast;
    });
    console.log('⏰ Viajes Pasados:', filtered.length);
    return filtered;
  }

  getTripRequests(tripId: number): RequestWithTrip[] {
    return this.allRequests.filter(req => req.id_trip === tripId);
  }

  getPendingRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(req => req.status === participationStatus.pending);
  }

  getAcceptedRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(req => req.status === participationStatus.accepted);
  }

  getRejectedRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(req => req.status === participationStatus.rejected);
  }

  async acceptRequest(requestId: number) {
    try {
      await this.participationService.updateParticipationStatus(requestId, participationStatus.accepted);
      await this.loadMyTripsAndRequests(); // Recargar datos
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }

  async rejectRequest(requestId: number) {
    try {
      await this.participationService.updateParticipationStatus(requestId, participationStatus.rejected);
      await this.loadMyTripsAndRequests(); // Recargar datos
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  }

  getStatusBadgeClass(status: participationStatus): string {
    const statusMap = {
      [participationStatus.pending]: 'badge-pending',
      [participationStatus.accepted]: 'badge-accepted',
      [participationStatus.rejected]: 'badge-rejected',
      [participationStatus.left]: 'badge-left'
    };
    return statusMap[status];
  }

  getStatusText(status: participationStatus): string {
    const statusText = {
      [participationStatus.pending]: 'Pendiente',
      [participationStatus.accepted]: 'Aceptado',
      [participationStatus.rejected]: 'Rechazado',
      [participationStatus.left]: 'Abandonado'
    };
    return statusText[status];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  navigateToTrip(tripId: number | undefined) {
    if (tripId) {
      this.router.navigate(['/trips', tripId]);
    }
  }

  // Rating functionality for past trips
  toggleRatingForm(participationId: number) {
    this.expandedRatings[participationId] = !this.expandedRatings[participationId];
  }

  setRating(participationId: number, rating: number) {
    if (!this.userRatings[participationId]) {
      this.userRatings[participationId] = { rating: 0, comment: '' };
    }
    this.userRatings[participationId].rating = rating;
  }

  setComment(participationId: number, comment: string) {
    if (!this.userRatings[participationId]) {
      this.userRatings[participationId] = { rating: 0, comment: '' };
    }
    this.userRatings[participationId].comment = comment;
  }

  async submitRating(participationId: number) {
    const rating = this.userRatings[participationId];
    if (!rating || !rating.rating) return;

    try {
      await this.participationService.submitRating(participationId, {
        rating: rating.rating,
        comment: rating.comment
      });
      
      alert('Valoración enviada correctamente');
      this.expandedRatings[participationId] = false;
      delete this.userRatings[participationId];
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error al enviar la valoración');
    }
  }

  async loadUserProfiles() {
    // Obtener IDs únicos de usuarios de todas las solicitudes
    const userIds = [...new Set(this.allRequests.map(req => req.id_user))];
    console.log('👥 IDs de usuarios a cargar:', userIds);
    
    // Cargar perfiles en paralelo
    const profilePromises = userIds.map(async (userId) => {
      try {
        const profile = await this.userService.getUser(userId);
        this.userProfiles[userId] = profile;
        console.log(`✅ Perfil cargado para usuario ${userId}:`, profile);
      } catch (error) {
        console.error(`❌ Error loading profile for user ${userId}:`, error);
      }
    });

    await Promise.all(profilePromises);
    console.log('📚 Todos los perfiles cargados:', this.userProfiles);
  }

  getUserName(userId: number): string {
    return this.userProfiles[userId]?.name || `Usuario #${userId}`;
  }

  getUserAvatar(userId: number): string {
    return this.userProfiles[userId]?.photo_url || 
           `https://ui-avatars.com/api/?name=${this.getUserName(userId)}&background=random`;
  }

  getUserBio(userId: number): string {
    return this.userProfiles[userId]?.bio || 'Sin biografía';
  }

  getUserInterests(userId: number): string {
    return this.userProfiles[userId]?.interests || 'Sin intereses';
  }

  getUserRating(userId: number): number {
    return this.userProfiles[userId]?.average_rating || 0;
  }

  showUserProfile(userId: number) {
    console.log('🔍 Abriendo perfil de usuario:', userId);
    console.log('📋 Perfil disponible:', this.userProfiles[userId]);
    console.log('💾 Todos los perfiles:', this.userProfiles);
    this.selectedUserId = userId;
  }

  closeUserProfile() {
    this.selectedUserId = null;
  }

  openApplicantProfile(participationId: number) {
    this.selectedApplicantId = participationId.toString();
  }

  closeApplicantProfile() {
    this.selectedApplicantId = null;
  }

  getRatingValue(participationId: number): number {
    return this.userRatings[participationId]?.rating || 0;
  }

  getCommentValue(participationId: number): string {
    return this.userRatings[participationId]?.comment || '';
  }
}
