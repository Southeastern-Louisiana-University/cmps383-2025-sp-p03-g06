// /services/api/apiTypes.ts

//Theater interface
export interface Theater {
  id: number;
  name: string;
  address: string; // Changed from 'location' to 'address'
  seatCount: number; // Added this field from your response
  managerId: number | null; // Added this field from your response
}

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

// Concession Types
export interface ConcessionCategory {
  id: number;
  name: string;
}

export interface CreateConcessionCategory {
  name: string;
}

export interface ConcessionItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  isAvailable: boolean;
}

export interface CreateConcessionItem {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  isAvailable: boolean;
}

// Concession Order Types
export interface OrderItem {
  id: number;
  concessionItemId: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface ConcessionOrder {
  id: number;
  reservationId: number;
  orderTime: string; // ISO date
  totalPrice: number;
  status: string;
  seatNumber?: string;
  items: OrderItem[];
}

export interface CreateOrderItem {
  concessionItemId: number;
  quantity: number;
  specialInstructions?: string;
}

export interface CreateConcessionOrder {
  reservationId: number;
  seatNumber?: string;
  items: CreateOrderItem[];
}

export interface UpdateOrderStatus {
  status: string;
}
