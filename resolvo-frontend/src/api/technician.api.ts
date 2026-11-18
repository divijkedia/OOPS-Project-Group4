import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { IncidentSummaryResponse } from '../types/incident';
import type { UserResponse } from '../types/auth';

export interface TechnicianWorkloadResponse {
  technicianId: number;
  fullName: string;
  experienceLevel: string;
  activeIncidentCount: number;
  maxWorkload: number;
  available: boolean;
  capacityRemaining: number;
}

export const technicianApi = {
  async getMyAssignedIncidents(): Promise<IncidentSummaryResponse[]> {
    const res = await apiClient.get<ApiResponse<IncidentSummaryResponse[]>>('/technician/incidents');
    return res.data.data;
  },

  async getMyWorkload(): Promise<TechnicianWorkloadResponse> {
    const res = await apiClient.get<ApiResponse<TechnicianWorkloadResponse>>('/technician/workload');
    return res.data.data;
  },

  async setAvailability(available: boolean): Promise<UserResponse> {
    const res = await apiClient.put<ApiResponse<UserResponse>>('/technician/availability', null, {
      params: { available },
    });
    return res.data.data;
  },
};
