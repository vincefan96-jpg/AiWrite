import { create } from "zustand";
import api from "../services/api";
import type { User, AuthResponse } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

function setAuth(user: User) {
  return { user, isAuthenticated: true, loading: false, initializing: false };
}

function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  return { user: null, isAuthenticated: false, initializing: false };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  initializing: !!localStorage.getItem("access_token"),

  login: async (email, password) => {
    set({ loading: true });
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    set(setAuth(res.data.user));
  },

  register: async (email, username, password) => {
    set({ loading: true });
    const res = await api.post<AuthResponse>("/auth/register", { email, username, password });
    localStorage.setItem("access_token", res.data.access_token);
    localStorage.setItem("refresh_token", res.data.refresh_token);
    set(setAuth(res.data.user));
  },

  logout: () => set(clearAuth()),

  fetchMe: async () => {
    try {
      const res = await api.get<User>("/auth/me");
      set(setAuth(res.data));
    } catch {
      set(clearAuth());
    }
  },
}));
