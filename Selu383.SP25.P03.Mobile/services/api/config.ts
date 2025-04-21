const isDev = process.env.NODE_ENV === "development";

//This is for getting poster images served ny the api.
export const API_BASE_URL = isDev
  ? "http://localhost:5249" // or your dev tunnel URL or your local IP address if on a physical device
  : "https://cmps383-2025-sp-p03-g06.azurewebsites.net/";
