// services/api/seatsApi.ts
import { apiRequest } from "./client";
import { getToken } from "./authApi";

// Define seat type enum
export enum SeatType {
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  WHEELCHAIR = "WHEELCHAIR",
  COUPLE = "COUPLE",
  RECLINER = "RECLINER",
}

// Define seat interface
export interface Seat {
  id: number;
  theaterRoomId: number;
  row: string;
  number: number;
  seatType: string;
  isAvailable: boolean;
}

// Bulk seat creation request
export interface BulkSeatCreationRequest {
  theaterRoomId: number;
  rows: string[];
  startNumber: number;
  endNumber: number;
  seatType: string;
}

// Seats API methods
export const seatsApi = {
  // Get all seats
  getAll: () => apiRequest<Seat[]>("api/seats"),

  // Get seat by ID
  getById: (id: number) => apiRequest<Seat>(`api/seats/${id}`),

  // Get seats by theater room ID
  getByRoomId: (roomId: number) =>
    apiRequest<Seat[]>(`api/seats/room/${roomId}`),

  // Create a new seat (requires admin/manager role)
  create: (seat: Omit<Seat, "id" | "isAvailable">) =>
    apiRequest<Seat>("api/seats", {
      method: "POST",
      body: JSON.stringify(seat),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Create multiple seats in bulk (requires admin/manager role)
  createBulk: (bulkRequest: BulkSeatCreationRequest) =>
    apiRequest<Seat[]>("api/seats/bulk", {
      method: "POST",
      body: JSON.stringify(bulkRequest),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Update an existing seat (requires admin/manager role)
  update: (id: number, seat: Omit<Seat, "isAvailable">) =>
    apiRequest<Seat>(`api/seats/${id}`, {
      method: "PUT",
      body: JSON.stringify(seat),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Delete a seat (requires admin/manager role)
  delete: (id: number) =>
    apiRequest(`api/seats/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),
};
