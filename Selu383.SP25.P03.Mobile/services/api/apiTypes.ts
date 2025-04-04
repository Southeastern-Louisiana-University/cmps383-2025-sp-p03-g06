// /services/api/apiTypes.ts

// Theater room interface
export interface TheaterRoom {
  id: number;
  theaterId: number;
  name: string;
  capacity: number;
}

// Showtime interface
export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  theaterRoomId: number;
  theaterRoomName: string;
  theaterId: number;
  theaterName: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  baseTicketPrice: number;
}

// Seat interface
export interface Seat {
  id: number;
  theaterRoomId: number;
  row: string;
  number: number;
  seatType: string;
  isAvailable: boolean;
}
