// services/api/client.ts

const API_URL = "http://10.0.2.2:5249";
const isProd = process.env.NODE_ENV === "production";
const PROD_URL = "https://cmps383-2025-sp-p03-g06.azurewebsites.net";
const BASE_URL = isProd ? PROD_URL : API_URL;

export const apiRequest = async <T>(
import { API_BASE_URL } from "../constants";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}/${
      endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    }`;

    console.log(`Making API request to: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};
