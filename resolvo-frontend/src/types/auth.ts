export type Role = 'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
  active: boolean;
  department?: string;
  specialization?: string;
  experienceLevel?: string;
  maxWorkload?: number;
  activeIncidentCount?: number;
  activeIncidentsCount?: number;
  available?: boolean;
  skills?: string[];
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  role: Role;
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  department?: string;
  specialization?: string;
  experienceLevel?: string;
  maxWorkload?: number;
  skills?: string[];
}
