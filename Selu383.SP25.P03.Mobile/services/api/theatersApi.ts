// services/api/theatersApi.ts
import { apiRequest } from "./client";

// Updated interface to match your backend response
export interface Theater {
    id: number;
    name: string;
    address: string;  // Changed from 'location' to 'address'
    seatCount: number; // Added this field from your response
    managerId: number | null; // Added this field from your response
}

// Theater API methods remain the same
export const theatersApi = {
    getAll: () => apiRequest<Theater[]>("api/theaters"),
    getById: (id: number) => apiRequest<Theater>(`api/theaters/${id}`),
};