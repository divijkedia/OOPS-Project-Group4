import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../../api/incidents.api';
import { adminApi } from '../../api/admin.api';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PriorityBadge, StatusBadge, SlaBadge, EscalationBadge } from '../../components/ui/Badge';
import { Stepper } from '../../components/ui/Stepper';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatRelativeTime, formatSlaCountdown } from '../../lib/formatters';
import type { IncidentStatus, FileAttachment } from '../../types/incident';
import { AttachmentViewer } from '../../components/common/AttachmentViewer';
import { AttachmentInput } from '../../components/common/AttachmentInput';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Star,
  UserCheck,
  UserX,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Layers,
  Sparkles,
  Cpu,
  Wrench,
  Network,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const incidentId = Number(id);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [noteContent, setNoteContent] = useState('');
  const [noteAttachment, setNoteAttachment] = useState<FileAttachment | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<number | string>('');

  // Fetch Incident Details
  const {
    data: incident,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentsApi.getIncidentById(incidentId),
    enabled: !isNaN(incidentId),
    refetchInterval: 15000, // Poll every 15s to keep SLA and status fresh
  });

  // Fetch Duplicate & Correlated Incidents
  const { data: duplicates = [] } = useQuery({
    queryKey: ['incident-duplicates', incidentId],
    queryFn: () => incidentsApi.getDuplicates(incidentId),
    enabled: !isNaN(incidentId),
  });

  // Fetch Multi-Vector Incident Correlation & Root Cause Report
  const { data: correlationReport } = useQuery({
    queryKey: ['incident-correlations', incidentId],
    queryFn: () => incidentsApi.getIncidentCorrelations(incidentId),
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

  // Fetch Technicians for Admin Reassignment
  const { data: technicians = [] } = useQuery({
    queryKey: ['admin-technicians'],
    queryFn: () => adminApi.listTechnicians(),
    enabled: user?.role === 'ADMIN',
  });

  // Fetch Smart Recommendations for Reassignment Modal
  const { data: recommendations = [] } = useQuery({
    queryKey: ['incident-recommendations', incidentId],
    queryFn: () => incidentsApi.getRecommendations(incidentId),
    enabled: user?.role === 'ADMIN' && showReassignModal,
  });

  // Mutation: Admin Reassign Technician
  const reassignMutation = useMutation({
    mutationFn: (techId: number) => adminApi.assignTechnician(incidentId, techId),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Technician Assigned',
        message: 'Incident has been successfully assigned to the selected engineer.',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
      setShowReassignModal(false);
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
        ? (err as any).response.data.message
        : err instanceof Error ? err.message : 'Could not assign technician.';
      showToast({
        type: 'error',
        title: 'Assignment Failed',
        message: msg,
      });
    },
  });

  // Mutation: Admin Unassign Technician
  const unassignMutation = useMutation({
    mutationFn: () => adminApi.unassignTechnician(incidentId),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Technician Unassigned',
        message: 'Incident has been completely unassigned and returned to the queue.',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
      setShowReassignModal(false);
    },
    onError: (err: unknown) => {
      const msg = err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
        ? (err as any).response.data.message
        : err instanceof Error ? err.message : 'Could not unassign technician.';
      showToast({
        type: 'error',
        title: 'Unassignment Failed',
        message: msg,
      });
    },
  });

  // Mutation: Add Investigation / Information Note
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
        title: 'Information Added',
        message: 'Your update and attachments have been recorded in the incident diagnostic trail.',
      });
      setNoteContent('');
      setNoteAttachment(null);
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to add note';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Submit Feedback
  const feedbackMutation = useMutation({
    mutationFn: (vars: { rating: number; comment?: string }) =>
      incidentsApi.submitFeedback(incidentId, { rating: vars.rating, comment: vars.comment }),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Thank you for rating your incident resolution experience!',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback';
      showToast({ type: 'error', title: 'Feedback Error', message: msg });
    },
  });

  // Mutation: Reopen Incident
  const reopenMutation = useMutation({
    mutationFn: (reason: string) => incidentsApi.reopenIncident(incidentId, reason),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Incident Reopened',
        message: 'The incident has been re-injected into the active technician queue.',
      });
      setShowReopenModal(false);
      setReopenReason('');
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to reopen incident';
      showToast({ type: 'error', title: 'Action Failed', message: msg });
    },
  });

  // Mutation: Verify Resolution
  const verifyMutation = useMutation({
    mutationFn: () => incidentsApi.verifyIncident(incidentId),
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Resolution Confirmed',
        message: 'You have confirmed that the disruption is fully resolved.',
      });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Map Backend Incident Status to Stepper Phase Index (0 to 7)
  const getStepperActiveStep = (status?: IncidentStatus): number => {
    switch (status) {
      case 'NEW':
      case 'REPORTED':
        return 0; // Report
      case 'CLASSIFIED':
        return 1; // Classify
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 3; // Assign
      case 'IN_PROGRESS':
      case 'WAITING_FOR_USER':
        return 4; // Investigate
      case 'RESOLVED':
        return 5; // Resolve
      case 'VERIFIED':
        return 6; // Verify
      case 'CLOSED':
        return 7; // Close
      case 'REOPENED':
        return 4; // Back to investigate
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
        <h2 className="text-xl font-bold text-content-dark">Incident Not Found</h2>
        <p className="text-sm text-content-muted">
          Could not load details for ticket INC-{id}. You may not have permission to view it or it does not exist.
        </p>
        <Link to={user?.role === 'ADMIN' ? '/admin/incidents' : '/employee/incidents'}>
          <Button variant="primary" size="md">
            Return to {user?.role === 'ADMIN' ? 'All Incidents' : 'My Incidents'}
          </Button>
        </Link>
      </div>
    );
  }

  const isResolvedOrClosed = incident.status === 'RESOLVED' || incident.status === 'VERIFIED' || incident.status === 'CLOSED';
  const isAwaitingInfo = incident.status === 'WAITING_FOR_USER';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to={user?.role === 'ADMIN' ? '/admin/incidents' : '/employee/incidents'}>
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
              <Link to={user?.role === 'ADMIN' ? '/admin' : '/employee'} className="hover:underline text-brand-pink">
                {user?.role === 'ADMIN' ? 'Operations Center' : 'Employee Portal'}
              </Link>
              <span className="text-white/40">/</span>
              <Link
                to={user?.role === 'ADMIN' ? '/admin/incidents' : '/employee/incidents'}
                className="hover:underline text-white/70"
              >
                {user?.role === 'ADMIN' ? 'All Incidents' : 'My Incidents'}
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

        <div className="flex items-center gap-2">
          {incident.status === 'RESOLVED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => verifyMutation.mutate()}
              isLoading={verifyMutation.isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="font-bold shadow-pink"
            >
              Verify Resolution
            </Button>
          )}

          {isResolvedOrClosed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReopenModal(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
            >
              Reopen Ticket
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
              <span>Incident Priority & Tier Elevated: {incident.escalationLevel.replace(/_/g, ' ')}</span>
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

      {/* Primary Incident Header Card */}
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-dark tracking-tight leading-snug">
            {incident.title}
          </h1>
          <p className="text-sm text-content-dark whitespace-pre-line mt-3 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            {incident.description}
          </p>
          {incident.attachmentData && (
            <AttachmentViewer
              attachmentName={incident.attachmentName}
              attachmentType={incident.attachmentType}
              attachmentData={incident.attachmentData}
              label="Attached Screenshot / Initial Evidence"
            />
          )}
        </div>

        {/* Metadata Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-border text-xs">
          <div>
            <p className="text-content-muted font-medium">Affected Service</p>
            <p className="font-bold text-content-dark mt-0.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-deep" />
              {incident.service?.name}
            </p>
            <span className="text-[10px] text-content-muted">
              Criticality: {incident.service?.businessCriticality}
            </span>
          </div>

          <div>
            <p className="text-content-muted font-medium">Incident Category</p>
            <p className="font-bold text-content-dark mt-0.5">
              {incident.category?.name || 'Unclassified'}
            </p>
          </div>

          <div>
            <p className="text-content-muted font-medium">Impact & Urgency</p>
            <p className="font-bold text-content-dark mt-0.5">
              {incident.impact} / {incident.urgency}
            </p>
            <span className="text-[10px] text-content-muted">
              {incident.affectedUserCount} users affected
            </span>
          </div>

          <div>
            <p className="text-content-muted font-medium">Reported Date</p>
            <p className="font-bold text-content-dark mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatRelativeTime(incident.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Lifecycle Progress Stepper */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink-deep" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
              ITIL Incident Lifecycle Progress
            </h2>
          </div>
          <span className="text-xs text-content-muted font-medium">
            Current Stage: <strong className="text-brand-deep">{incident.status}</strong>
          </span>
        </div>

        <div className="py-2 overflow-x-auto">
          <Stepper currentStepIndex={getStepperActiveStep(incident.status)} />
        </div>
      </Card>

      {/* SLA Countdown & Assigned Technician Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time SLA Deadline Card */}
        <Card className="p-6 space-y-4 border-l-4 border-l-brand-azure">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-azure" />
              <h2 className="text-base font-bold text-content-dark">
                SLA Compliance Tracking
              </h2>
            </div>
            {incident.slaTracking && <SlaBadge status={incident.slaTracking.slaStatus} size="sm" />}
          </div>

          {incident.slaTracking ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Target Resolution Window:</span>
                  <span className="font-bold text-content-dark">
                    {incident.slaTracking.resolutionTargetMinutes} minutes
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                  <span className="text-content-muted">Resolution Deadline:</span>
                  <span className="font-mono font-bold text-brand-deep">
                    {formatSlaCountdown(incident.slaTracking.resolutionDeadline).text}
                  </span>
                </div>
              </div>

              {incident.slaTracking.resolutionBreached && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>SLA target window has breached. Incident escalated to Tier-3 team.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-content-muted">
              SLA policy details are being calculated for this service.
            </p>
          )}
        </Card>

        {/* Assigned Technician Card */}
        <Card className="p-6 space-y-4 border-l-4 border-l-brand-pink">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-pink-deep" />
              <h2 className="text-base font-bold text-content-dark">
                Assigned Support Engineer
              </h2>
            </div>
            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedTechId(incident.assignedTechnician?.id || '');
                    setShowReassignModal(true);
                  }}
                  leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                >
                  {incident.assignedTechnician ? 'Reassign' : 'Assign'}
                </Button>
                {incident.assignedTechnician && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => unassignMutation.mutate()}
                    isLoading={unassignMutation.isPending}
                    disabled={unassignMutation.isPending}
                    leftIcon={<UserX className="w-3.5 h-3.5 text-rose-500" />}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                    title="Unassign technician completely"
                  >
                    Unassign
                  </Button>
                )}
              </div>
            )}
          </div>

          {incident.assignedTechnician ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-brand-deep text-white font-bold flex items-center justify-center shrink-0">
                  {incident.assignedTechnician.fullName?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-content-dark">
                    {incident.assignedTechnician.fullName}
                  </h3>
                  <p className="text-content-muted text-xs">
                    Specialist | Experience Level: <strong className="text-brand-deep">{incident.assignedTechnician.experienceLevel}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-content-muted">
                Your ticket has been assigned according to on-duty load and domain specialization matching heuristics.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-content-muted">
              <Clock className="w-6 h-6 mx-auto mb-1 text-slate-400" />
              <p className="font-semibold text-content-dark">Automated Assignment in Progress</p>
              <p className="mt-0.5">Matching on-duty technician with domain capacity...</p>
            </div>
          )}
        </Card>
      </div>

      {/* Intelligent Incident Correlation & Root Cause Analysis Card */}
      {(highConfidenceCorrelations.length > 0 || highConfidenceDuplicates.length > 0) && (
        <Card className="p-6 space-y-4 border-l-4 border-l-indigo-600 bg-white border border-slate-200/80 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Intelligent Incident Correlation & Root Cause Analysis
                </h2>
                <p className="text-xs text-slate-600">
                  Systemic cross-service correlation, upstream dependency mapping & blast radius telemetry (cutoff: &ge;85%).
                </p>
              </div>
            </div>
            {correlationReport?.probableRootCause && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Root Cause: {correlationReport.probableRootCause}
              </span>
            )}
          </div>

          {/* Blast Radius Metrics Strip */}
          {correlationReport && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Blast Radius</span>
                <p className="text-lg font-bold text-indigo-950">{correlationReport.blastRadiusUserCount} Users</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Correlated Tickets</span>
                <p className="text-lg font-bold text-indigo-950">
                  {highConfidenceCorrelations.length > 0 ? highConfidenceCorrelations.length : highConfidenceDuplicates.length}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Impacted Services</span>
                <p className="text-lg font-bold text-indigo-950">{correlationReport.impactedServicesCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Highest Priority</span>
                <p className="text-lg font-bold text-amber-800">{correlationReport.highestPriorityInCluster}</p>
              </div>
            </div>
          )}

          {/* Correlated Incidents List (Only >=85% match) */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Correlated System Outages & Cascades (&ge;85% Match)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highConfidenceCorrelations.length > 0 ? (
                highConfidenceCorrelations.map((corr) => (
                  <div key={corr.incidentId} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">INC-{corr.incidentId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
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
                      <span className="font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
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
                ))
              ) : (
                highConfidenceDuplicates.map((dup) => (
                  <div key={dup.incidentId} className="p-3 rounded-xl bg-slate-50 border border-amber-200 space-y-1 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-700">INC-{dup.incidentId}</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {Math.round(dup.similarityScore * 100)}% similarity
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 line-clamp-1">{dup.title}</p>
                    <p className="text-[11px] text-slate-600">{dup.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Resolution Details Card (When Resolved) */}
      {incident.resolution && (
        <Card className="p-6 space-y-3 border-l-4 border-l-emerald-500 bg-emerald-50/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-content-dark">
              Incident Resolution Summary
            </h2>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-white border border-emerald-200">
              <p className="font-bold text-content-dark">Resolution Summary:</p>
              <p className="text-content-dark mt-1">{incident.resolution.summary}</p>
            </div>

            {incident.resolution.rootCause && (
              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <p className="font-bold text-content-dark">Identified Root Cause:</p>
                <p className="text-content-dark mt-1">{incident.resolution.rootCause}</p>
              </div>
            )}

            {incident.resolution.steps && (
              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <p className="font-bold text-content-dark">Corrective Actions & Steps Taken:</p>
                <p className="text-content-dark mt-1">{incident.resolution.steps}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* User Satisfaction Feedback Form (Once Resolved) */}
      {isResolvedOrClosed && (
        <Card className="p-6 space-y-4 border-l-4 border-l-brand-pink">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h2 className="text-base font-bold text-content-dark">
              Resolution Satisfaction & Feedback
            </h2>
          </div>

          {incident.feedback ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= incident.feedback!.rating
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="font-bold text-content-dark ml-2">
                  {incident.feedback.rating} out of 5 stars
                </span>
              </div>
              {incident.feedback.comment && (
                <p className="text-content-dark italic mt-1">
                  "{incident.feedback.comment}"
                </p>
              )}
              <p className="text-[11px] text-content-muted pt-1">
                Submitted {formatRelativeTime(incident.feedback.submittedAt)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-content-muted">
                Please rate your satisfaction with how quickly and effectively this issue was resolved:
              </p>

              {/* 5-Star Selector */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= feedbackRating
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-content-dark ml-2">
                  {feedbackRating === 5
                    ? 'Excellent'
                    : feedbackRating === 4
                    ? 'Good'
                    : feedbackRating === 3
                    ? 'Average'
                    : feedbackRating === 2
                    ? 'Below Expectations'
                    : 'Poor'}
                </span>
              </div>

              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Optional comments or suggestions for the IT support team..."
                className="w-full text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  feedbackMutation.mutate({
                    rating: feedbackRating,
                    comment: feedbackComment || undefined,
                  })
                }
                isLoading={feedbackMutation.isPending}
                className="font-bold shadow-pink"
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Investigation Notes & Communication Audit Trail */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-deep" />
            <h2 className="text-base font-bold text-content-dark">
              Diagnostic Notes & Activity History
            </h2>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
            {incident.notes?.length || 0} entries
          </span>
        </div>

        {/* Urgent Info Request Banner (if waiting for user) */}
        {isAwaitingInfo && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-bold">Information Requested by Support Engineer:</strong>
              <p className="mt-0.5">
                The technician has asked for additional diagnostics or clarification. Please reply below to resume investigation.
              </p>
            </div>
          </div>
        )}

        {/* Chronological Notes Feed */}
        <div className="space-y-3">
          {(!incident.notes || incident.notes.length === 0) ? (
            <div className="p-6 text-center text-xs text-content-muted">
              No diagnostic notes posted yet. Updates from the technician will appear here in real time.
            </div>
          ) : (
            incident.notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-content-dark">{note.authorName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                      Author #{note.authorId}
                    </span>
                  </div>
                  <span className="text-content-muted">{formatRelativeTime(note.createdAt)}</span>
                </div>
                <p className="text-xs sm:text-sm text-content-dark whitespace-pre-line leading-relaxed">
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

        {/* Add Note / Follow-up Input */}
        {!isResolvedOrClosed && (
          <div className="pt-4 border-t border-surface-border space-y-3">
            <label className="block text-xs font-semibold text-content-dark uppercase tracking-wider">
              Add Clarification or Follow-up Information
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Provide additional context, error screenshots description, or test results..."
                  className="flex-1 text-xs rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure"
                />
                <Button
                  variant="primary"
                  size="md"
                  disabled={(!noteContent.trim() && !noteAttachment) || noteMutation.isPending}
                  isLoading={noteMutation.isPending}
                  onClick={() =>
                    noteMutation.mutate({
                      content: noteContent.trim() || 'Attached screenshot / diagnostic file',
                      attachment: noteAttachment,
                    })
                  }
                  rightIcon={<Send className="w-4 h-4" />}
                  className="self-end font-bold shadow-pink shrink-0"
                >
                  Post Note
                </Button>
              </div>
              <AttachmentInput
                attachment={noteAttachment}
                onChange={setNoteAttachment}
                variant="button"
                disabled={noteMutation.isPending}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Reopen Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen Incident Ticket"
      >
        <div className="space-y-4 text-xs">
          <p className="text-content-muted">
            If the resolution did not resolve your issue or the problem has recurred, provide a reason to reopen:
          </p>
          <textarea
            rows={3}
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Explain why the resolution was incomplete or how the issue recurred..."
            className="w-full rounded-xl border border-surface-border p-3 focus:outline-none focus:ring-2 focus:ring-brand-azure text-xs"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowReopenModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!reopenReason.trim() || reopenMutation.isPending}
              isLoading={reopenMutation.isPending}
              onClick={() => reopenMutation.mutate(reopenReason)}
              className="font-bold"
            >
              Confirm Reopen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Modal (Admin) */}
      {showReassignModal && incident && (
        <Modal
          isOpen={true}
          onClose={() => setShowReassignModal(false)}
          title={incident.assignedTechnician ? `Reassign Technician for INC-${incidentId}` : `Assign Technician to INC-${incidentId}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-content-muted">
              Select an on-duty engineer or review AI multi-factor recommendation matching scores:
            </p>

            {/* Smart Recommendations List */}
            {recommendations.length > 0 && (
              <div className="p-3 rounded-xl bg-brand-pink-soft/30 border border-brand-pink-deep/30 space-y-2">
                <span className="font-bold text-brand-deep flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> AI Recommended Technicians:
                </span>
                <div className="space-y-1.5">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div
                      key={rec.technicianId}
                      onClick={() => setSelectedTechId(rec.technicianId)}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedTechId === rec.technicianId
                          ? 'bg-white border-brand-deep font-bold text-brand-deep shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:bg-white text-content-dark'
                      }`}
                    >
                      <div>
                        <span>{rec.technicianName || rec.fullName} ({rec.experienceLevel})</span>
                        <span className="text-[10px] text-content-muted block">
                          Active Workload: {rec.activeWorkload ?? rec.currentWorkload ?? 0}/{rec.maxWorkload}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-brand-deep">
                        Score {Math.round(rec.totalScore ?? rec.matchScore ?? 0)}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Select
              label="Select Support Engineer"
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value === '__unassign__' ? '__unassign__' : Number(e.target.value))}
              options={[
                { label: 'Choose an engineer...', value: '' },
                ...(incident.assignedTechnician ? [
                  { label: '⚠️ Unassign Completely (Return to Queue)', value: '__unassign__' }
                ] : []),
                ...technicians.map((t) => ({
                  label: `${t.fullName} (${t.specialization || 'General'}) | ${(t.activeIncidentCount ?? t.activeIncidentsCount ?? 0)}/${t.maxWorkload || 5} active`,
                  value: String(t.id),
                })),
              ]}
              required
            />

            <div className="flex justify-between items-center pt-2">
              {incident.assignedTechnician ? (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  isLoading={unassignMutation.isPending}
                  disabled={unassignMutation.isPending || reassignMutation.isPending}
                  onClick={() => unassignMutation.mutate()}
                  leftIcon={<UserX className="w-3.5 h-3.5 text-rose-500" />}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                >
                  Unassign Completely
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowReassignModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedTechId || reassignMutation.isPending || unassignMutation.isPending}
                  isLoading={reassignMutation.isPending || unassignMutation.isPending}
                  onClick={() => {
                    if (selectedTechId === '__unassign__') {
                      unassignMutation.mutate();
                    } else {
                      reassignMutation.mutate(Number(selectedTechId));
                    }
                  }}
                  className="font-bold shadow-pink"
                >
                  {selectedTechId === '__unassign__'
                    ? 'Confirm Unassignment'
                    : incident.assignedTechnician
                    ? 'Confirm Reassignment'
                    : 'Confirm Assignment'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
