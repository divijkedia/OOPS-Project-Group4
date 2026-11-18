import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  IncidentOverviewReport,
  TechnicianWorkloadReport,
  ServiceAnalysisReport,
} from '../types/report';

export const reportsApi = {
  async getOverviewReport(): Promise<IncidentOverviewReport> {
    const res = await apiClient.get<ApiResponse<IncidentOverviewReport>>('/reports/overview');
    return res.data.data;
  },

  async getTechnicianWorkloadReport(): Promise<TechnicianWorkloadReport[]> {
    const res = await apiClient.get<ApiResponse<TechnicianWorkloadReport[]>>('/reports/technicians');
    return res.data.data;
  },

  async getServiceAnalysisReport(): Promise<ServiceAnalysisReport[]> {
    const res = await apiClient.get<ApiResponse<ServiceAnalysisReport[]>>('/reports/services');
    return res.data.data;
  },

  async downloadIncidentsCsv(): Promise<Blob> {
    const res = await apiClient.get('/reports/export/csv', {
      responseType: 'blob',
    });
    return res.data;
  },
};
