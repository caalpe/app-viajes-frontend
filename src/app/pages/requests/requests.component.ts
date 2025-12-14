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
  expandedRatings: Record<string, boolean> = {};

  userRatings: Record<
    string,
    { score: number; comment: string; tripId: number; userId: number }
  > = {};

  participationByTripUser: Record<number, Record<number, number>> = {};

  async ngOnInit() {
    await this.loadMyTripsAndRequests();
    await this.loadTripParticipants();
    await this.loadUserProfiles();
  }

  async loadMyTripsAndRequests() {
    try {
      this.loading = true;

      // Viajes creados por mí
      this.myTrips = await this.tripService.getCreatedTrip();

      // Viajes donde participo
      this.participantTrips = await this.tripService.getParticipationsTrip();

      const tripMap = new Map<number, ITrip>();
      [...this.myTrips, ...this.participantTrips].forEach((t) => {
        if (t.id_trip) tripMap.set(t.id_trip, t);
      });

      this.myTrips = Array.from(tripMap.values());

      // Para los viajes que he creado cargamos solicitudes
      const requestsPromises = this.myTrips
        .filter((t) => t.id_creator === this.authService.getUserId())
        .map(async (trip) => {
          const requests =
            await this.participationService.getTripParticipations(
              trip.id_trip!
            );
          return requests.map((req) => ({ ...req, trip }));
        });

      const allRequestsArrays = await Promise.all(requestsPromises);
      this.allRequests = allRequestsArrays.flat();
    } catch (error) {
      console.error(error);
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

  acceptedParticipationIds: Record<number, Record<number, number>> = {};

  private ratingKey(tripId: number, reviewedUserId: number) {
    const reviewerId = this.authService.getUserId();
    return `rated:${reviewerId}:${tripId}:${reviewedUserId}`;
  }

  hasRated(tripId: number, reviewedUserId: number): boolean {
    return localStorage.getItem(this.ratingKey(tripId, reviewedUserId)) === '1';
  }

  markRated(tripId: number, reviewedUserId: number): void {
    localStorage.setItem(this.ratingKey(tripId, reviewedUserId), '1');
  }

  private formKey(tripId: number, userId: number): string {
    return `${tripId}:${userId}`;
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

  participantTrips: ITrip[] = [];

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

  get incompleteTrips(): ITrip[] {
    // No ha alcanzado el mínimo y no pasado
    return this.myTrips.filter(
      (t) => t.status !== 'completed' && !this.reachedMin(t)
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
  toggleRatingForm(tripId: number, userId: number) {
    const key = this.formKey(tripId, userId);

    this.expandedRatings[key] = !this.expandedRatings[key];

    if (!this.userRatings[key]) {
      this.userRatings[key] = { score: 0, comment: '', tripId, userId };
    }
  }

  setRating(tripId: number, userId: number, score: number) {
    const key = this.formKey(tripId, userId);
    if (!this.userRatings[key])
      this.userRatings[key] = { score: 0, comment: '', tripId, userId };
    this.userRatings[key].score = score;
  }

  setComment(tripId: number, userId: number, comment: string) {
    const key = this.formKey(tripId, userId);
    if (!this.userRatings[key])
      this.userRatings[key] = { score: 0, comment: '', tripId, userId };
    this.userRatings[key].comment = comment;
  }

  async submitRating(tripId: number, userId: number) {
    if (this.hasRated(tripId, userId)) return;

    const key = this.formKey(tripId, userId);
    const ratingData = this.userRatings[key];
    if (!ratingData || !ratingData.score) return;

    if (!tripId || !userId) {
      alert('Datos inválidos');
      return;
    }

    try {
      const payload = {
        id_trip: tripId,
        id_reviewed: userId,
        score: ratingData.score,
        comment: ratingData.comment || null,
      };

      await this.ratingService.submitRating(payload as any);

      this.markRated(tripId, userId);
      this.expandedRatings[key] = false;
      delete this.userRatings[key];

      alert('Valoración enviada correctamente');
    } catch (error: any) {
      console.error('Error submitting rating FULL:', error);
      alert(
        error?.error?.error?.message ||
          error?.error?.message ||
          'Error al enviar la valoración'
      );
    }
  }

  async loadUserProfiles() {
    // IDs desde solicitudes
    const idsFromRequests = this.allRequests.map((req) => req.id_user);

    // IDs desde participantes
    const idsFromParticipants = Object.values(this.tripParticipants)
      .flat()
      .map((p) => p.id_user);

    // Unir, únicos y limpiar nulos
    const userIds = [
      ...new Set([...idsFromRequests, ...idsFromParticipants]),
    ].filter((id) => typeof id === 'number' && id > 0);

    // Cargar solo los que falten
    const profilePromises = userIds
      .filter((id) => !this.userProfiles[id])
      .map(async (userId) => {
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
    const participantsPromises = this.myTrips.map(async (trip) => {
      if (!trip.id_trip) return;

      try {
        const participantsInfo =
          await this.participationService.getTripParticipantInformation(
            trip.id_trip
          );

        this.tripParticipants[trip.id_trip] = participantsInfo;

        const participations =
          await this.participationService.getTripParticipations(trip.id_trip);

        const accepted = participations.filter(
          (p: any) => p.status === participationStatus.accepted
        );

        if (!this.participationByTripUser[trip.id_trip]) {
          this.participationByTripUser[trip.id_trip] = {};
        }

        for (const p of accepted) {
          this.participationByTripUser[trip.id_trip][p.id_user] =
            p.id_participation;
        }
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
    return this.participationByTripUser[tripId]?.[userId] || 0;
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

  getRatingValue(tripId: number, userId: number): number {
    const key = this.formKey(tripId, userId);
    return this.userRatings[key]?.score || 0;
  }

  getCommentValue(tripId: number, userId: number): string {
    const key = this.formKey(tripId, userId);
    return this.userRatings[key]?.comment || '';
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
