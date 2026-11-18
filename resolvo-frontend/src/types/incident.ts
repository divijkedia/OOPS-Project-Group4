export type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export type EscalationLevel =
  | 'NONE'
  | 'TECHNICIAN'
  | 'TEAM_LEAD'
  | 'SYSTEM_ADMINISTRATOR'
  | 'IT_MANAGER';

export type IncidentStatus =
  | 'NEW'
  | 'CLASSIFIED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED'
  | 'REPORTED';

export type Impact = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Urgency = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type SlaStatus = 'WITHIN_SLA' | 'APPROACHING_BREACH' | 'BREACHED';

export interface ItServiceResponse {
  id: number;
  name: string;
  description?: string;
  businessCriticality: 'MISSION_CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  active?: boolean;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
  keywords?: string;
}

export interface SlaTrackingResponse {
  responseTargetMinutes?: number;
  resolutionTargetMinutes?: number;
  responseDeadline: string;
  resolutionDeadline: string;
  respondedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  responseBreached: boolean;
  resolutionBreached: boolean;
  slaStatus: SlaStatus;
}

export interface ResolutionResponse {
  resolvedById: number;
  summary: string;
  rootCause?: string;
  steps?: string;
}

export interface FeedbackResponse {
  rating: number; // 1-5
  comment?: string;
  submittedAt: string;
}

export interface FileAttachment {
  name: string;
  type: string;
  data: string;
  size?: number;
}

export interface InvestigationNoteResponse {
  id: number;
  incidentId: number;
  authorId: number;
  authorName: string;
  content: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentData?: string;
  createdAt: string;
}

export interface IncidentSummaryResponse {
  id: number;
  title: string;
  priority: Priority;
  status: IncidentStatus;
  serviceName: string;
  categoryName: string;
  reporterName: string;
  technicianName?: string;
  slaStatus: SlaStatus;
  escalationLevel?: EscalationLevel;
  createdAt: string;
}

export interface IncidentResponse {
  id: number;
  title: string;
  description: string;
  impact: Impact;
  urgency: Urgency;
  businessCriticality: string;
  priority: Priority;
  priorityScore: number;
  status: IncidentStatus;
  escalationLevel?: EscalationLevel;
  escalatedAt?: string;
  escalationReason?: string;
  affectedUserCount: number;

  reporter: {
    id: number;
    username: string;
    fullName: string;
    email: string;
  };

  service: {
    id: number;
    name: string;
    businessCriticality: string;
  };

  category: {
    id: number;
    name: string;
  };

  assignedTechnician?: {
    id: number;
    username: string;
    fullName: string;
    experienceLevel: string;
  } | null;

  slaTracking?: SlaTrackingResponse | null;
  resolution?: ResolutionResponse | null;
  feedback?: FeedbackResponse | null;
  notes: InvestigationNoteResponse[];
  relatedIncidentIds: number[];

  attachmentName?: string;
  attachmentType?: string;
  attachmentData?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  serviceId: number;
  categoryId?: number;
  impact: Impact;
  urgency: Urgency;
  affectedUserCount?: number;
  attachmentName?: string;
  attachmentType?: string;
  attachmentData?: string;
}

export interface ResolveIncidentRequest {
  summary: string;
  rootCause?: string;
  steps?: string;
  correlatedIncidentIds?: number[];
}

export interface BatchResolveRequest {
  incidentIds: number[];
  summary: string;
  rootCause?: string;
  steps?: string;
}

export interface BatchResolveResponse {
  totalResolved: number;
  resolvedIncidentIds: number[];
  summary: string;
  message: string;
}

export interface FeedbackRequest {
  rating: number; // 1-5
  comment?: string;
}

export interface TechnicianRecommendationResponse {
  technicianId: number;
  fullName?: string;
  technicianName?: string;
  experienceLevel: string;
  currentWorkload?: number;
  activeWorkload?: number;
  maxWorkload: number;
  matchScore?: number;
  totalScore?: number;
  skillScore?: number;
  skillMatchScore?: number;
  capacityScore?: number;
  workloadScore?: number;
  experienceScore?: number;
  serviceHistoryScore?: number;
  explanation?: string;
  reason?: string;
}

export interface DuplicateIncidentResponse {
  incidentId: number;
  title: string;
  similarityScore: number;
  reason: string;
}

export type CorrelationType =
  | 'SHARED_SERVICE'
  | 'INFRASTRUCTURE_DEPENDENCY'
  | 'TEMPORAL_SPIKE'
  | 'SYMPTOM_PATTERN';

export interface CorrelatedIncident {
  incidentId: number;
  title: string;
  serviceName: string;
  categoryName: string;
  status: string;
  priority: Priority;
  affectedUserCount: number;
  createdAt: string;
  correlationType: CorrelationType;
  correlationScore: number;
  sharedComponent: string;
  rationale: string;
}

export interface IncidentCorrelationReport {
  targetIncidentId: number;
  targetServiceName: string;
  totalCorrelatedCount: number;
  blastRadiusUserCount: number;
  impactedServicesCount: number;
  probableRootCause: string;
  highestPriorityInCluster: Priority;
  correlations: CorrelatedIncident[];
}

export interface OutageCluster {
  clusterId: string;
  sharedComponent: string;
  rootCauseHypothesis: string;
  incidentCount: number;
  totalAffectedUsers: number;
  highestPriority: Priority;
  detectedAt: string;
  incidentIds: number[];
  affectedServiceNames: string[];
}

export interface EscalationStatusResponse {
  incidentId: number;
  currentLevel: EscalationLevel;
  escalatedAt?: string;
  escalationReason?: string;
  requiresEscalation: boolean;
  recommendations: string[];
}

export interface EscalateIncidentRequest {
  targetLevel?: EscalationLevel;
  reason?: string;
}
