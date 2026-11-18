import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { UserResponse } from '../types/auth';
import type { ItServiceResponse, CategoryResponse, IncidentResponse } from '../types/incident';
import type { AuditRecordResponse, SlaPolicyResponse, AssignmentStrategyConfigResponse } from '../types/report';

export const adminApi = {
  async listUsers(): Promise<UserResponse[]> {
    const res = await apiClient.get<ApiResponse<UserResponse[]>>('/admin/users');
    return res.data.data;
  },

  async listTechnicians(): Promise<UserResponse[]> {
    const res = await apiClient.get<ApiResponse<UserResponse[]>>('/admin/technicians');
    return res.data.data;
  },

  async listServices(): Promise<ItServiceResponse[]> {
    const res = await apiClient.get<ApiResponse<ItServiceResponse[]>>('/admin/services');
    return res.data.data;
  },

  async createService(data: {
    name: string;
    description: string;
    businessCriticality: string;
  }): Promise<ItServiceResponse> {
    const res = await apiClient.post<ApiResponse<ItServiceResponse>>('/admin/services', data);
    return res.data.data;
  },

  async deleteService(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/services/${id}`);
  },

  async listCategories(): Promise<CategoryResponse[]> {
    const res = await apiClient.get<ApiResponse<CategoryResponse[]>>('/admin/categories');
    return res.data.data;
  },

  async createCategory(data: {
    name: string;
    description: string;
    keywords: string;
  }): Promise<CategoryResponse> {
    const res = await apiClient.post<ApiResponse<CategoryResponse>>('/admin/categories', data);
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/categories/${id}`);
  },

  async listSlaPolicies(): Promise<SlaPolicyResponse[]> {
    const res = await apiClient.get<ApiResponse<SlaPolicyResponse[]>>('/admin/sla-policies');
    return res.data.data;
  },

  async createSlaPolicy(data: {
    priority: string;
    serviceId?: number;
    responseTargetMinutes: number;
    resolutionTargetMinutes: number;
  }): Promise<SlaPolicyResponse> {
    const res = await apiClient.post<ApiResponse<SlaPolicyResponse>>('/admin/sla-policies', data);
    return res.data.data;
  },

  async deleteSlaPolicy(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/sla-policies/${id}`);
  },

  async getAssignmentStrategy(): Promise<AssignmentStrategyConfigResponse> {
    const res = await apiClient.get<ApiResponse<AssignmentStrategyConfigResponse>>(
      '/admin/config/assignment-strategy'
    );
    return res.data.data;
  },

  async switchAssignmentStrategy(strategyName: string): Promise<void> {
    await apiClient.put<ApiResponse<unknown>>('/admin/config/assignment-strategy', {
      strategyName,
    });
  },

  async getIncidentAuditTrail(incidentId: number): Promise<AuditRecordResponse[]> {
    const res = await apiClient.get<ApiResponse<AuditRecordResponse[]>>(`/audit/incidents/${incidentId}`);
    return res.data.data;
  },

  async getAllAuditRecords(): Promise<AuditRecordResponse[]> {
    const res = await apiClient.get<ApiResponse<AuditRecordResponse[]>>('/audit');
    return res.data.data;
  },

  async classifyIncident(id: number, categoryId: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/classify`, {
      categoryId,
    });
    return res.data.data;
  },

  async assignTechnician(id: number, technicianId: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/assign`, {
      technicianId,
    });
    return res.data.data;
  },

  async unassignTechnician(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/unassign`);
    return res.data.data;
  },

  async closeIncident(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/close`);
    return res.data.data;
  },

  async runAutoEscalation(): Promise<{ escalatedCount: number }> {
    const res = await apiClient.post<ApiResponse<{ escalatedCount: number }>>('/admin/escalation/run');
    return res.data.data;
  },
};
