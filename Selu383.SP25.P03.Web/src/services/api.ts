// src/services/api.ts - Updated with movie, showtime, and ticket API endpoints

// Base URL for API requests
const API_BASE_URL = "/api";

// Simple in-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // Time in milliseconds until cache expires
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if cache has expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set<T>(key: string, data: T, expiry: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
  }

  invalidate(keyPattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (keyPattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

// Types
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface UserDTO {
  id: number;
  userName: string;
  roles: string[];
}

export interface TheaterDTO {
  id: number;
  name: string;
  address: string;
  seatCount: number;
  managerId: number | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  roles: string[];
}

export interface MovieDTO {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  rating: string;
  posterImageUrl: string;
  releaseDate: string;
  genres: string[];
}

export interface ShowtimeDTO {
  id: number;
  movieId: number;
  movieTitle: string;
  theaterRoomId: number;
  theaterRoomName: string;
  theaterId: number;
  theaterName: string;
  startTime: string;
  endTime: string;
  baseTicketPrice: number;
}

export interface SeatDTO {
  id: number;
  theaterRoomId: number;
  row: string;
  number: number;
  seatType: string | null;
  isAvailable: boolean;
}

export interface ReservationSeatDTO {
  seatId: number;
  row: string;
  number: number;
  seatType: string;
  price: number;
}

export interface ReservationDTO {
  id: number;
  userId: number;
  userName: string;
  showtimeId: number;
  showtimeStartTime: string;
  movieTitle: string;
  theaterName: string;
  roomName: string;
  reservationTime: string;
  totalPrice: number;
  status: string;
  ticketCode: string;
  seats: ReservationSeatDTO[];
}

export interface CreateReservationRequest {
  showtimeId: number;
  seatIds: number[];
}

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  static isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
  }
}

// Shared error handling function
const handleApiError = (error: any, customMessage: string): never => {
  console.error(customMessage, error);

  if (ApiError.isApiError(error)) {
    // Use the specific error message if it's an API error
    throw new Error(error.message || customMessage);
  }

  throw new Error(customMessage);
};

// Utility function for API requests with retry logic
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number = 2,
  retryDelay: number = 1000
): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new ApiError(`API request failed: ${errorText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (
      retries > 0 &&
      !(
        error instanceof ApiError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      )
    ) {
      console.log(`Retrying request to ${url}, ${retries} attempts left`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchWithRetry<T>(url, options, retries - 1, retryDelay * 1.5);
    }
    throw error;
  }
}

// Authentication API calls
export const authApi = {
  login: async (credentials: LoginRequest): Promise<UserDTO> => {
    console.log("Attempting login with:", credentials.userName);

    try {
      const data = await fetchWithRetry<UserDTO>(
        `${API_BASE_URL}/authentication/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookies
          body: JSON.stringify(credentials),
        }
      );

      console.log("Login successful");
      // Invalidate any user-related caches after login
      apiCache.invalidate(/^user|^theater/);
      return data;
    } catch (error) {
      return handleApiError(error, "Invalid username or password");
    }
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    // Check cache first
    const cachedUser = apiCache.get<UserDTO>("currentUser");
    if (cachedUser) return cachedUser;

    try {
      const data = await fetchWithRetry<UserDTO>(
        `${API_BASE_URL}/authentication/me`,
        { credentials: "include" }
      );

      // Cache user data for 30 minutes
      apiCache.set("currentUser", data, 30 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to get current user information");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetchWithRetry<void>(`${API_BASE_URL}/authentication/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Clear all cache on logout
      apiCache.clear();
    } catch (error) {
      return handleApiError(error, "Logout failed. Please try again.");
    }
  },
};

// User API calls
export const userApi = {
  register: async (userData: CreateUserRequest): Promise<UserDTO> => {
    try {
      return await fetchWithRetry<UserDTO>(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    } catch (error) {
      if (ApiError.isApiError(error) && error.statusCode === 409) {
        return handleApiError(
          error,
          "Username already exists. Please choose a different one."
        );
      }
      return handleApiError(error, "Registration failed. Please try again.");
    }
  },
};

// Theater API calls
export const theaterApi = {
  getAllTheaters: async (): Promise<TheaterDTO[]> => {
    // Check cache first
    const cachedTheaters = apiCache.get<TheaterDTO[]>("theaters");
    if (cachedTheaters) return cachedTheaters;

    try {
      const data = await fetchWithRetry<TheaterDTO[]>(
        `${API_BASE_URL}/theaters`,
        { credentials: "include" }
      );

      // Cache theaters for 5 minutes
      apiCache.set("theaters", data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch theaters. Please try again later."
      );
    }
  },

  getTheaterById: async (id: number): Promise<TheaterDTO> => {
    // Check cache first
    const cachedTheater = apiCache.get<TheaterDTO>(`theater_${id}`);
    if (cachedTheater) return cachedTheater;

    try {
      const data = await fetchWithRetry<TheaterDTO>(
        `${API_BASE_URL}/theaters/${id}`,
        { credentials: "include" }
      );

      // Cache individual theater for 5 minutes
      apiCache.set(`theater_${id}`, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch theater details. Please try again later."
      );
    }
  },

  createTheater: async (
    theater: Omit<TheaterDTO, "id">
  ): Promise<TheaterDTO> => {
    try {
      const data = await fetchWithRetry<TheaterDTO>(
        `${API_BASE_URL}/theaters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(theater),
        }
      );

      // Invalidate theaters cache
      apiCache.invalidate(/^theaters/);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to create theater. Please check your inputs and try again."
      );
    }
  },

  updateTheater: async (
    id: number,
    theater: Omit<TheaterDTO, "id">
  ): Promise<TheaterDTO> => {
    try {
      const data = await fetchWithRetry<TheaterDTO>(
        `${API_BASE_URL}/theaters/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...theater, id }),
        }
      );

      // Invalidate specific theater and theaters list cache
      apiCache.invalidate(/^theaters/);
      apiCache.invalidate(new RegExp(`^theater_${id}$`));
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to update theater. Please check your inputs and try again."
      );
    }
  },

  deleteTheater: async (id: number): Promise<void> => {
    try {
      await fetchWithRetry<void>(`${API_BASE_URL}/theaters/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      // Invalidate specific theater and theaters list cache
      apiCache.invalidate(/^theaters/);
      apiCache.invalidate(new RegExp(`^theater_${id}$`));
    } catch (error) {
      return handleApiError(
        error,
        "Failed to delete theater. Please try again later."
      );
    }
  },
};

// Movie API methods
export const movieApi = {
  getAllMovies: async (): Promise<MovieDTO[]> => {
    const cachedMovies = apiCache.get<MovieDTO[]>("movies");
    if (cachedMovies) return cachedMovies;

    try {
      const data = await fetchWithRetry<MovieDTO[]>(`${API_BASE_URL}/movies`, {
        credentials: "include",
      });

      apiCache.set("movies", data, 5 * 60 * 1000); // Cache for 5 minutes
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movies. Please try again later."
      );
    }
  },

  getMovieById: async (id: number): Promise<MovieDTO> => {
    const cachedMovie = apiCache.get<MovieDTO>(`movie_${id}`);
    if (cachedMovie) return cachedMovie;

    try {
      const data = await fetchWithRetry<MovieDTO>(
        `${API_BASE_URL}/movies/${id}`,
        { credentials: "include" }
      );

      apiCache.set(`movie_${id}`, data, 5 * 60 * 1000); // Cache for 5 minutes
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movie details. Please try again later."
      );
    }
  },
};

// Showtime API methods
export const showtimeApi = {
  getAllShowtimes: async (): Promise<ShowtimeDTO[]> => {
    const cachedShowtimes = apiCache.get<ShowtimeDTO[]>("showtimes");
    if (cachedShowtimes) return cachedShowtimes;

    try {
      const data = await fetchWithRetry<ShowtimeDTO[]>(
        `${API_BASE_URL}/showtimes`,
        { credentials: "include" }
      );

      apiCache.set("showtimes", data, 5 * 60 * 1000); // Cache for 5 minutes
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch showtimes. Please try again later."
      );
    }
  },

  getUpcomingShowtimes: async (): Promise<ShowtimeDTO[]> => {
    try {
      return await fetchWithRetry<ShowtimeDTO[]>(
        `${API_BASE_URL}/showtimes/upcoming`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch upcoming showtimes. Please try again later."
      );
    }
  },

  getShowtimesByMovie: async (movieId: number): Promise<ShowtimeDTO[]> => {
    try {
      return await fetchWithRetry<ShowtimeDTO[]>(
        `${API_BASE_URL}/showtimes/movie/${movieId}`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movie showtimes. Please try again later."
      );
    }
  },

  getShowtimeById: async (id: number): Promise<ShowtimeDTO> => {
    try {
      return await fetchWithRetry<ShowtimeDTO>(
        `${API_BASE_URL}/showtimes/${id}`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch showtime details. Please try again later."
      );
    }
  },
};

// Seat API methods
export const seatApi = {
  getSeatsByRoomId: async (roomId: number): Promise<SeatDTO[]> => {
    try {
      return await fetchWithRetry<SeatDTO[]>(
        `${API_BASE_URL}/seats/room/${roomId}`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch seats. Please try again later."
      );
    }
  },
};

// Reservation API methods
export const reservationApi = {
  getMyReservations: async (): Promise<ReservationDTO[]> => {
    try {
      return await fetchWithRetry<ReservationDTO[]>(
        `${API_BASE_URL}/reservations`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch your reservations. Please try again later."
      );
    }
  },

  getReservationById: async (id: number): Promise<ReservationDTO> => {
    try {
      return await fetchWithRetry<ReservationDTO>(
        `${API_BASE_URL}/reservations/${id}`,
        { credentials: "include" }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch reservation details. Please try again later."
      );
    }
  },

  createReservation: async (
    data: CreateReservationRequest
  ): Promise<ReservationDTO> => {
    try {
      return await fetchWithRetry<ReservationDTO>(
        `${API_BASE_URL}/reservations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      return handleApiError(
        error,
        "Failed to create reservation. Please try again later."
      );
    }
  },

  cancelReservation: async (id: number): Promise<void> => {
    try {
      await fetchWithRetry<void>(`${API_BASE_URL}/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to cancel reservation. Please try again later."
      );
    }
  },
};
