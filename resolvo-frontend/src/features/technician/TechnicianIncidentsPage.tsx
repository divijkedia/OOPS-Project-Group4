import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { technicianApi } from '../../api/technician.api';
import { incidentsApi } from '../../api/incidents.api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PriorityBadge, StatusBadge, SlaBadge, EscalationBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../lib/formatters';
import type { IncidentStatus, Priority } from '../../types/incident';
import {
  Search,
  Filter,
  Play,
  UserCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
} from 'lucide-react';

export const TechnicianIncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedSla, setSelectedSla] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load technician assigned queue
  const {
    data: incidents = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['technician-assigned-incidents'],
    queryFn: () => technicianApi.getMyAssignedIncidents(),
    staleTime: 10000,
  });

  // Quick Action Mutations
  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => incidentsApi.acknowledgeIncident(id),
    onSuccess: (_, id) => {
      showToast({
        type: 'success',
        title: 'Incident Acknowledged',
        message: `Ticket INC-${id} acknowledged.`,
      });
      queryClient.invalidateQueries({ queryKey: ['technician-assigned-incidents'] });
    },
  });

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

  // Client-side filtering
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = `inc-${incident.id}`.includes(query) || `${incident.id}` === query;
        const matchesTitle = incident.title.toLowerCase().includes(query);
        const matchesService = incident.serviceName?.toLowerCase().includes(query) ?? false;
        const matchesReporter = incident.reporterName?.toLowerCase().includes(query) ?? false;

        if (!matchesId && !matchesTitle && !matchesService && !matchesReporter) {
          return false;
        }
      }

      if (selectedStatus !== 'ALL' && incident.status !== selectedStatus) {
        return false;
      }

      if (selectedPriority !== 'ALL' && incident.priority !== selectedPriority) {
        return false;
      }

      if (selectedSla !== 'ALL' && incident.slaStatus !== selectedSla) {
        return false;
      }

      return true;
    });
  }, [incidents, searchTerm, selectedStatus, selectedPriority, selectedSla]);

  const totalItems = filteredIncidents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIncidents.slice(start, start + pageSize);
  }, [filteredIncidents, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedSla('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
            <Link to="/technician" className="hover:underline text-brand-pink">Technician Operations</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70">Assigned Incidents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assigned Incidents Queue
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Review active tickets, acknowledge new assignments, and manage investigation progress.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Search by ID, title, service, reporter..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Lifecycle Statuses', value: 'ALL' },
              { label: 'Assigned', value: 'ASSIGNED' },
              { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Waiting for User', value: 'WAITING_FOR_USER' },
              { label: 'Resolved', value: 'RESOLVED' },
              { label: 'Closed', value: 'CLOSED' },
            ]}
          />

          <Select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Priorities', value: 'ALL' },
              { label: 'P1 Critical', value: 'P1_CRITICAL' },
              { label: 'P2 High', value: 'P2_HIGH' },
              { label: 'P3 Medium', value: 'P3_MEDIUM' },
              { label: 'P4 Low', value: 'P4_LOW' },
            ]}
          />

          <Select
            value={selectedSla}
            onChange={(e) => {
              setSelectedSla(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All SLA Conditions', value: 'ALL' },
              { label: 'Within SLA', value: 'WITHIN_SLA' },
              { label: 'Approaching Breach', value: 'APPROACHING_BREACH' },
              { label: 'Breached', value: 'BREACHED' },
            ]}
          />
        </div>

        {(searchTerm || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || selectedSla !== 'ALL') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-border text-xs text-content-muted">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} assigned tickets</span>
            </div>
            <button onClick={handleResetFilters} className="text-xs font-semibold text-brand-deep hover:underline">
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Incidents Data Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-status-danger">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-rose-500" />
            <h3 className="font-bold text-base">Failed to fetch assigned queue</h3>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-3">
              Retry Query
            </Button>
          </div>
        ) : paginatedIncidents.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10 text-brand-deep" />}
            title="No Incidents Match Filters"
            description="No assigned tickets match the specified filter criteria. Clear your filters or refresh the queue."
            action={
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-surface-border text-xs font-semibold uppercase tracking-wider text-content-muted">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Service & Category</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Escalation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/technician/incidents/${incident.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-deep px-1.5 py-0.5 rounded bg-brand-azure/10 shrink-0">
                          INC-{incident.id}
                        </span>
                        <span className="font-bold text-content-dark truncate group-hover:text-brand-deep transition-colors">
                          {incident.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-content-muted mt-0.5">
                        Reported {formatRelativeTime(incident.createdAt)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-content-dark">{incident.serviceName}</p>
                      <p className="text-[11px] text-content-muted">{incident.categoryName || 'General'}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-content-dark">
                      {incident.reporterName}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={incident.priority as Priority} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={incident.status as IncidentStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge status={incident.slaStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EscalationBadge level={incident.escalationLevel} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {incident.status === 'ASSIGNED' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => acknowledgeMutation.mutate(incident.id)}
                              isLoading={acknowledgeMutation.isPending}
                              leftIcon={<UserCheck className="w-3 h-3" />}
                            >
                              Ack
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => startMutation.mutate(incident.id)}
                              isLoading={startMutation.isPending}
                              leftIcon={<Play className="w-3 h-3" />}
                              className="font-bold shadow-pink"
                            >
                              Start
                            </Button>
                          </>
                        )}

                        {incident.status === 'ACKNOWLEDGED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => startMutation.mutate(incident.id)}
                            isLoading={startMutation.isPending}
                            leftIcon={<Play className="w-3 h-3" />}
                            className="font-bold shadow-pink"
                          >
                            Start
                          </Button>
                        )}

                        {incident.status === 'IN_PROGRESS' && (
                          <Link to={`/technician/incidents/${incident.id}`}>
                            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="font-bold shadow-pink">
                              Investigate
                            </Button>
                          </Link>
                        )}

                        {incident.status !== 'ASSIGNED' && incident.status !== 'ACKNOWLEDGED' && incident.status !== 'IN_PROGRESS' && (
                          <Link to={`/technician/incidents/${incident.id}`}>
                            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
            <div>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong>{totalItems}</strong> entries
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>

              <div className="px-3 py-1 font-semibold text-content-dark">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
