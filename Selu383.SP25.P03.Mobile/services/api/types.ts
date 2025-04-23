// services/api/types.ts
import { ImageSourcePropType } from "react-native";

export interface Movie {
  id: number;
  title: string;
  description?: string | null;
  rating?: string | null; // allow both undefined and null to get typescript to stop complaining in /app/movies/index.tsx
  durationMinutes: number;
  genres: string[];
  releaseDate: string;
  posterUrl?: ImageSourcePropType | null;
}

/* This file defines TypeScript interfaces that describe the shape of data
   used across the mobile app, especially data received from the backend API. 
   These interfaces are used in components and API functions so that 
   data conforms to the expected structure and to catch type mismatches early.
*/
