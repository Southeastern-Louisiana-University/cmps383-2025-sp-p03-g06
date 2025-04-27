// services/api/showtimesApi.ts
import { apiRequest } from "./client";
import { getToken } from "./authApi";
import { Movie } from "./moviesApi";
import { Theater } from "./theatersApi";

// Define theater room interface
export interface TheaterRoom {
  id: number;
  theaterId: number;
  name: string;
  capacity: number;
}

// Define showtime interface
export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  theaterRoomId: number;
  theaterRoomName: string;
  theaterId: number;
  theaterName: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  baseTicketPrice: number;

  // Optional expanded properties that might be included in responses
  movie?: Movie;
  theater?: Theater;
}

// Showtime creation request (fields needed to create a showtime)
export interface ShowtimeCreateRequest {
  movieId: number;
  theaterRoomId: number;
  startTime: string; // ISO date string
  baseTicketPrice: number;
}

// Showtimes API methods
export const showtimesApi = {
  // Get all showtimes
  getAll: () => apiRequest<Showtime[]>("api/showtimes"),

  // Get upcoming showtimes (future showtimes only)
  getUpcoming: () => apiRequest<Showtime[]>("api/showtimes/upcoming"),

  // Get showtime by ID
  getById: (id: number) => apiRequest<Showtime>(`api/showtimes/${id}`),

  // Get showtimes for a specific movie
  getByMovie: (movieId: number) =>
    apiRequest<Showtime[]>(`api/showtimes/movie/${movieId}`),

  // Get showtimes for a specific theater
  getByTheater: (theaterId: number) =>
    apiRequest<Showtime[]>(`api/showtimes/theater/${theaterId}`),

  // Create a new showtime (requires admin/manager role)
  create: (showtime: ShowtimeCreateRequest) =>
    apiRequest<Showtime>("api/showtimes", {
      method: "POST",
      body: JSON.stringify(showtime),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Update an existing showtime (requires admin/manager role)
  update: (id: number, showtime: ShowtimeCreateRequest) =>
    apiRequest<Showtime>(`api/showtimes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, ...showtime }),
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Delete a showtime (requires admin/manager role)
  delete: (id: number) =>
    apiRequest(`api/showtimes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  // Get available seats for a showtime
  getAvailableSeats: (showtimeId: number) =>
    apiRequest<
      { seatId: number; row: string; number: number; seatType: string }[]
    >(`api/showtimes/${showtimeId}/seats`),
};
