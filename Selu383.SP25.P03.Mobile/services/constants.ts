// services/constants.ts
import { Platform } from "react-native";

const getBaseUrl = () => {
  // Use deployed URL in production
  if (process.env.NODE_ENV === "production") {
    return "https://cmps383-2025-sp-p03-g06.azurewebsites.net/";
  }

  // Use Android emulator IP during local dev
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5249";
  }
  // Default to iOS simulator or web
  return "http://localhost:5249";
};

export const API_BASE_URL = getBaseUrl();
