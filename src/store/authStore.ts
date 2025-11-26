import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check auth status
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  checkAuth: async () => {
    // Simulate checking async storage or API
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false, isAuthenticated: false }); // Default to not authenticated for now
    }, 1000);
  },
}));
