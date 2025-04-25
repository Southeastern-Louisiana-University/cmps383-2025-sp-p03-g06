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

export interface TheaterRoomDTO {
  id: number;
  name: string;
  theaterId: number;
  seatCount: number;
  screenType: string;
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
  releaseDate: string;
  posterImageUrl?: string;
  trailerUrl?: string;
  ratingScore?: number;
  genres: string[];
  theaters: { id: number; name: string }[];
}

export interface TheaterMovieDTO {
  movieId: number;
  theaterId: number;
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
  guestInfo?: GuestUserInfo;
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

// Add these new interfaces
export interface GuestUserInfo {
  email: string;
  phoneNumber?: string;
}

// Update your CreateReservationRequest interface
export interface CreateReservationRequest {
  showtimeId: number;
  seatIds: number[];
  guestInfo?: {
    email: string;
    phoneNumber?: string;
  };
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
  console.error("API Error Details:", {
    message: customMessage,
    error: error,
    response: error?.response?.data,
    status: error?.response?.status,
  });

  if (axios.isAxiosError<string | object>(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status || 500;
    const errorMessage = axiosError.response?.data || customMessage;

    // Log the full error details
    console.error("Full API Error:", {
      status: statusCode,
      message: errorMessage,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      data: axiosError.config?.data,
    });

    throw new ApiError(
      typeof errorMessage === "string"
        ? errorMessage
        : JSON.stringify(errorMessage),
      statusCode
    );
  }

  if (ApiError.isApiError(error)) {
    console.error("API Error:", error);
    throw error;
  }

  console.error("Unknown Error:", error);
  throw new Error(customMessage);
};

// Helper function for API requests with retry logic
async function axiosWithRetry<T>(
  config: AxiosRequestConfig,
  retries: number = 2,
  retryDelay: number = 1000
): Promise<T> {
  try {
    console.log("Making API request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });

    const response = await axiosInstance(config);
    console.log("API response:", {
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API Request Failed:", {
        url: config.url,
        method: config.method,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 401) {
        throw new ApiError("Not authenticated", 401);
      }

      if (
        error.response?.status &&
        error.response.status >= 400 &&
        error.response.status < 500 &&
        error.response.status !== 429
      ) {
        throw new ApiError(
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data),
          error.response.status
        );
      }
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
      apiCache.invalidate(/^user|^theater/);
      return data;
    } catch (error) {
      return handleApiError(error, "Invalid username or password");
    }
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    const cachedUser = apiCache.get<UserDTO>("currentUser");
    if (cachedUser) return cachedUser;

    try {
      const data = await axiosWithRetry<UserDTO>({
        url: `/authentication/me`,
        method: "GET",
      });

      apiCache.set("currentUser", data, 30 * 60 * 1000);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("User not authenticated");
        return Promise.reject(new Error("Not authenticated"));
      }
      return handleApiError(error, "Failed to get current user information");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/authentication/logout`,
        method: "POST",
      });

      apiCache.clear();
    } catch (error) {
      return handleApiError(error, "Logout failed. Please try again.");
    }
  },

  /**
   * Create a temporary guest user (for anonymous reservations).
   */
  createGuestUser: async (guestInfo: GuestUserInfo): Promise<UserDTO> => {
    try {
      const data = await axiosWithRetry<UserDTO>({
        url: `/guest/create`,
        method: "POST",
        data: guestInfo,
      });

      apiCache.set("currentUser", data, 30 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to create guest session");
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
    const cachedTheaters = apiCache.get<TheaterDTO[]>("theaters");
    if (cachedTheaters) return cachedTheaters;

    try {
      const data = await axiosWithRetry<TheaterDTO[]>({
        url: `/theaters`,
        method: "GET",
      });

      apiCache.set("theaters", data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch theaters. Please try again later."
      );
    }
  },

  getTheaterRoomsById: async (theaterId: number): Promise<TheaterRoomDTO[]> => {
    try {
      const data = await axiosWithRetry<TheaterRoomDTO[]>({
        url: `/theater-rooms/theater/${theaterId}`,
        method: "GET",
      });
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch theater rooms. Please try again later."
      );
    }
  },

  getTheaterById: async (id: number): Promise<TheaterDTO> => {
    const cachedTheater = apiCache.get<TheaterDTO>(`theater_${id}`);
    if (cachedTheater) return cachedTheater;

    try {
      const data = await axiosWithRetry<TheaterDTO>({
        url: `/theaters/${id}`,
        method: "GET",
      });

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
    theater: Partial<TheaterDTO>
  ): Promise<TheaterDTO> => {
    try {
      // Make sure we're sending the complete theater object with the ID
      const updateData = {
        id,
        name: theater.name,
        address: theater.address,
        seatCount: theater.seatCount,
        managerId: theater.managerId,
      };

      console.log("Updating theater with data:", updateData);

      const data = await axiosWithRetry<TheaterDTO>({
        url: `/theaters/${id}`,
        method: "PUT",
        data: updateData,
      });

      apiCache.invalidate(/^theaters/);
      apiCache.invalidate(new RegExp(`^theater_${id}$`));
      return data;
    } catch (error) {
      console.error("Theater update error:", error);
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

      apiCache.invalidate(/^theaters/);
      apiCache.invalidate(new RegExp(`^theater_${id}$`));
    } catch (error) {
      return handleApiError(
        error,
        "Failed to delete theater. Please try again later."
      );
    }
  },

  getMoviesByTheater: async (theaterId: number): Promise<number[]> => {
    try {
      return await axiosWithRetry<number[]>({
        url: `/theater-movies/theater/${theaterId}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movies for this theater. Please try again later."
      );
    }
  },
  assignMovieToTheater: async (data: TheaterMovieDTO): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/theater-movies/assign`,
        method: "POST",
        data,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to assign movie to theater. Please try again later."
      );
    }
  },

  unassignMovieFromTheater: async (data: TheaterMovieDTO): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/theater-movies/unassign`,
        method: "DELETE",
        data,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to unassign movie from theater. Please try again later."
      );
    }
  },

  // Theater Room methods
  createTheaterRoom: async (
    room: Omit<TheaterRoomDTO, "id">
  ): Promise<TheaterRoomDTO> => {
    try {
      const data = await axiosWithRetry<TheaterRoomDTO>({
        url: `/theater-rooms`,
        method: "POST",
        data: room,
      });
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to create theater room");
    }
  },

  updateTheaterRoom: async (
    id: number,
    room: Partial<TheaterRoomDTO>
  ): Promise<TheaterRoomDTO> => {
    try {
      const data = await axiosWithRetry<TheaterRoomDTO>({
        url: `/theater-rooms/${id}`,
        method: "PUT",
        data: {
          ...room,
          id,
        },
      });
      return data;
    } catch (error) {
      return handleApiError(error, "Failed to update theater room");
    }
  },

  deleteTheaterRoom: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/theater-rooms/${id}`,
        method: "DELETE",
      });
    } catch (error) {
      return handleApiError(error, "Failed to delete theater room");
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

      apiCache.set("movies", data, 5 * 60 * 1000);
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

      apiCache.set(`movie_${id}`, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movie details. Please try again later."
      );
    }
  },

  createMovie: async (movie: Omit<MovieDTO, "id">): Promise<MovieDTO> => {
    try {
      const data = await axiosWithRetry<MovieDTO>({
        url: `/movies`,
        method: "POST",
        data: movie,
      });

      apiCache.invalidate(/^movies/);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to create movie. Please try again later."
      );
    }
  },

  updateMovie: async (
    id: number,
    movie: Partial<MovieDTO>
  ): Promise<MovieDTO> => {
    try {
      const data = await axiosWithRetry<MovieDTO>({
        url: `/movies/${id}`,
        method: "PUT",
        data: {
          ...movie,
          id, // Include the ID in the request body
        },
      });

      apiCache.invalidate(/^movies/);
      apiCache.invalidate(new RegExp(`^movie_${id}$`));
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to update movie. Please try again later."
      );
    }
  },

  deleteMovie: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/movies/${id}`,
        method: "DELETE",
      });

      apiCache.invalidate(/^movies/);
      apiCache.invalidate(new RegExp(`^movie_${id}$`));
    } catch (error) {
      return handleApiError(
        error,
        "Failed to delete movie. Please try again later."
      );
    }
  },

  getTheatersByMovie: async (movieId: number): Promise<number[]> => {
    try {
      return await axiosWithRetry<number[]>({
        url: `/theater-movies/movie/${movieId}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch theaters for this movie. Please try again later."
      );
    }
  },

  assignTheaterToMovie: async (
    movieId: number,
    theaterId: number
  ): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/theater-movies/assign`,
        method: "POST",
        data: { movieId, theaterId },
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to assign theater to movie. Please try again later."
      );
    }
  },

  unassignTheaterFromMovie: async (
    movieId: number,
    theaterId: number
  ): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/theater-movies/unassign`,
        method: "DELETE",
        data: { movieId, theaterId },
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to unassign theater from movie. Please try again later."
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

      // Cache showtimes for 5 minutes
      apiCache.set("showtimes", data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch showtimes. Please try again later."
      );
    }
  },

  getUpcomingShowtimes: async (): Promise<ShowtimeDTO[]> => {
    const cachedUpcoming = apiCache.get<ShowtimeDTO[]>("upcoming_showtimes");
    if (cachedUpcoming) return cachedUpcoming;

    try {
      const data = await axiosWithRetry<ShowtimeDTO[]>({
        url: `/showtimes/upcoming`,
        method: "GET",
      });

      // Cache upcoming showtimes for 5 minutes
      apiCache.set("upcoming_showtimes", data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch upcoming showtimes. Please try again later."
      );
    }
  },

  getShowtimesByMovie: async (movieId: number): Promise<ShowtimeDTO[]> => {
    const cacheKey = `movie_showtimes_${movieId}`;
    const cachedShowtimes = apiCache.get<ShowtimeDTO[]>(cacheKey);
    if (cachedShowtimes) return cachedShowtimes;

    try {
      const data = await axiosWithRetry<ShowtimeDTO[]>({
        url: `/showtimes/movie/${movieId}`,
        method: "GET",
      });

      // Cache movie showtimes for 5 minutes
      apiCache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch movie showtimes. Please try again later."
      );
    }
  },

  getShowtimeById: async (id: number): Promise<ShowtimeDTO> => {
    const cacheKey = `showtime_${id}`;
    const cachedShowtime = apiCache.get<ShowtimeDTO>(cacheKey);
    if (cachedShowtime) return cachedShowtime;

    try {
      const data = await axiosWithRetry<ShowtimeDTO>({
        url: `/showtimes/${id}`,
        method: "GET",
      });

      // Cache individual showtime for 5 minutes
      apiCache.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch showtime details. Please try again later."
      );
    }
  },

  createShowtime: async (
    showtime: Omit<
      ShowtimeDTO,
      "id" | "movieTitle" | "theaterRoomName" | "theaterName" | "endTime"
    >
  ): Promise<ShowtimeDTO> => {
    try {
      const data = await axiosWithRetry<ShowtimeDTO>({
        url: `/showtimes`,
        method: "POST",
        data: showtime,
      });

      // Clear showtimes cache
      apiCache.delete("showtimes");
      apiCache.delete("upcoming_showtimes");
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to create showtime. Please try again later."
      );
    }
  },

  updateShowtime: async (
    id: number,
    showtime: ShowtimeDTO
  ): Promise<ShowtimeDTO> => {
    try {
      const data = await axiosWithRetry<ShowtimeDTO>({
        url: `/showtimes/${id}`,
        method: "PUT",
        data: showtime,
      });

      // Clear showtimes cache
      apiCache.delete("showtimes");
      apiCache.delete("upcoming_showtimes");
      apiCache.delete(`showtime_${id}`);
      return data;
    } catch (error) {
      return handleApiError(
        error,
        "Failed to update showtime. Please try again later."
      );
    }
  },

  deleteShowtime: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry<void>({
        url: `/showtimes/${id}`,
        method: "DELETE",
      });

      // Clear showtimes cache
      apiCache.delete("showtimes");
      apiCache.delete("upcoming_showtimes");
      apiCache.delete(`showtime_${id}`);
    } catch (error) {
      return handleApiError(
        error,
        "Failed to delete showtime. Please try again later."
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
      await axiosWithRetry({
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

  createCategory: async (name: string): Promise<ConcessionCategoryDTO> => {
    try {
      return await axiosWithRetry<ConcessionCategoryDTO>({
        url: `/concession-categories`,
        method: "POST",
        data: { name },
      });
    } catch (error) {
      return handleApiError(error, "Failed to create concession category.");
    }
  },

  updateCategory: async (
    id: number,
    name: string
  ): Promise<ConcessionCategoryDTO> => {
    try {
      return await axiosWithRetry<ConcessionCategoryDTO>({
        url: `/concession-categories/${id}`,
        method: "PUT",
        data: { name },
      });
    } catch (error) {
      return handleApiError(error, "Failed to update concession category.");
    }
  },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry({
        url: `/concession-categories/${id}`,
        method: "DELETE",
      });
    } catch (error) {
      return handleApiError(error, "Failed to delete concession category.");
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

  getAllItems: async (): Promise<ConcessionItemDTO[]> => {
    try {
      return await axiosWithRetry<ConcessionItemDTO[]>({
        url: `/concession-items`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch all concession items.");
    }
  },

  createItem: async (
    item: Omit<ConcessionItemDTO, "id" | "categoryName">
  ): Promise<ConcessionItemDTO> => {
    try {
      return await axiosWithRetry<ConcessionItemDTO>({
        url: `/concession-items`,
        method: "POST",
        data: item,
      });
    } catch (error) {
      return handleApiError(error, "Failed to create concession item.");
    }
  },

  updateItem: async (
    id: number,
    item: Partial<ConcessionItemDTO>
  ): Promise<ConcessionItemDTO> => {
    try {
      return await axiosWithRetry<ConcessionItemDTO>({
        url: `/concession-items/${id}`,
        method: "PUT",
        data: item,
      });
    } catch (error) {
      return handleApiError(error, "Failed to update concession item.");
    }
  },

  deleteItem: async (id: number): Promise<void> => {
    try {
      await axiosWithRetry({
        url: `/concession-items/${id}`,
        method: "DELETE",
      });
    } catch (error) {
      return handleApiError(error, "Failed to delete concession item.");
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

  getOrderById: async (id: number): Promise<ConcessionOrderDTO> => {
    try {
      return await axiosWithRetry<ConcessionOrderDTO>({
        url: `/concession-orders/${id}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch concession order.");
    }
  },

  getOrdersByReservation: async (
    reservationId: number
  ): Promise<ConcessionOrderDTO[]> => {
    try {
      return await axiosWithRetry<ConcessionOrderDTO[]>({
        url: `/concession-orders/reservation/${reservationId}`,
        method: "GET",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch concession orders for this reservation."
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

  updateOrderStatus: async (
    id: number,
    status: string
  ): Promise<ConcessionOrderDTO> => {
    try {
      return await axiosWithRetry<ConcessionOrderDTO>({
        url: `/concession-orders/${id}/status`,
        method: "PUT",
        data: { status },
      });
    } catch (error) {
      return handleApiError(error, "Failed to update concession order status.");
    }
  },
};
