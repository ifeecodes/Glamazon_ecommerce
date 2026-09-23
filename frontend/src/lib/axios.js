import axios from "axios";
const axiosInstance = axios.create({
  baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api", // Replace with your backend API URL
  withCredentials: true, // Include credentials (cookies) in requests
  headers: {
    "Content-Type": "application/json",
  },
});
export default axiosInstance;