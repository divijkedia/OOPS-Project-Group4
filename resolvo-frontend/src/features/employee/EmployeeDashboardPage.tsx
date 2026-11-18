import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth';
import { incidentsApi } from '../../api/incidents.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PriorityBadge, StatusBadge, SlaBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../lib/formatters';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  Inbox,
  Sparkles,
} from 'lucide-react';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ['employee-incidents'],
    queryFn: () => incidentsApi.getMyReportedIncidents(),
    staleTime: 10000,
  });

  const allIncidents = incidents || [];
  const openCount = allIncidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'VERIFIED' && i.status !== 'CLOSED'
  ).length;
  const awaitingInfoCount = allIncidents.filter((i) => i.status === 'WAITING_FOR_USER').length;
  const resolvedCount = allIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'VERIFIED' || i.status === 'CLOSED').length;
  const criticalCount = allIncidents.filter(
    (i) => (i.priority === 'P1_CRITICAL' || (i.priority as string) === 'P1') && i.status !== 'CLOSED'
  ).length;

  const recentIncidents = allIncidents.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Employee Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-pink-soft text-brand-pink border border-brand-pink/30">
              {user?.department || 'Enterprise Ops'}
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Welcome back, <span className="font-semibold text-white">{user?.fullName}</span>. Track your active IT service requests and report disruptions.
          </p>
        </div>

        <Link to="/employee/report">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="shadow-pink font-bold"
          >
            Report Incident
          </Button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Incidents Card */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-brand-azure">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Active Incidents
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
              {isLoading ? <Skeleton className="h-8 w-12" /> : openCount}
            </div>
            <p className="text-xs text-content-muted mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-azure" />
              Under investigation
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-azure/10 flex items-center justify-center text-brand-deep">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        {/* Action Required / Awaiting Info */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Awaiting Your Response
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
              {isLoading ? <Skeleton className="h-8 w-12" /> : awaitingInfoCount}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Technician requested details
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Card>

        {/* Resolved Incidents */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              Resolved & Closed
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
              {isLoading ? <Skeleton className="h-8 w-12" /> : resolvedCount}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Successfully mitigated
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

        {/* Critical Disruptions */}
        <Card className="p-5 flex items-center justify-between border-l-4 border-l-rose-500">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-content-muted">
              P1 Critical Active
            </p>
            <div className="text-2xl sm:text-3xl font-extrabold text-content-dark mt-1">
              {isLoading ? <Skeleton className="h-8 w-12" /> : criticalCount}
            </div>
            <p className="text-xs text-rose-700 font-medium mt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Immediate SLA priority
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Quick Info Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-deep to-brand-royal text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-pink/20 flex items-center justify-center text-brand-pink shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Automated Incident Resolution & Smart SLA Tracking
            </h2>
            <p className="text-xs text-slate-200 mt-0.5">
              Every reported incident is automatically classified, prioritized with multi-factor impact heuristics, and matched to an on-duty technician.
            </p>
          </div>
        </div>

        <Link to="/employee/incidents" className="shrink-0">
          <Button variant="glass" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All My Incidents
          </Button>
        </Link>
      </div>

      {/* Recent Incidents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Recent Reported Incidents
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10 font-semibold">
              {allIncidents.length}
            </span>
          </div>

          <Link
            to="/employee/incidents"
            className="text-xs font-semibold text-brand-pink hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>See full history</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-6 w-20" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="p-8 text-center text-status-danger">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Failed to load your incidents</p>
            <p className="text-xs text-content-muted mt-1">
              Please verify your connection to the IT service management server.
            </p>
          </Card>
        ) : recentIncidents.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-8 h-8 text-brand-deep" />}
            title="No Reported Incidents"
            description="You have not reported any IT service incidents yet. Everything appears to be operational!"
            action={
              <Link to="/employee/report">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Report New Incident
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
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
                      <span>Category: <strong className="text-content-dark">{incident.categoryName}</strong></span>
                      <span>|</span>
                      <span>Reported {formatRelativeTime(incident.createdAt)}</span>
                      {incident.technicianName && (
                        <>
                          <span>|</span>
                          <span>Assigned to: <strong className="text-content-dark">{incident.technicianName}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Link to={`/employee/incidents/${incident.id}`}>
                      <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </Link>
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
