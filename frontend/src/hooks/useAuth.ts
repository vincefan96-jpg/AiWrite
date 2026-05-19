import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const { user, isAuthenticated, initializing, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    if (initializing) {
      fetchMe();
    }
  }, [initializing, fetchMe]);

  return { user, isAuthenticated, initializing, logout };
}
