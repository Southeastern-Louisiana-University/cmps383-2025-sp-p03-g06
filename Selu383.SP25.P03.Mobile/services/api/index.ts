// services/api/index.ts

export { apiRequest } from "./client";
export { moviesApi } from "./moviesApi";
export { authApi, getToken, saveToken, clearToken } from "./authApi";
export { reservationsApi } from "./reservationsApi";
// Add similar lines for other API files if needed

// Authenticated request with token
import { apiRequest } from "./client";
import { getToken } from "./authApi";
import { moviesApi } from "./moviesApi";
import { theatersApi } from "./theatersApi";

export const authenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getToken();
export * from "./client";
export * from "./moviesApi";
export * from "./theatersApi";
// // Add other API modules here as you create them
// Export other API modules as you create them

export default {
  apiRequest,
  moviesApi,
  theatersApi,
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
