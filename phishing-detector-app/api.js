import axios from "axios";

// For Expo / real devices, "localhost" points to the phone itself.
// Set these in phishing-detector-app/.env:
//   EXPO_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
//   EXPO_PUBLIC_API_KEY=your_customer_api_key
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "https://counterscam1-1.onrender.com";
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || "";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Attach API key + request id
api.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers["X-API-Key"] = API_KEY;
  }
  config.headers["X-Request-ID"] = config.headers["X-Request-ID"] || `${Date.now()}-${Math.random()}`;
  return config;
});

export default api;

export const checkUrl = (url) => api.post("/check_url/", { url });
export const checkMessage = (message) => api.post("/check_message/", { message });
