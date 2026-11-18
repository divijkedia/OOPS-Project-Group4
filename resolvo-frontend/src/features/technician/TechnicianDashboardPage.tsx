import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { technicianApi } from '../../api/technician.api';
import { incidentsApi } from '../../api/incidents.api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge, StatusBadge, SlaBadge } from '../../components/ui/Badge';
import { GaugeCard } from '../../components/charts/GaugeCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../lib/formatters';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Play,
  RotateCw,
  ShieldCheck,
  UserCheck,
  Wrench,
  Sparkles,
} from 'lucide-react';

export const TechnicianDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load Technician Workload Metrics
  const { data: workload, isLoading: isWorkloadLoading } = useQuery({
    queryKey: ['technician-workload'],
    queryFn: () => technicianApi.getMyWorkload(),
    staleTime: 10000,
  });

  // Load Assigned Incidents
  const {
    data: assignedIncidents = [],
    isLoading: isIncidentsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['technician-assigned-incidents'],
    queryFn: () => technicianApi.getMyAssignedIncidents(),
    staleTime: 10000,
  });

  // Mutation: Toggle Availability (On-Duty / Off-Duty)
  const availabilityMutation = useMutation({
    mutationFn: (newStatus: boolean) => technicianApi.setAvailability(newStatus),
    onSuccess: (updated) => {
      showToast({
        type: 'success',
        title: 'Availability Status Updated',
        message: updated.available
          ? 'You are now ON-DUTY. Automated routing will assign incidents matching your specialization.'
          : 'You are now OFF-DUTY. Incident routing will bypass your queue.',
      });
      queryClient.invalidateQueries({ queryKey: ['technician-workload'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update availability';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Quick Acknowledge Incident
  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => incidentsApi.acknowledgeIncident(id),
    onSuccess: (_, id) => {
      showToast({
        type: 'success',
        title: 'Incident Acknowledged',
        message: `Ticket INC-${id} acknowledged. SLA response target confirmed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['technician-workload'] });
    },
  });

  // Mutation: Quick Start Investigation
  const startMutation = useMutation({
    mutationFn: (id: number) => incidentsApi.startInvestigation(id),
    onSuccess: (_, id) => {
      showToast({
        type: 'success',
        title: 'Investigation Commenced',
        message: `Ticket INC-${id} moved to IN_PROGRESS.`,
      });
      navigate(`/technician/incidents/${id}`);
    },
  });

  const activeIncidents = assignedIncidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'VERIFIED' && i.status !== 'CLOSED'
  );
  const inProgressCount = assignedIncidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const awaitingUserCount = assignedIncidents.filter((i) => i.status === 'WAITING_FOR_USER').length;
  const resolvedCount = assignedIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'VERIFIED' || i.status === 'CLOSED').length;

  // Identify incidents approaching breach or breached
  const slaAtRiskIncidents = assignedIncidents.filter(
    (i) =>
      (i.slaStatus === 'APPROACHING_BREACH' || i.slaStatus === 'BREACHED') &&
      i.status !== 'RESOLVED' &&
      i.status !== 'VERIFIED' &&
      i.status !== 'CLOSED'
  );

  const isAvailable = workload?.available ?? true;
  const activeCount = workload?.activeIncidentCount ?? activeIncidents.length;
  const maxCapacity = workload?.maxWorkload ?? 5;
  const capacityPercent = Math.min(100, Math.round((activeCount / maxCapacity) * 100));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & On-Duty Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Technician Operations Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-pink-soft text-brand-pink border border-brand-pink/30">
              {user?.specialization || 'General Systems'} Specialist
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Logged in as <span className="font-semibold text-white">{user?.fullName}</span>. Manage assigned incidents and monitor SLA targets.
          </p>
        </div>

        {/* On-Duty / Off-Duty Availability Control */}
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-surface-border shadow-xs">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">
              Routing Status
            </p>
            <p className="text-xs font-extrabold text-content-dark">
              {isAvailable ? (
                <span className="text-emerald-600 flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  On-Duty (Receiving Tickets)
                </span>
              ) : (
                <span className="text-slate-500 flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Off-Duty (Queue Paused)
                </span>
              )}
            </p>
          </div>

          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            size="sm"
            isLoading={availabilityMutation.isPending}
            onClick={() => availabilityMutation.mutate(!isAvailable)}
            className="text-xs font-bold"
          >
            {isAvailable ? 'Go Off-Duty' : 'Go On-Duty'}
          </Button>
        </div>
      </div>

      {/* Workload Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workload Capacity Gauge Card */}
        <div className="lg:col-span-1">
          {isWorkloadLoading ? (
            <Card className="h-[320px] p-6 flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </Card>
          ) : (
            <GaugeCard
              title="Active Queue Workload"
              value={`${activeCount}/${maxCapacity}`}
              subtitle={`${capacityPercent}% capacity utilized (${workload?.capacityRemaining ?? 0} slots open)`}
              percentageChange={`${capacityPercent}%`}
              className="h-full shadow-pink"
            />
          )}
        </div>

        {/* Right: Key Performance Metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 flex items-center justify-between border-l-4 border-l-brand-azure">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                Active Queue
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
                {isIncidentsLoading ? <Skeleton className="h-8 w-12" /> : activeIncidents.length}
              </div>
              <p className="text-xs text-content-muted mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-azure" />
                Tickets in your assigned queue
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-azure/10 flex items-center justify-center text-brand-deep">
              <Wrench className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-l-4 border-l-brand-pink">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                In Active Investigation
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
                {isIncidentsLoading ? <Skeleton className="h-8 w-12" /> : inProgressCount}
              </div>
              <p className="text-xs text-brand-pink-deep font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnostic tests running
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-pink-soft flex items-center justify-center text-brand-pink-deep">
              <Play className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                Awaiting Reporter Info
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
                {isIncidentsLoading ? <Skeleton className="h-8 w-12" /> : awaitingUserCount}
              </div>
              <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                Waiting on employee reply
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <RotateCw className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
                Resolved Tickets
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
                {isIncidentsLoading ? <Skeleton className="h-8 w-12" /> : resolvedCount}
              </div>
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mitigated successfully
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>
        </div>
      </div>

      {/* SLA-At-Risk Critical Notice Queue */}
      {slaAtRiskIncidents.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-950">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>SLA Attention Required: {slaAtRiskIncidents.length} Ticket(s) Approaching or Breached</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {slaAtRiskIncidents.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/technician/incidents/${ticket.id}`)}
                className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between gap-3 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700">INC-{ticket.id}</span>
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    <SlaBadge status={ticket.slaStatus} size="sm" />
                  </div>
                  <p className="text-xs font-bold text-content-dark truncate">{ticket.title}</p>
                </div>
                <Button variant="danger" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Incident Queue List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              My Assigned Incidents
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10 font-semibold">
              {assignedIncidents.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
            <Link to="/technician/incidents">
              <Button variant="glass" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Queue
              </Button>
            </Link>
          </div>
        </div>

        {isIncidentsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-8 text-center text-status-danger">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <p className="font-bold">Failed to load technician queue</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-3">
              Retry
            </Button>
          </Card>
        ) : assignedIncidents.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-8 h-8 text-emerald-600" />}
            title="Queue Clear - No Assigned Incidents"
            description="All incidents assigned to you have been resolved or closed. When a service incident matches your domain specialization, it will be automatically routed here."
          />
        ) : (
          <div className="space-y-3">
            {assignedIncidents.slice(0, 6).map((incident) => (
              <Card
                key={incident.id}
                className="p-4 hover:border-brand-azure/40 transition-all hover:shadow-card group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-deep px-2 py-0.5 rounded bg-brand-azure/10">
                        INC-{incident.id}
                      </span>
                      <PriorityBadge priority={incident.priority} size="sm" />
                      <StatusBadge status={incident.status} size="sm" />
                      <SlaBadge status={incident.slaStatus} size="sm" />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-content-dark truncate group-hover:text-brand-deep transition-colors">
                      {incident.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
                      <span>Service: <strong className="text-content-dark">{incident.serviceName}</strong></span>
                      <span>|</span>
                      <span>Reporter: <strong className="text-content-dark">{incident.reporterName}</strong></span>
                      <span>|</span>
                      <span>Assigned {formatRelativeTime(incident.createdAt)}</span>
                    </div>
                  </div>

                  {/* Contextual Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {incident.status === 'ASSIGNED' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={acknowledgeMutation.isPending}
                          onClick={() => acknowledgeMutation.mutate(incident.id)}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={startMutation.isPending}
                          onClick={() => startMutation.mutate(incident.id)}
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                          className="font-bold shadow-pink"
                        >
                          Start Investigation
                        </Button>
                      </>
                    )}

                    {incident.status === 'IN_PROGRESS' && (
                      <Link to={`/technician/incidents/${incident.id}`}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="font-bold shadow-pink">
                          Investigate
                        </Button>
                      </Link>
                    )}

                    {(incident.status === 'RESOLVED' || incident.status === 'CLOSED') && (
                      <Link to={`/technician/incidents/${incident.id}`}>
                        <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Review Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
