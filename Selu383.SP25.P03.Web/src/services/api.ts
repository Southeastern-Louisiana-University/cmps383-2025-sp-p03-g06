// src/services/api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// Base URL for API requests
const API_BASE_URL = "/api";

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For handling cookies/sessions
});

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
  UserName: string;
  Password: string;
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
  ratingScore?: number;
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

// Concession
export interface ConcessionItemDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  isAvailable: boolean;
}

export interface ConcessionCategoryDTO {
  id: number;
  name: string;
}

export interface CreateOrderItemDTO {
  concessionItemId: number;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateConcessionOrderDTO {
  reservationId: number;
  items: CreateOrderItemDTO[];
}

export interface OrderItemDTO {
  id: number;
  concessionItemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions: string;
}

export interface ConcessionOrderDTO {
  id: number;
  reservationId: number;
  orderTime: string;
  totalPrice: number;
  status: string;
  items: OrderItemDTO[];
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

  if (axios.isAxiosError<string | object>(error)) {
    // Handle Axios-specific errors with proper typing
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status || 500;
    const errorMessage = axiosError.response?.data || customMessage;
    throw new ApiError(
      typeof errorMessage === "string" ? errorMessage : customMessage,
      statusCode
    );
  }

  if (ApiError.isApiError(error)) {
    // Use the specific error message if it's an API error
    throw new Error(error.message || customMessage);
  }

  throw new Error(customMessage);
};

// Helper function for API requests with retry logic
async function axiosWithRetry<T>(
  config: AxiosRequestConfig,
  retries: number = 2,
  retryDelay: number = 1000
): Promise<T> {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Don't retry authentication failures (401)
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new ApiError("Not authenticated", 401);
    }

    // Don't retry client errors (4xx) except for 429 (rate limit)
    if (
      axios.isAxiosError(error) &&
      error.response?.status &&
      error.response.status >= 400 &&
      error.response.status < 500 &&
      error.response.status !== 429
    ) {
      throw new ApiError(
        typeof error.response.data === "string"
          ? error.response.data
          : "Client error",
        error.response.status
      );
    }

    if (retries > 0) {
      console.log(
        `Retrying request to ${config.url}, ${retries} attempts left`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return axiosWithRetry<T>(config, retries - 1, retryDelay * 1.5);
    }
    throw error;
  }
}

// Authentication API calls
export const authApi = {
  login: async (credentials: LoginRequest): Promise<UserDTO> => {
    console.log("Attempting login with:", credentials.UserName);

    try {
      const data = await axiosWithRetry<UserDTO>({
        url: `/authentication/login`,
        method: "POST",
        data: credentials,
      });

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
      const data = await axiosWithRetry<UserDTO>({
        url: `/authentication/me`,
        method: "GET",
      });

      // Cache user data for 30 minutes
      apiCache.set("currentUser", data, 30 * 60 * 1000);
      return data;
    } catch (error) {
      // Don't propagate authentication errors, just return null
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("User not authenticated");
        return Promise.reject(new Error("Not authenticated"));
      }

      // For other errors, use the standard error handler
      return handleApiError(error, "Failed to get current user information");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/authentication/logout`,
        method: "POST",
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
      return await axiosWithRetry<UserDTO>({
        url: `/users/register`,
        method: "POST",
        data: userData,
      });
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 409
      ) {
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
      const data = await axiosWithRetry<TheaterDTO[]>({
        url: `/theaters`,
        method: "GET",
      });

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
      const data = await axiosWithRetry<TheaterDTO>({
        url: `/theaters/${id}`,
        method: "GET",
      });

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
      const data = await axiosWithRetry<TheaterDTO>({
        url: `/theaters`,
        method: "POST",
        data: theater,
      });

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
      const data = await axiosWithRetry<TheaterDTO>({
        url: `/theaters/${id}`,
        method: "PUT",
        data: { ...theater, id },
      });

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
      await axiosWithRetry<void>({
        url: `/theaters/${id}`,
        method: "DELETE",
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
      const data = await axiosWithRetry<MovieDTO[]>({
        url: `/movies`,
        method: "GET",
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
      const data = await axiosWithRetry<MovieDTO>({
        url: `/movies/${id}`,
        method: "GET",
      });

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
      const data = await axiosWithRetry<ShowtimeDTO[]>({
        url: `/showtimes`,
        method: "GET",
      });

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
      return await axiosWithRetry<ShowtimeDTO[]>({
        url: `/showtimes/upcoming`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch upcoming showtimes. Please try again later."
      );
    }
  },

  getShowtimesByMovie: async (movieId: number): Promise<ShowtimeDTO[]> => {
    try {
      return await axiosWithRetry<ShowtimeDTO[]>({
        url: `/showtimes/movie/${movieId}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movie showtimes. Please try again later."
      );
    }
  },

  getShowtimeById: async (id: number): Promise<ShowtimeDTO> => {
    try {
      return await axiosWithRetry<ShowtimeDTO>({
        url: `/showtimes/${id}`,
        method: "GET",
      });
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
      return await axiosWithRetry<SeatDTO[]>({
        url: `/seats/room/${roomId}`,
        method: "GET",
      });
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
      return await axiosWithRetry<ReservationDTO[]>({
        url: `/reservations`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch your reservations. Please try again later."
      );
    }
  },

  getReservationById: async (id: number): Promise<ReservationDTO> => {
    try {
      return await axiosWithRetry<ReservationDTO>({
        url: `/reservations/${id}`,
        method: "GET",
      });
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
      return await axiosWithRetry<ReservationDTO>({
        url: `/reservations`,
        method: "POST",
        data,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to create reservation. Please try again later."
      );
    }
  },

  cancelReservation: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/reservations/${id}`,
        method: "DELETE",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to cancel reservation. Please try again later."
      );
    }
  },
};

// Concession API methods
export const concessionApi = {
  getCategories: async (): Promise<ConcessionCategoryDTO[]> => {
    try {
      return await axiosWithRetry<ConcessionCategoryDTO[]>({
        url: `/concession-categories`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch concession categories.");
    }
  },

  getItems: async (): Promise<ConcessionItemDTO[]> => {
    try {
      return await axiosWithRetry<ConcessionItemDTO[]>({
        url: `/concession-items/available`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch concession items.");
    }
  },

  getItemsByCategory: async (
    categoryId: number
  ): Promise<ConcessionItemDTO[]> => {
    try {
      return await axiosWithRetry<ConcessionItemDTO[]>({
        url: `/concession-items/category/${categoryId}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch concession items for this category."
      );
    }
  },

  createOrder: async (
    order: CreateConcessionOrderDTO
  ): Promise<ConcessionOrderDTO> => {
    try {
      return await axiosWithRetry<ConcessionOrderDTO>({
        url: `/concession-orders`,
        method: "POST",
        data: order,
      });
    } catch (error) {
      return handleApiError(error, "Failed to create concession order.");
    }
  },
};
