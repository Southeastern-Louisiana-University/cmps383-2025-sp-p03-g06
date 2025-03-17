export const API_BASE_URL = "https://welcome-tough-lioness.ngrok-free.app";

// Make sure to include /api/ in the path
export const fetchApi = async (endpoint: string, options: any = {}) => {
  // Ensure endpoint starts with /api/
  const apiPrefix = "/api";
  const normalizedEndpoint = endpoint.startsWith(apiPrefix)
    ? endpoint
    : `${apiPrefix}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  console.log("Fetching from:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
};

// Example API functions using the proper /api/ path - Can create more as needed.
export const getExample = () => fetchApi("/example");
export const getTheaters = () => fetchApi("/theaters");
