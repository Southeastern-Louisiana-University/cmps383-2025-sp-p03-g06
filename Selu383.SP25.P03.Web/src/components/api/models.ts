export interface TheaterDTO {
  id: number;
  name: string;
  address: string;
  seatCount: number;
  managerId: number | null;
}

export interface TheaterRoomDTO {
  id: number;
  name: string;
  theaterId: number;
  seatCount: number;
  screenType: string;
}
