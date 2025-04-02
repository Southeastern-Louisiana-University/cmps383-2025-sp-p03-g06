// services/api/index.ts
import { apiRequest } from "./client";
import { moviesApi } from "./moviesApi";
import { theatersApi } from "./theatersApi";
import { authApi, getToken } from "./authApi";
import { showtimesApi } from "./showtimesApi";
import { seatsApi } from "./seatsApi";
import { reservationsApi } from "./reservationsApi";

// Export everything from each module
export * from "./client";
export * from "./moviesApi";
export * from "./theatersApi";
export * from "./authApi";
export * from "./showtimesApi";
export * from "./seatsApi";
export * from "./reservationsApi";

// Add authentication to the apiRequest function
export const authenticatedRequest = <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// Export the API object with all modules
export default {
  apiRequest,
  authenticatedRequest,
  moviesApi,
  theatersApi,
  authApi,
  showtimesApi,
  seatsApi,
  reservationsApi,
};
// Add more API stuff here as needed
