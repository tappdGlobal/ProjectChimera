import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  phone: string;
  bio?: string;
  avatar?: string;
  settings?: {
    notifications: boolean;
    privacy: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  toggleSettings: (key: 'notifications' | 'privacy') => void;
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
  toggleSettings: (key) => set((state) => {
    if (!state.user) return state;
    const currentSettings = state.user.settings || { notifications: true, privacy: false };
    return {
        user: {
            ...state.user,
            settings: {
                ...currentSettings,
                [key]: !currentSettings[key]
            }
        }
    };
  }),
}));
