import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";


export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async (formData) => {
    const { name, email, password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    set({ loading: true });
    try {
      const response = await axios.post("/auth/signup", {
        name,
        email,
        password,
        confirmPassword,
      });
      set({ user: response.data, loading: false });
      toast.success("Account created successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to create account.");
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post("/auth/login", { email, password });
      set({ user: response.data, loading: false });
      toast.success("Logged in successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to log in.");
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await axios.post("/auth/logout");
      set({ user: null, loading: false });
      toast.success("Logged out successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Failed to log out.");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data });
    } catch {
      set({ user: null });
    } finally {
      set({ checkingAuth: false });
    }
  },

  refreshToken: async () => {
    const response = await axios.post("/auth/refresh-token");
    return response.data;
  },
}));


let refreshPromise = null;
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authRequest = [
      "/auth/login",
      "/auth/signup",
      "/auth/logout",
      "/auth/refresh-token",
    ].some((path) => originalRequest?.url?.includes(path));

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !authRequest
    ) {
      originalRequest._retry = true;
      const currentRefresh = refreshPromise ??= useUserStore.getState().refreshToken();
      try {
        await currentRefresh;
        return axios(originalRequest);
      } catch (refreshError) {
        useUserStore.setState({ user: null });
        return Promise.reject(refreshError);
      } finally {
        if (refreshPromise === currentRefresh) {
          refreshPromise = null;
        }
      }
    }
    return Promise.reject(error);
  }
);
