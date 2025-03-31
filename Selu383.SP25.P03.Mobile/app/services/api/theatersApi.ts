// services/api/theatersApi.ts
import { apiRequest } from "./client";

// Define theater interface based on your backend model
export interface Theater {
  id: number;
  name: string;
  location: string;
  // Add other fields from your TheaterDTO
}

// Theater API methods
export const theatersApi = {
  // Get all theaters
  getAll: () => apiRequest<Theater[]>("api/theaters"),

  // Get theater by ID
  getById: (id: number) => apiRequest<Theater>(`api/theaters/${id}`),
};
// At the end of services/api/index.ts
