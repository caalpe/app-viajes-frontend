import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticipationApiService } from '../../services/api-rest/participation-rest.service';
import { TripApiService } from '../../services/api-rest/trip-rest.service';
import { UserApiService } from '../../services/api-rest/user-rest.service';
import { RatingApiService } from '../../services/api-rest/rating-rest.service';
import { AuthService } from '../../services/auth.service';
import {
  IParticipant,
  IParticipantInfo,
  participationStatus,
} from '../../interfaces/IParticipant';
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
  styleUrls: ['./requests.component.css'],
})
export class RequestsComponent implements OnInit {
  private participationService = inject(ParticipationApiService);
  private tripService = inject(TripApiService);
  private userService = inject(UserApiService);
  private ratingService = inject(RatingApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  myTrips: ITrip[] = [];
  allRequests: RequestWithTrip[] = [];
  activeTab: TabType = 'all';
  loading = true;
  selectedApplicantId: string | null = null;
  selectedUserId: number | null = null;

  // Cache de perfiles de usuarios
  userProfiles: Record<number, IUser> = {};

  // Cache de información de participantes por viaje
  tripParticipants: Record<number, IParticipantInfo[]> = {};

  participationStatus = participationStatus;

  // Rating states for past trips (participationId -> rating data)
  userRatings: Record<
    number,
    { score: number; comment: string; tripId: number; userId: number }
  > = {};
  expandedRatings: Record<number, boolean> = {};

  async ngOnInit() {
    await this.loadMyTripsAndRequests();
    await this.loadUserProfiles();
    await this.loadTripParticipants();
  }

  async loadMyTripsAndRequests() {
    try {
      this.loading = true;

      // Cargar todos los viajes que he creado
      this.myTrips = await this.tripService.getCreatedTrip();

      // Para cada viaje, cargar sus solicitudes
      const requestsPromises = this.myTrips.map(async (trip) => {
        try {
          const requests =
            await this.participationService.getTripParticipations(
              trip.id_trip!
            );
          return requests.map((req) => ({ ...req, trip }));
        } catch (error) {
          console.error(
            `Error loading requests for trip ${trip.id_trip}:`,
            error
          );
          return [];
        }
      });

      const allRequestsArrays = await Promise.all(requestsPromises);
      this.allRequests = allRequestsArrays.flat();
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

  private isPastTrip(trip: ITrip): boolean {
    if (!trip.end_date) return false;

    const end = new Date(trip.end_date);
    end.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // cuando llega o supera la fecha end_date
    return end <= today;
  }

  private acceptedCount(trip: ITrip): number {
    return Number(trip.accepted_participants ?? 0);
  }

  private isFull(trip: ITrip): boolean {
    const max = Number(trip.max_participants ?? 0);
    const accepted = Number(trip.accepted_participants ?? 0);
    return max > 0 && accepted >= max;
  }

  private reachedMin(trip: ITrip): boolean {
    const min = Number(trip.min_participants ?? 0);
    const accepted = Number(trip.accepted_participants ?? 0);
    return min > 0 && accepted >= min;
  }

  get pastTrips(): ITrip[] {
    return this.myTrips.filter((t) => t.status === 'completed');
  }

  get completedTrips(): ITrip[] {
    // lleno y no pasado
    return this.myTrips.filter(
      (t) => t.status !== 'completed' && this.isFull(t)
    );
  }

  get uncompletedTrips(): ITrip[] {
    // mínimo alcanzado, no lleno, y no pasado
    return this.myTrips.filter(
      (t) => t.status !== 'completed' && this.reachedMin(t) && !this.isFull(t)
    );
  }

  getTripRequests(tripId: number): RequestWithTrip[] {
    return this.allRequests.filter((req) => req.id_trip === tripId);
  }

  getPendingRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(
      (req) => req.status === participationStatus.pending
    );
  }

  getAcceptedRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(
      (req) => req.status === participationStatus.accepted
    );
  }

  getRejectedRequests(tripId: number): RequestWithTrip[] {
    return this.getTripRequests(tripId).filter(
      (req) => req.status === participationStatus.rejected
    );
  }

  async acceptRequest(requestId: number) {
    try {
      await this.participationService.updateParticipationStatus(
        requestId,
        participationStatus.accepted
      );
      await this.loadMyTripsAndRequests(); // Recargar datos
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  }

  async rejectRequest(requestId: number) {
    try {
      await this.participationService.updateParticipationStatus(
        requestId,
        participationStatus.rejected
      );
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
      [participationStatus.left]: 'badge-left',
    };
    return statusMap[status];
  }

  getStatusText(status: participationStatus): string {
    const statusText = {
      [participationStatus.pending]: 'Pendiente',
      [participationStatus.accepted]: 'Aceptado',
      [participationStatus.rejected]: 'Rechazado',
      [participationStatus.left]: 'Abandonado',
    };
    return statusText[status];
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  navigateToTrip(tripId: number | undefined) {
    if (tripId) {
      this.router.navigate(['/trips', tripId]);
    }
  }

  // Rating functionality for past trips
  toggleRatingForm(participationId: number, tripId?: number, userId?: number) {
    this.expandedRatings[participationId] =
      !this.expandedRatings[participationId];
    if (!this.userRatings[participationId] && tripId && userId) {
      this.userRatings[participationId] = {
        score: 0,
        comment: '',
        tripId,
        userId,
      };
    }
  }

  setRating(
    participationId: number,
    score: number,
    tripId?: number,
    userId?: number
  ) {
    if (!this.userRatings[participationId] && tripId && userId) {
      this.userRatings[participationId] = {
        score: 0,
        comment: '',
        tripId,
        userId,
      };
    }
    this.userRatings[participationId].score = score;
  }

  setComment(
    participationId: number,
    comment: string,
    tripId?: number,
    userId?: number
  ) {
    if (!this.userRatings[participationId] && tripId && userId) {
      this.userRatings[participationId] = {
        score: 0,
        comment: '',
        tripId,
        userId,
      };
    }
    this.userRatings[participationId].comment = comment;
  }

  async submitRating(participationId: number) {
    const ratingData = this.userRatings[participationId];
    if (!ratingData || !ratingData.score) return;

    try {
      await this.ratingService.submitRating({
        id_trip: ratingData.tripId,
        id_reviewed: ratingData.userId,
        score: ratingData.score,
        comment: ratingData.comment,
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
    const userIds = [...new Set(this.allRequests.map((req) => req.id_user))];

    // Cargar perfiles en paralelo
    const profilePromises = userIds.map(async (userId) => {
      try {
        const profile = await this.userService.getUser(userId);
        this.userProfiles[userId] = profile;
      } catch (error) {
        console.error(`Error loading profile for user ${userId}:`, error);
      }
    });

    await Promise.all(profilePromises);
  }

  async loadTripParticipants() {
    // Cargar información completa de participantes para cada viaje
    const participantsPromises = this.myTrips.map(async (trip) => {
      if (!trip.id_trip) return;

      try {
        const participants =
          await this.participationService.getTripParticipantInformation(
            trip.id_trip
          );
        this.tripParticipants[trip.id_trip] = participants;
      } catch (error) {
        console.error(
          `Error loading participants for trip ${trip.id_trip}:`,
          error
        );
      }
    });

    await Promise.all(participantsPromises);
  }

  getTripParticipantsInfo(tripId: number): IParticipantInfo[] {
    return this.tripParticipants[tripId] || [];
  }

  getParticipationIdForUser(tripId: number, userId: number): number {
    // Buscar el id_participation para un usuario específico en un viaje
    const request = this.allRequests.find(
      (req) =>
        req.id_trip === tripId &&
        req.id_user === userId &&
        req.status === participationStatus.accepted
    );
    return request?.id_participation || 0;
  }

  getUserName(userId: number): string {
    return this.userProfiles[userId]?.name || `Usuario #${userId}`;
  }

  getUserAvatar(userId: number): string {
    return (
      this.userProfiles[userId]?.photo_url ||
      `https://ui-avatars.com/api/?name=${this.getUserName(
        userId
      )}&background=random`
    );
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
    return this.userRatings[participationId]?.score || 0;
  }

  getCommentValue(participationId: number): string {
    return this.userRatings[participationId]?.comment || '';
  }

  isCurrentUser(userId: number): boolean {
    const currentUserId = this.authService.getUserId();
    return currentUserId === userId;
  }

  getTripCapacity(trip: ITrip): number {
    const max = Number(trip.max_participants || 0);
    const min = Number(trip.min_participants || 0);
    return max > 0 ? max : min > 0 ? min : 1;
  }

  getProgressPercent(trip: ITrip): number {
    const accepted = Number(trip.accepted_participants || 0);
    const capacity = this.getTripCapacity(trip);
    const percent = (accepted / capacity) * 100;
    return Math.max(0, Math.min(100, percent));
  }

  getProgressBarClass(trip: ITrip): string {
    const accepted = Number(trip.accepted_participants || 0);
    const min = Number(trip.min_participants || 0);
    const max = Number(trip.max_participants || 0);

    if (max > 0 && accepted >= max) return 'bg-success';

    if (accepted >= min) return 'bg-primary';

    return 'bg-danger';
  }
}
