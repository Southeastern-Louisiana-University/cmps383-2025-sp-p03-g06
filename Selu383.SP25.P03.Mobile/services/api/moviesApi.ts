// services/api/moviesApi.ts
import { apiRequest } from "./client";

// Define movie interface based on your backend MovieDTO
export interface Movie {
  id: number;
  title: string;
  description?: string | null;
  durationMinutes: number;
  rating?: string | null;
  posterImageUrl?: string | null;
  releaseDate: string; // This will be a date string in ISO format
  genres: string[];
}

// Movie API methods
export const moviesApi = {
  // Get all movies
  getAll: () => apiRequest<Movie[]>("api/movies"),

  // Get movie by ID
  getById: (id: number) => apiRequest<Movie>(`api/movies/${id}`),

  // Create a new movie (requires admin/manager role)
  create: (movie: Omit<Movie, "id">) =>
    apiRequest<Movie>("api/movies", {
      method: "POST",
      body: JSON.stringify(movie),
    }),

  // Update an existing movie (requires admin/manager role)
  update: (id: number, movie: Movie) =>
    apiRequest<Movie>(`api/movies/${id}`, {
      method: "PUT",
      body: JSON.stringify(movie),
    }),

  // Delete a movie (requires admin/manager role)
  delete: (id: number) =>
    apiRequest(`api/movies/${id}`, {
      method: "DELETE",
    }),
};
// At the end of services/api/index.ts
