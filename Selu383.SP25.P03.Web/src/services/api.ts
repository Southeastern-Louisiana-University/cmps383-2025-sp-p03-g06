// src/services/api.ts

// Base URL for API requests - no need for the environment check since we're using the proxy
const API_BASE_URL = "/api";

// Types
export interface LoginRequest {
  userName: string;
  password: string;
}

export interface UserDTO {
  id: number;
  userName: string;
  roles: string[];
}

export interface TheaterDTO {
  id: number;
  name: string;
  address: string;
  seatCount: number;
  managerId: number | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  roles: string[];
}

// Authentication API calls
export const authApi = {
  login: async (credentials: LoginRequest): Promise<UserDTO> => {
    console.log("Attempting login with:", credentials.userName);
    const response = await fetch(`${API_BASE_URL}/authentication/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      console.error("Login failed with status:", response.status);
      throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("Login successful, received user data:", data);
    return data;
  },

  getCurrentUser: async (): Promise<UserDTO> => {
    console.log("Fetching current user...");
    const response = await fetch(`${API_BASE_URL}/authentication/me`, {
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      console.error("Failed to get current user, status:", response.status);
      throw new Error("Failed to get current user");
    }

    const data = await response.json();
    console.log("Current user data:", data);
    return data;
  },

  logout: async (): Promise<void> => {
    console.log("Attempting logout...");
    const response = await fetch(`${API_BASE_URL}/authentication/logout`, {
      method: "POST",
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      console.error("Logout failed with status:", response.status);
      throw new Error("Logout failed");
    }

    console.log("Logout successful");
  },
};

// User API calls
export const userApi = {
  createUser: async (userData: CreateUserRequest): Promise<UserDTO> => {
    console.log("Creating new user:", userData.username);
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error("User creation failed with status:", response.status);
      throw new Error("User creation failed");
    }

    const data = await response.json();
    console.log("User created successfully:", data);
    return data;
  },

  register: async (userData: CreateUserRequest): Promise<UserDTO> => {
    console.log("Registering new user:", userData.username);
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error("Registration failed with status:", response.status);
      throw new Error("Registration failed");
    }

    const data = await response.json();
    console.log("User registered successfully:", data);
    return data;
  },
};

// Theater API calls
export const theaterApi = {
  getAllTheaters: async (): Promise<TheaterDTO[]> => {
    console.log("Fetching all theaters...");
    const response = await fetch(`${API_BASE_URL}/theaters`, {
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      console.error("Failed to fetch theaters, status:", response.status);
      throw new Error("Failed to fetch theaters");
    }

    const data = await response.json();
    console.log("Retrieved theaters:", data);
    return data;
  },

  getTheaterById: async (id: number): Promise<TheaterDTO> => {
    console.log(`Fetching theater with id ${id}...`);
    const response = await fetch(`${API_BASE_URL}/theaters/${id}`, {
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch theater with id ${id}, status:`,
        response.status
      );
      throw new Error(`Failed to fetch theater with id ${id}`);
    }

    const data = await response.json();
    console.log("Retrieved theater:", data);
    return data;
  },

  createTheater: async (
    theater: Omit<TheaterDTO, "id">
  ): Promise<TheaterDTO> => {
    console.log("Creating new theater:", theater);
    const response = await fetch(`${API_BASE_URL}/theaters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify(theater),
    });

    if (!response.ok) {
      console.error("Failed to create theater, status:", response.status);
      throw new Error("Failed to create theater");
    }

    const data = await response.json();
    console.log("Theater created successfully:", data);
    return data;
  },

  updateTheater: async (
    id: number,
    theater: Omit<TheaterDTO, "id">
  ): Promise<TheaterDTO> => {
    console.log(`Updating theater with id ${id}:`, theater);
    const response = await fetch(`${API_BASE_URL}/theaters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ ...theater, id }),
    });

    if (!response.ok) {
      console.error(
        `Failed to update theater with id ${id}, status:`,
        response.status
      );
      throw new Error(`Failed to update theater with id ${id}`);
    }

    const data = await response.json();
    console.log("Theater updated successfully:", data);
    return data;
  },

  deleteTheater: async (id: number): Promise<void> => {
    console.log(`Deleting theater with id ${id}...`);
    const response = await fetch(`${API_BASE_URL}/theaters/${id}`, {
      method: "DELETE",
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      console.error(
        `Failed to delete theater with id ${id}, status:`,
        response.status
      );
      throw new Error(`Failed to delete theater with id ${id}`);
    }

    console.log(`Theater with id ${id} deleted successfully`);
  },
};
