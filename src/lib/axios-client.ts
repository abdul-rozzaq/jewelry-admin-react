import axios from "axios";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://zargar.pythonanywhere.com/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  config.headers["ngrok-skip-browser-warning"] = "true";
  
  return config;
});


