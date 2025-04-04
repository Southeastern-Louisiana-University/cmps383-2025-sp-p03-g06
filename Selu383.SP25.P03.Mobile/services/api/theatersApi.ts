// services/api/theatersApi.ts
import { apiRequest } from "./client";

// Theater interface is defined based on the backend model
export interface Theater {
  id: number;
  name: string;
  location: string;
  // Add other fields from the TheaterDTO
}

// Theater API methods
export const theatersApi = {
  // Get all theaters
  getAll: () => apiRequest<Theater[]>("api/theaters"),

  // Get theater by ID
  getById: (id: number) => apiRequest<Theater>(`api/theaters/${id}`),
};
// add more theater methods as needed
