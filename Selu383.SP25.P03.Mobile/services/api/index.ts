// services/api/index.ts
import { apiRequest } from "./client";
import { moviesApi } from "./moviesApi";
import { theatersApi } from "./theatersApi";

export * from "./client";
export * from "./moviesApi";
export * from "./theatersApi";
// // Add other API modules here as you create them
// Export other API modules as you create them

export default {
  apiRequest,
  moviesApi,
  theatersApi,
};
