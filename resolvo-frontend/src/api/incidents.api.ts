import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  IncidentResponse,
  IncidentSummaryResponse,
  CreateIncidentRequest,
  ResolveIncidentRequest,
  BatchResolveRequest,
  BatchResolveResponse,
  FeedbackRequest,
  TechnicianRecommendationResponse,
  DuplicateIncidentResponse,
  IncidentCorrelationReport,
  OutageCluster,
  EscalationLevel,
  EscalationStatusResponse,
  EscalateIncidentRequest,
} from '../types/incident';

export interface SearchIncidentsParams {
  search?: string;
  status?: string;
  priority?: string;
  categoryId?: number;
  serviceId?: number;
  technicianId?: number;
  reporterId?: number;
  slaStatus?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const incidentsApi = {
  async getIncidents(params?: SearchIncidentsParams): Promise<IncidentSummaryResponse[]> {
    const res = await apiClient.get<ApiResponse<IncidentSummaryResponse[]>>('/incidents', {
      params,
    });
    return res.data.data;
  },

  async getIncidentById(id: number): Promise<IncidentResponse> {
    const res = await apiClient.get<ApiResponse<IncidentResponse>>(`/incidents/${id}`);
    return res.data.data;
  },

  async createIncident(request: CreateIncidentRequest): Promise<IncidentResponse> {
    const res = await apiClient.post<ApiResponse<IncidentResponse>>('/incidents', request);
    return res.data.data;
  },

  async acknowledgeIncident(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/acknowledge`);
    return res.data.data;
  },

  async startInvestigation(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/start`);
    return res.data.data;
  },

  async addNote(
    id: number,
    content: string,
    attachment?: { name: string; type: string; data: string }
  ): Promise<IncidentResponse> {
    const res = await apiClient.post<ApiResponse<IncidentResponse>>(`/incidents/${id}/notes`, {
      content,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
      attachmentData: attachment?.data,
    });
    return res.data.data;
  },

  async resolveIncident(id: number, request: ResolveIncidentRequest): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/resolve`, request);
    return res.data.data;
  },

  async batchResolveIncidents(request: BatchResolveRequest): Promise<BatchResolveResponse> {
    const res = await apiClient.post<ApiResponse<BatchResolveResponse>>('/incidents/batch-resolve', request);
    return res.data.data;
  },

  async verifyIncident(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/verify`);
    return res.data.data;
  },

  async closeIncident(id: number): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/close`);
    return res.data.data;
  },

  async reopenIncident(id: number, reason: string): Promise<IncidentResponse> {
    const res = await apiClient.put<ApiResponse<IncidentResponse>>(`/incidents/${id}/reopen`, {
      reason,
    });
    return res.data.data;
  },

  async submitFeedback(id: number, request: FeedbackRequest): Promise<IncidentResponse> {
    const res = await apiClient.post<ApiResponse<IncidentResponse>>(`/incidents/${id}/feedback`, request);
    return res.data.data;
  },

  async getRecommendations(id: number): Promise<TechnicianRecommendationResponse[]> {
    const res = await apiClient.get<ApiResponse<TechnicianRecommendationResponse[]>>(
      `/incidents/${id}/recommendations`
    );
    return res.data.data;
  },

  async getDuplicates(id: number): Promise<DuplicateIncidentResponse[]> {
    const res = await apiClient.get<ApiResponse<DuplicateIncidentResponse[]>>(
      `/incidents/${id}/duplicates`
    );
    return res.data.data;
  },

  async getIncidentCorrelations(id: number): Promise<IncidentCorrelationReport> {
    const res = await apiClient.get<ApiResponse<IncidentCorrelationReport>>(
      `/incidents/${id}/correlations`
    );
    return res.data.data;
  },

  async getActiveOutageClusters(): Promise<OutageCluster[]> {
    const res = await apiClient.get<ApiResponse<OutageCluster[]>>(
      '/incidents/correlations/clusters'
    );
    return res.data.data;
  },

  async escalateIncident(
    id: number,
    targetLevel?: EscalationLevel,
    reason?: string
  ): Promise<IncidentResponse> {
    const payload: EscalateIncidentRequest = { targetLevel, reason };
    const res = await apiClient.post<ApiResponse<IncidentResponse>>(`/incidents/${id}/escalate`, payload);
    return res.data.data;
  },

  async getEscalationStatus(id: number): Promise<EscalationStatusResponse> {
    const res = await apiClient.get<ApiResponse<EscalationStatusResponse>>(`/incidents/${id}/escalation`);
    return res.data.data;
  },

  async getMyReportedIncidents(): Promise<IncidentSummaryResponse[]> {
    const res = await apiClient.get<ApiResponse<IncidentSummaryResponse[]>>('/employee/incidents');
    return res.data.data;
  },

  async getMyAssignedIncidents(): Promise<IncidentSummaryResponse[]> {
    const res = await apiClient.get<ApiResponse<IncidentSummaryResponse[]>>('/technician/incidents');
    return res.data.data;
  },
};
