import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types/auth';

export const authApi = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', request);
    return res.data.data;
  },

  async register(request: RegisterRequest): Promise<UserResponse> {
    const res = await apiClient.post<ApiResponse<UserResponse>>('/auth/register', request);
    return res.data.data;
  },

  async getCurrentUser(): Promise<UserResponse> {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/auth/me');
    return res.data.data;
  },
};
