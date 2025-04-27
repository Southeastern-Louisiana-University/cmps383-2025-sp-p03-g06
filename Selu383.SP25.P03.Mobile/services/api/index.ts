// services/api/index.ts
import { apiRequest } from "./client";
import { moviesApi } from "./moviesApi";
import { theatersApi } from "./theatersApi";
import { concessionsApi } from "./concessionsApi";
import { ordersApi } from "./ordersApi";

export * from "./client";
export * from "./moviesApi";
export * from "./theatersApi";
export * from "./concessionsApi";
export * from "./ordersApi";
// // Add other API modules here as you create them
// Export other API modules as you create them

export default {
  apiRequest,
  moviesApi,
  theatersApi,
  concessionsApi,
  ordersApi,
};
