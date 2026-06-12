import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Demo mode: restore session from localStorage on load
const storedUser = localStorage.getItem('user');
const initialUser: User | null = storedUser
  ? JSON.parse(storedUser)
  : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: 'demo-token', // always set so token check never blocks
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',

  login: (user, _token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    set({ user, token: 'demo-token', isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
