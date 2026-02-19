import axios from "axios";

export const api = axios.create({
  baseURL: "https://ideal-vision-production.up.railway.app/api/",
});

// Optional: attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
