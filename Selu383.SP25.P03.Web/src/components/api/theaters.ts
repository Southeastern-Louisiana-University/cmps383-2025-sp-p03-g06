import { TheaterDTO, TheaterRoomDTO } from "./models";

const API_BASE_URL = "http://localhost:5249";

export const theaterApi = {
  getAllTheaters: async (): Promise<TheaterDTO[]> => {
    const response = await fetch(`${API_BASE_URL}/api/theaters`);
    if (!response.ok) throw new Error("Failed to fetch theaters");
    return response.json();
  },

  getTheaterRoomsById: async (theaterId: number): Promise<TheaterRoomDTO[]> => {
    const response = await fetch(
      `${API_BASE_URL}/api/theaters/${theaterId}/rooms`
    );
    if (!response.ok) throw new Error("Failed to fetch theater rooms");
    return response.json();
  },

  createTheater: async (
    theater: Omit<TheaterDTO, "id">
  ): Promise<TheaterDTO> => {
    const response = await fetch(`${API_BASE_URL}/api/theaters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theater),
    });
    if (!response.ok) throw new Error("Failed to create theater");
    return response.json();
  },

  updateTheater: async (id: number, theater: TheaterDTO): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/theaters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theater),
    });
    if (!response.ok) throw new Error("Failed to update theater");
  },

  deleteTheater: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/theaters/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete theater");
  },

  createTheaterRoom: async (
    room: Omit<TheaterRoomDTO, "id">
  ): Promise<TheaterRoomDTO> => {
    const response = await fetch(`${API_BASE_URL}/api/theater-rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    });
    if (!response.ok) throw new Error("Failed to create theater room");
    return response.json();
  },

  updateTheaterRoom: async (
    id: number,
    room: TheaterRoomDTO
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/theater-rooms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(room),
    });
    if (!response.ok) throw new Error("Failed to update theater room");
  },

  deleteTheaterRoom: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/theater-rooms/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete theater room");
  },
};
