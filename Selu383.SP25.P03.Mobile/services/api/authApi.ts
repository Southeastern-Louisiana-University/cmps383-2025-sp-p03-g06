// services/api/authApi.ts
import { apiRequest } from "@/services/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Token storage functions
export const saveToken = async (token: string) => {
  try {
    console.log(token);
    await AsyncStorage.setItem("auth_token", token);
  } catch (error) {
    console.error("Error saving auth token:", error);
  }
};

export const getToken = async () => {
  try {
    console.log("getToken");
    console.log(await AsyncStorage.getItem("auth_token"));
    return await AsyncStorage.getItem("auth_token");
  } catch (error) {
    console.error("Error retrieving auth token:", error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem("auth_token");
  } catch (error) {
    console.error("Error clearing auth token:", error);
  }
};

// Authentication API methods
export const authApi = {
  // Login with username and password
  login: (credentials: LoginRequest) =>
    apiRequest<AuthResponse>("api/authentication/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Register a new user
  register: ( userData: RegisterRequest) =>
    apiRequest<AuthResponse>("api/authentication/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const token = await getToken();
    if (!token) throw new Error("No auth token present");

    return apiRequest<User>("api/authentication/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Logout - client-side only
  logout: () => {
   clearToken();
    return Promise.resolve(true);
  },
};
