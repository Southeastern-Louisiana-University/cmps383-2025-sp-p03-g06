// services/api/reservationsApi.ts
import { apiRequest } from "./client";
import { getToken } from "./authApi";
import { Showtime, Seat } from "./apiTypes";

// Reservation status enum
export enum ReservationStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELLED = "Cancelled",
  COMPLETED = "Completed",
}

// Define reservation interfaces
export interface ReservationSeat {
  seatId: number;
  price: number;
  seat?: Seat; // Optional expanded property
}

export interface ConcessionItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Reservation {
  id: number;
  userId: number;
  showtimeId: number;
  reservationTime: string; // ISO date string
  totalPrice: number;
  status: string;
  ticketCode?: string;

  // Optional expanded properties
  showtime?: Showtime;
  seats?: ReservationSeat[];
  concessions?: ConcessionItem[];
}

// Reservation creation request
export interface ReservationCreateRequest {
  showtimeId: number;
  seatIds: number[];
  concessionItems?: {
    concessionId: number;
    quantity: number;
  }[];
}

// Reservations API methods
export const reservationsApi = {
  // Get all reservations for current user
  getMyReservations: () =>
    apiRequest<Reservation[]>("api/reservations/my", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Get reservation by ID
  getById: (id: number) =>
    apiRequest<Reservation>(`api/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Create a new reservation (requires authentication)
  create: (reservationRequest: ReservationCreateRequest) =>
    apiRequest<Reservation>("api/reservations", {
      method: "POST",
      body: JSON.stringify(reservationRequest),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Update reservation status (e.g., cancel)
  updateStatus: (id: number, status: ReservationStatus) =>
    apiRequest<Reservation>(`api/reservations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Cancel a reservation
  cancel: (id: number) =>
    apiRequest<Reservation>(`api/reservations/${id}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Get ticket QR code for a reservation
  getTicketQrCode: (id: number) =>
    apiRequest<{ qrCodeUrl: string }>(`api/reservations/${id}/ticket`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),
};
