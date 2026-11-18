export interface IncidentOverviewReport {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  closedIncidents: number;
  slaBreaches: number;
  slaComplianceRatePercent: number;
  countByPriority: Record<string, number>;
  countByStatus: Record<string, number>;
}

export interface TechnicianWorkloadReport {
  technicianId: number;
  fullName: string;
  experienceLevel: string;
  maxWorkload: number;
  activeIncidentCount: number;
  available: boolean;
  utilizationPercentage: number;
}

export interface ServiceAnalysisReport {
  serviceId: number;
  serviceName: string;
  businessCriticality: string;
  totalIncidents: number;
  activeIncidents: number;
  slaBreaches: number;
}

export interface AuditRecordResponse {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  action: string;
  incidentId: number;
  previousState?: string;
  newState?: string;
  description: string;
}

export interface SlaPolicyResponse {
  id: number;
  priority: string;
  serviceId?: number;
  serviceName?: string;
  responseTargetMinutes: number;
  resolutionTargetMinutes: number;
  global: boolean;
}

export interface AssignmentStrategyConfigResponse {
  activeStrategy: string;
  activeDescription: string;
  availableStrategies: Array<{
    name: string;
    description: string;
  }>;
}
