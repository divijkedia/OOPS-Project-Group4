import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../../api/incidents.api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PriorityBadge, StatusBadge, SlaBadge, EscalationBadge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatRelativeTime, formatSlaCountdown } from '../../lib/formatters';
import type { IncidentStatus, EscalationLevel, FileAttachment } from '../../types/incident';
import { AttachmentViewer } from '../../components/common/AttachmentViewer';
import { AttachmentInput } from '../../components/common/AttachmentInput';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Play,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  UserCheck,
  Wrench,
  HelpCircle,
  Network,
} from 'lucide-react';

export const TechnicianIncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const incidentId = Number(id);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Modal States
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveSummary, setResolveSummary] = useState('');
  const [resolveRootCause, setResolveRootCause] = useState('');
  const [resolveSteps, setResolveSteps] = useState('');
  const [selectedCorrelatedIds, setSelectedCorrelatedIds] = useState<number[]>([]);

  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [requestInfoContent, setRequestInfoContent] = useState('');

  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [targetEscalationLevel, setTargetEscalationLevel] = useState<EscalationLevel>('TEAM_LEAD');
  const [escalationReason, setEscalationReason] = useState('');

  const [diagnosticNote, setDiagnosticNote] = useState('');
  const [diagnosticAttachment, setDiagnosticAttachment] = useState<FileAttachment | null>(null);

  // Fetch Incident Details (polling every 15s)
  const {
    data: incident,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentsApi.getIncidentById(incidentId),
    enabled: !isNaN(incidentId),
    refetchInterval: 15000,
  });

  // Fetch Duplicate Incidents
  const { data: duplicates = [] } = useQuery({
    queryKey: ['incident-duplicates', incidentId],
    queryFn: () => incidentsApi.getDuplicates(incidentId),
    enabled: !isNaN(incidentId),
  });

  // Fetch Incident Correlation & Root Cause Analysis
  const { data: correlationReport } = useQuery({
    queryKey: ['incident-correlations', incidentId],
    queryFn: () => incidentsApi.getIncidentCorrelations(incidentId),
    enabled: !isNaN(incidentId),
  });

  // Fetch Smart Technician Recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['incident-recommendations', incidentId],
    queryFn: () => incidentsApi.getRecommendations(incidentId),
    enabled: !isNaN(incidentId),
  });

  // Filter correlations and duplicates to only items with >= 85% match
  const highConfidenceCorrelations = useMemo(() => {
    return (correlationReport?.correlations || []).filter(
      (c) => Math.round(c.correlationScore * 100) >= 85
    );
  }, [correlationReport]);

  const highConfidenceDuplicates = useMemo(() => {
    return duplicates.filter(
      (d) => Math.round(d.similarityScore * 100) >= 85
    );
  }, [duplicates]);

  // Candidates for group resolution: open tickets with >=85% match
  const activeCorrelatedCandidates = useMemo(() => {
    const candidates: { incidentId: number; title: string; score: number; type: string }[] = [];
    const seen = new Set<number>();

    highConfidenceCorrelations.forEach((c) => {
      const matchPercent = Math.round(c.correlationScore * 100);
      const isClosed = c.status === 'RESOLVED' || c.status === 'VERIFIED' || c.status === 'CLOSED';
      if (!isClosed && !seen.has(c.incidentId) && c.incidentId !== incidentId) {
        seen.add(c.incidentId);
        candidates.push({
          incidentId: c.incidentId,
          title: c.title,
          score: matchPercent,
          type: c.correlationType ? c.correlationType.replace(/_/g, ' ') : 'CORRELATED',
        });
      }
    });

    highConfidenceDuplicates.forEach((d) => {
      const matchPercent = Math.round(d.similarityScore * 100);
      if (!seen.has(d.incidentId) && d.incidentId !== incidentId) {
        seen.add(d.incidentId);
        candidates.push({
          incidentId: d.incidentId,
          title: d.title,
          score: matchPercent,
          type: 'DUPLICATE',
        });
      }
    });

    return candidates;
  }, [highConfidenceCorrelations, highConfidenceDuplicates, incidentId]);

  const handleOpenResolveModal = (withAllCorrelated: boolean = true) => {
    if (!resolveSummary.trim()) {
      setResolveSummary(`Resolved root issue affecting ${incident?.service?.name || 'affected service'}`);
    }
    if (!resolveRootCause.trim()) {
      setResolveRootCause(
        correlationReport?.probableRootCause
          ? `Identified root cause: ${correlationReport.probableRootCause}`
          : 'Service failure mitigated; dependencies recovered to operational parameters.'
      );
    }
    if (!resolveSteps.trim()) {
      setResolveSteps('1. Isolated faulty dependency 2. Applied corrective remediation 3. Validated telemetry recovery.');
    }
    if (withAllCorrelated && activeCorrelatedCandidates.length > 0) {
      setSelectedCorrelatedIds(activeCorrelatedCandidates.map((c) => c.incidentId));
    } else if (!withAllCorrelated) {
      setSelectedCorrelatedIds([]);
    }
    setShowResolveModal(true);
  };

  // Mutation: Acknowledge Incident
  const acknowledgeMutation = useMutation({
    mutationFn: () => incidentsApi.acknowledgeIncident(incidentId),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Incident Acknowledged',
        message: 'You have acknowledged receipt of this ticket. SLA response window met.',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to acknowledge incident';
      showToast({ type: 'error', title: 'Action Rejected', message: msg });
    },
  });

  // Mutation: Start Investigation
  const startMutation = useMutation({
    mutationFn: () => incidentsApi.startInvestigation(incidentId),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Investigation Started',
        message: 'Status transitioned to IN_PROGRESS. Diagnostics mode active.',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to start investigation';
      showToast({ type: 'error', title: 'Action Rejected', message: msg });
    },
  });

  // Mutation: Add Diagnostic Note
  const noteMutation = useMutation({
    mutationFn: (vars: { content: string; attachment?: FileAttachment | null }) =>
      incidentsApi.addNote(
        incidentId,
        vars.content,
        vars.attachment
          ? {
              name: vars.attachment.name,
              type: vars.attachment.type,
              data: vars.attachment.data,
            }
          : undefined
      ),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Diagnostic Note Recorded',
        message: 'Entry and diagnostic files logged to incident audit timeline.',
      });
      setDiagnosticNote('');
      setDiagnosticAttachment(null);
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to post note';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Request More Info
  const requestInfoMutation = useMutation({
    mutationFn: (question: string) =>
      incidentsApi.addNote(incidentId, `[ACTION REQUIRED - Awaiting Reporter Response]: ${question}`),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Information Requested',
        message: 'Question logged. The reporter has been notified in their feed.',
      });
      setShowRequestInfoModal(false);
      setRequestInfoContent('');
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to request information';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Resolve Incident
  const resolveMutation = useMutation({
    mutationFn: () =>
      incidentsApi.resolveIncident(incidentId, {
        summary: resolveSummary.trim(),
        rootCause: resolveRootCause.trim() || 'Root cause identified and addressed during technical investigation.',
        steps: resolveSteps.trim() || 'Applied remediation procedures and validated service recovery.',
        correlatedIncidentIds: selectedCorrelatedIds.length > 0 ? selectedCorrelatedIds : undefined,
      }),
    onSuccess: () => {
      const resolvedCount = 1 + selectedCorrelatedIds.length;
      showToast({
        type: 'success',
        title: resolvedCount > 1 ? `Group of ${resolvedCount} Incidents Resolved` : 'Incident Resolved',
        message: resolvedCount > 1
          ? `INC-${incidentId} and ${selectedCorrelatedIds.length} correlated tickets (>=85% match) successfully resolved simultaneously.`
          : 'Ticket successfully transitioned to RESOLVED. Reporter asked for satisfaction verification.',
      });
      setShowResolveModal(false);
      setResolveSummary('');
      setResolveRootCause('');
      setResolveSteps('');
      setSelectedCorrelatedIds([]);
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incident-correlations', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incident-duplicates', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to resolve incident';
      showToast({ type: 'error', title: 'Resolution Error', message: msg });
    },
  });

  // Mutation: Escalate Incident
  const escalateMutation = useMutation({
    mutationFn: () =>
      incidentsApi.escalateIncident(incidentId, targetEscalationLevel, escalationReason),
    onSuccess: (updated) => {
      showToast({
        type: 'warning',
        title: 'Incident Escalated',
        message: `Incident escalated to ${updated.escalationLevel || targetEscalationLevel}. Notifications dispatched.`,
      });
      setShowEscalateModal(false);
      setEscalationReason('');
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to escalate incident';
      showToast({ type: 'error', title: 'Escalation Failed', message: msg });
    },
  });

  const getStepperActiveStep = (status?: IncidentStatus): number => {
    switch (status) {
      case 'NEW':
      case 'REPORTED':
        return 0;
      case 'CLASSIFIED':
        return 1;
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 3;
      case 'IN_PROGRESS':
      case 'WAITING_FOR_USER':
        return 4;
      case 'RESOLVED':
        return 5;
      case 'VERIFIED':
        return 6;
      case 'CLOSED':
        return 7;
      case 'REOPENED':
        return 4;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-24 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-status-danger mx-auto" />
        <h2 className="text-xl font-bold text-content-dark">Ticket Not Accessible</h2>
        <p className="text-sm text-content-muted">
          Could not load details for ticket INC-{id}. You may not be assigned to this ticket.
        </p>
        <Link to="/technician/incidents">
          <Button variant="primary" size="md">
            Return to Queue
          </Button>
        </Link>
      </div>
    );
  }

  const isAssigned = incident.status === 'ASSIGNED';
  const isAcknowledged = incident.status === 'ACKNOWLEDGED';
  const isInProgress = incident.status === 'IN_PROGRESS' || incident.status === 'WAITING_FOR_USER';
  const isResolvedOrClosed = incident.status === 'RESOLVED' || incident.status === 'VERIFIED' || incident.status === 'CLOSED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* Top Header & Contextual Lifecycle Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/technician/incidents">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
              <Link to="/technician" className="hover:underline text-brand-pink">
                Technician Console
              </Link>
              <span className="text-white/40">/</span>
              <Link to="/technician/incidents" className="hover:underline text-white/70">
                Assigned Incidents
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white/90">INC-{incident.id}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-white px-2.5 py-0.5 rounded bg-white/10 border border-white/15">
                INC-{incident.id}
              </span>
              <PriorityBadge priority={incident.priority} size="sm" />
              <StatusBadge status={incident.status} size="sm" />
              {incident.slaTracking && <SlaBadge status={incident.slaTracking.slaStatus} size="sm" />}
              <EscalationBadge level={incident.escalationLevel} size="sm" />
            </div>
          </div>
        </div>

        {/* State Machine Transition Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action: Escalate Ticket */}
          {!isResolvedOrClosed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEscalateModal(true)}
              leftIcon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
            >
              Escalate Ticket
            </Button>
          )}

          {/* Action 1: Acknowledge */}
          {isAssigned && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => acknowledgeMutation.mutate()}
              isLoading={acknowledgeMutation.isPending}
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Acknowledge
            </Button>
          )}

          {/* Action 2: Start Investigation */}
          {(isAssigned || isAcknowledged) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => startMutation.mutate()}
              isLoading={startMutation.isPending}
              leftIcon={<Play className="w-4 h-4" />}
              className="font-bold shadow-pink"
            >
              Start Investigation
            </Button>
          )}

          {/* Action 3: Request More Info */}
          {isInProgress && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRequestInfoModal(true)}
              leftIcon={<HelpCircle className="w-4 h-4 text-amber-600" />}
            >
              Request More Info
            </Button>
          )}

          {/* Action: Resolve Group (if high-confidence correlated tickets are active) */}
          {activeCorrelatedCandidates.length > 0 && !isResolvedOrClosed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenResolveModal(true)}
              leftIcon={<CheckCheck className="w-4 h-4 text-emerald-600" />}
              className="font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              Resolve Group ({activeCorrelatedCandidates.length + 1})
            </Button>
          )}

          {/* Action 4: Resolve with Details */}
          {!isResolvedOrClosed && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenResolveModal(false)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold shadow-pink"
            >
              Resolve Incident
            </Button>
          )}
        </div>
      </div>

      {/* Escalation Alert Banner */}
      {incident.escalationLevel && incident.escalationLevel !== 'NONE' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <div className="font-bold flex items-center gap-2">
              <span>Ticket Escalated to {incident.escalationLevel.replace(/_/g, ' ')}</span>
              {incident.escalatedAt && (
                <span className="text-[11px] font-normal text-amber-700">
                  • {formatRelativeTime(incident.escalatedAt)}
                </span>
              )}
            </div>
            {incident.escalationReason && (
              <p className="mt-1 text-amber-800">
                Reason: {incident.escalationReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Incident Overview Card */}
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-dark tracking-tight leading-snug">
            {incident.title}
          </h1>
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-content-dark whitespace-pre-line leading-relaxed">
            {incident.description}
          </div>
          {incident.attachmentData && (
            <AttachmentViewer
              attachmentName={incident.attachmentName}
              attachmentType={incident.attachmentType}
              attachmentData={incident.attachmentData}
              label="Reporter Evidence / Attached Screenshot"
            />
          )}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-border text-xs">
          <div>
            <p className="text-content-muted font-medium">Reporter</p>
            <p className="font-bold text-content-dark mt-0.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-brand-deep" />
              {incident.reporter.fullName}
            </p>
            <span className="text-[10px] text-content-muted">{incident.reporter.email}</span>
          </div>

          <div>
            <p className="text-content-muted font-medium">Service & Criticality</p>
            <p className="font-bold text-content-dark mt-0.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-azure" />
              {incident.service.name}
            </p>
            <span className="text-[10px] text-brand-deep font-semibold">
              {incident.service.businessCriticality}
            </span>
          </div>

          <div>
            <p className="text-content-muted font-medium">Impact & Urgency</p>
            <p className="font-bold text-content-dark mt-0.5">
              {incident.impact} / {incident.urgency}
            </p>
            <span className="text-[10px] text-content-muted">{incident.affectedUserCount} users</span>
          </div>

          <div>
            <p className="text-content-muted font-medium">Reported Time</p>
            <p className="font-bold text-content-dark mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatRelativeTime(incident.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Lifecycle Stepper */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink-deep" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
              Incident Resolution Progress
            </h2>
          </div>
          <span className="text-xs text-content-muted font-medium">
            Active State: <strong className="text-brand-deep">{incident.status}</strong>
          </span>
        </div>

        <div className="py-2 overflow-x-auto">
          <Stepper currentStepIndex={getStepperActiveStep(incident.status)} />
        </div>
      </Card>

      {/* Real-time SLA Deadline & Escalation Panel */}
      {incident.slaTracking && (
        <Card className="p-6 space-y-4 border-l-4 border-l-brand-azure">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-azure" />
              <h2 className="text-base font-bold text-content-dark">
                SLA Countdown & Escalation
              </h2>
            </div>
            <SlaBadge status={incident.slaTracking.slaStatus} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-content-muted">Response SLA Window:</span>
              <p className="font-bold text-sm text-content-dark mt-1">
                {incident.slaTracking.responseTargetMinutes} mins (Target)
              </p>
              <p className="text-[11px] text-content-muted mt-0.5">
                {incident.slaTracking.respondedAt ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Responded {formatRelativeTime(incident.slaTracking.respondedAt)}
                  </span>
                ) : (
                  <span>Deadline: {formatSlaCountdown(incident.slaTracking.responseDeadline).text}</span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-content-muted">Resolution SLA Window:</span>
              <p className="font-bold text-sm text-content-dark mt-1">
                {incident.slaTracking.resolutionTargetMinutes} mins (Target)
              </p>
              <p className="text-[11px] font-mono font-bold text-brand-deep mt-0.5">
                Countdown: {formatSlaCountdown(incident.slaTracking.resolutionDeadline).text}
              </p>
            </div>
          </div>

          {incident.slaTracking.resolutionBreached && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>SLA Target Breach Detected: Automatically escalated to Tier-3 Lead Technicians.</span>
            </div>
          )}
        </Card>
      )}

      {/* Correlated Duplicates & Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intelligent Incident Correlation & Root Cause Analysis */}
        <Card className="p-6 space-y-4 border-l-4 border-l-indigo-600 bg-white border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Incident Correlation & Blast Radius
                </h2>
                <p className="text-[11px] text-slate-600">
                  Multi-vector service & infrastructure dependency analysis (cutoff: &ge;85%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(highConfidenceCorrelations.length > 0 || highConfidenceDuplicates.length > 0) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold">
                  {highConfidenceCorrelations.length > 0 ? highConfidenceCorrelations.length : highConfidenceDuplicates.length} correlated (&ge;85%)
                </span>
              )}
              {activeCorrelatedCandidates.length > 0 && !isResolvedOrClosed && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenResolveModal(true)}
                  leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                  className="font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] py-1 px-2.5"
                >
                  Resolve Group ({activeCorrelatedCandidates.length + 1})
                </Button>
              )}
            </div>
          </div>

          {highConfidenceCorrelations.length > 0 ? (
            <div className="space-y-3">
              {correlationReport && (
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs space-y-1.5 shadow-2xs">
                  {correlationReport.probableRootCause && (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950">Probable Root Cause:</span>
                      <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">{correlationReport.probableRootCause}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-indigo-950">
                    <span className="font-medium text-slate-700">Systemic Blast Radius:</span>
                    <strong className="text-indigo-950">{correlationReport.blastRadiusUserCount} Users across {correlationReport.impactedServicesCount} Services</strong>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                {highConfidenceCorrelations.map((corr) => (
                  <div key={corr.incidentId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/technician/incidents/${corr.incidentId}`}
                          className="font-mono font-bold text-indigo-700 hover:underline"
                        >
                          INC-{corr.incidentId}
                        </Link>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                          corr.correlationType === 'INFRASTRUCTURE_DEPENDENCY'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : corr.correlationType === 'SHARED_SERVICE'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : corr.correlationType === 'SYMPTOM_PATTERN'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {corr.correlationType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                        {Math.round(corr.correlationScore * 100)}% match
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 line-clamp-1">{corr.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Service: <strong className="text-slate-800">{corr.serviceName}</strong></span>
                      <span>Component: <strong className="text-slate-800">{corr.sharedComponent || 'N/A'}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                      {corr.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : highConfidenceDuplicates.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {highConfidenceDuplicates.map((dup) => (
                <div key={dup.incidentId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700">INC-{dup.incidentId}</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      {Math.round(dup.similarityScore * 100)}% match
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">{dup.title}</p>
                  <p className="text-[11px] text-slate-600">{dup.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4 text-xs">
              No correlated tickets or upstream outages with &ge;85% match detected.
            </p>
          )}

          {activeCorrelatedCandidates.length > 0 && !isResolvedOrClosed && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs mt-3">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-950 font-medium">
                  <strong>{activeCorrelatedCandidates.length} open tickets</strong> share identical root cause telemetry (&ge;85% match).
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenResolveModal(true)}
                className="font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-100 shrink-0 text-xs py-1 px-3"
              >
                Resolve Group ({activeCorrelatedCandidates.length + 1})
              </Button>
            </div>
          )}
        </Card>

        {/* Smart Technician Recommendations */}
        <Card className="p-6 space-y-4 border-l-4 border-l-brand-pink">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-pink-deep" />
              <h2 className="text-base font-bold text-content-dark">
                Smart Technician Matching
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-pink-soft text-brand-deep font-bold">
              {recommendations.length} recommended
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {recommendations.length === 0 ? (
              <p className="text-content-muted text-center py-4">
                No alternative technician scores available.
              </p>
            ) : (
              recommendations.slice(0, 3).map((rec) => (
                <div key={rec.technicianId} className="p-3 rounded-xl bg-slate-50 border border-surface-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-content-dark">{rec.technicianName || rec.fullName} ({rec.experienceLevel})</span>
                    <span className="font-mono font-bold text-brand-deep">
                      Score: {rec.totalScore ?? rec.matchScore ?? 0}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-content-muted">
                    Workload: {rec.activeWorkload ?? rec.currentWorkload ?? 0}/{rec.maxWorkload} active | Capacity headroom: {rec.workloadScore ?? rec.capacityScore ?? 0}/25
                  </p>
                  <p className="text-[11px] text-slate-500 italic">{rec.reason || rec.explanation}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Resolution Summary (If already resolved) */}
      {incident.resolution && (
        <Card className="p-6 space-y-3 border-l-4 border-l-emerald-500 bg-emerald-50/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-content-dark">
              Resolution Record
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <span className="font-bold text-content-dark">Summary:</span>
              <p className="mt-0.5 text-content-dark">{incident.resolution.summary}</p>
            </div>
            {incident.resolution.rootCause && (
              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="font-bold text-content-dark">Root Cause:</span>
                <p className="mt-0.5 text-content-dark">{incident.resolution.rootCause}</p>
              </div>
            )}
            {incident.resolution.steps && (
              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="font-bold text-content-dark">Remediation Steps:</span>
                <p className="mt-0.5 text-content-dark">{incident.resolution.steps}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Diagnostic Notes & Investigation Log */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-deep" />
            <h2 className="text-base font-bold text-content-dark">
              Diagnostic Notes & Action Trail
            </h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
            {incident.notes?.length || 0} entries
          </span>
        </div>

        <div className="space-y-3">
          {(!incident.notes || incident.notes.length === 0) ? (
            <p className="text-xs text-content-muted text-center py-4">
              No diagnostic notes recorded yet. Post findings or command output below.
            </p>
          ) : (
            incident.notes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-content-dark">{note.authorName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                      Author #{note.authorId}
                    </span>
                  </div>
                  <span className="text-content-muted">{formatRelativeTime(note.createdAt)}</span>
                </div>
                <p className="text-content-dark whitespace-pre-line leading-relaxed sm:text-sm">
                  {note.content}
                </p>
                {note.attachmentData && (
                  <AttachmentViewer
                    attachmentName={note.attachmentName}
                    attachmentType={note.attachmentType}
                    attachmentData={note.attachmentData}
                    compact
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Diagnostic Note Input */}
        {!isResolvedOrClosed && (
          <div className="pt-4 border-t border-surface-border space-y-3">
            <label className="block text-xs font-semibold text-content-dark uppercase tracking-wider">
              Log Diagnostic Observation or Command Output
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={diagnosticNote}
                  onChange={(e) => setDiagnosticNote(e.target.value)}
                  placeholder="Log stack trace findings, service restart attempts, or diagnostic metrics..."
                  className="flex-1 text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
                />
                <Button
                  variant="primary"
                  size="md"
                  disabled={(!diagnosticNote.trim() && !diagnosticAttachment) || noteMutation.isPending}
                  isLoading={noteMutation.isPending}
                  onClick={() =>
                    noteMutation.mutate({
                      content: diagnosticNote.trim() || 'Attached diagnostic screenshot / log output',
                      attachment: diagnosticAttachment,
                    })
                  }
                  rightIcon={<Send className="w-4 h-4" />}
                  className="self-end font-bold shadow-pink shrink-0"
                >
                  Log Note
                </Button>
              </div>
              <AttachmentInput
                attachment={diagnosticAttachment}
                onChange={setDiagnosticAttachment}
                variant="button"
                disabled={noteMutation.isPending}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Resolve Incident */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Submit Resolution Findings"
      >
        <div className="space-y-4 text-xs">
          <p className="text-content-muted">
            Document findings and root cause before marking ticket as resolved:
          </p>

          <Input
            label="Resolution Summary"
            placeholder="e.g. Restarted connection pool service and expanded maximum worker threads"
            value={resolveSummary}
            onChange={(e) => setResolveSummary(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
              Identified Root Cause <span className="text-brand-pink">*</span>
            </label>
            <textarea
              rows={2}
              value={resolveRootCause}
              onChange={(e) => setResolveRootCause(e.target.value)}
              placeholder="e.g. Memory leak in legacy JDBC driver causing heap exhaustion..."
              className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
              Remediation Steps Taken <span className="text-brand-pink">*</span>
            </label>
            <textarea
              rows={2}
              value={resolveSteps}
              onChange={(e) => setResolveSteps(e.target.value)}
              placeholder="1. Drained active nodes 2. Upgraded driver patch 3. Re-enabled traffic"
              className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
            />
          </div>

          {/* Group Resolution Checklist (Cutoff >=85%) */}
          {activeCorrelatedCandidates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  Resolve Correlated Incidents Together (&ge;85% Match)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedCorrelatedIds.length} of {activeCorrelatedCandidates.length} selected
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                The following open tickets share identical root cause telemetry (&ge;85% similarity). Select tickets to resolve jointly with this ticket:
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {activeCorrelatedCandidates.map((c) => {
                  const isChecked = selectedCorrelatedIds.includes(c.incidentId);
                  return (
                    <label
                      key={c.incidentId}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-200 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCorrelatedIds((prev) => [...prev, c.incidentId]);
                            } else {
                              setSelectedCorrelatedIds((prev) => prev.filter((cid) => cid !== c.incidentId));
                            }
                          }}
                          className="rounded border-slate-300 text-brand-pink focus:ring-brand-pink"
                        />
                        <span className="font-mono font-bold text-indigo-700 shrink-0">INC-{c.incidentId}</span>
                        <span className="truncate">{c.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-indigo-800 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                          {c.score}% match
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowResolveModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!resolveSummary.trim() || !resolveRootCause.trim() || !resolveSteps.trim() || resolveMutation.isPending}
              isLoading={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate()}
              className="font-bold shadow-pink"
            >
              Confirm Resolution {selectedCorrelatedIds.length > 0 ? `(${1 + selectedCorrelatedIds.length} Tickets)` : ''}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Request More Info */}
      <Modal
        isOpen={showRequestInfoModal}
        onClose={() => setShowRequestInfoModal(false)}
        title="Request Information from Reporter"
      >
        <div className="space-y-4 text-xs">
          <p className="text-content-muted">
            Specify the diagnostics, screenshots, or clarification needed from the reporting employee:
          </p>
          <textarea
            rows={3}
            value={requestInfoContent}
            onChange={(e) => setRequestInfoContent(e.target.value)}
            placeholder="e.g. Could you confirm your workstation IP address and the exact timestamp when the timeout occurred?"
            className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowRequestInfoModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!requestInfoContent.trim() || requestInfoMutation.isPending}
              isLoading={requestInfoMutation.isPending}
              onClick={() => requestInfoMutation.mutate(requestInfoContent)}
              className="font-bold shadow-pink"
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Escalate Ticket */}
      <Modal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        title="Escalate Incident to Higher ITIL Tier"
      >
        <div className="space-y-4 text-xs">
          <p className="text-content-muted">
            Escalate this incident to specialist teams or management for emergency handling, additional privileges, or cross-department coordination:
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
              Target Escalation Tier
            </label>
            <select
              value={targetEscalationLevel}
              onChange={(e) => setTargetEscalationLevel(e.target.value as EscalationLevel)}
              className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure bg-white text-content-dark"
            >
              <option value="TEAM_LEAD">Tier 2: Team Lead (Specialist Guidance & Reassignment)</option>
              <option value="SYSTEM_ADMINISTRATOR">Tier 3: System Administrator (Elevated Infrastructure Access & P1 Auto-Promotion)</option>
              <option value="IT_MANAGER">Tier 4: IT Manager (Executive Major Outage / Disaster Recovery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
              Escalation Reason / Justification <span className="text-brand-pink">*</span>
            </label>
            <textarea
              rows={3}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="e.g. Critical database storage volume reached 99% capacity; requires root infrastructure expansion or outage paging."
              className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEscalateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!escalationReason.trim() || escalateMutation.isPending}
              isLoading={escalateMutation.isPending}
              onClick={() => escalateMutation.mutate()}
              className="font-bold shadow-pink"
            >
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
