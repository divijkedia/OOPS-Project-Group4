import { createContext } from 'react';
import type { UserResponse, LoginRequest, RegisterRequest, Role } from '../types/auth';

export interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<UserResponse>;
  register: (details: RegisterRequest) => Promise<UserResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
