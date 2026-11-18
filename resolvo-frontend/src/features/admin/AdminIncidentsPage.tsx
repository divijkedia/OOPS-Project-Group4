import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../../api/incidents.api';
import { adminApi } from '../../api/admin.api';
import { catalogApi } from '../../api/catalog.api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { PriorityBadge, StatusBadge, SlaBadge, EscalationBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../lib/formatters';
import type { IncidentStatus, Priority } from '../../types/incident';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Tag,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Wrench,
  ShieldAlert,
} from 'lucide-react';

export const AdminIncidentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // URL state synchronization
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const serviceId = searchParams.get('serviceId') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const technicianId = searchParams.get('technicianId') || '';
  const slaStatus = searchParams.get('slaStatus') || '';
  const page = Number(searchParams.get('page') || '0');
  const size = 15;

  // Selected Incident for Modals
  const [assignIncidentId, setAssignIncidentId] = useState<number | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<number | string>('');

  const [classifyIncidentId, setClassifyIncidentId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');

  // Load IT Services and Categories for filters
  const { data: services = [] } = useQuery({
    queryKey: ['catalog-services'],
    queryFn: () => catalogApi.getServices(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  // Load Technicians for Assignment Dropdown
  const { data: technicians = [] } = useQuery({
    queryKey: ['admin-technicians'],
    queryFn: () => adminApi.listTechnicians(),
  });

  // Load Smart Recommendations for active assign modal
  const { data: recommendations = [] } = useQuery({
    queryKey: ['incident-recommendations', assignIncidentId],
    queryFn: () => incidentsApi.getRecommendations(assignIncidentId!),
    enabled: assignIncidentId !== null,
  });

  // Load Incidents with Server-Side Query Params
  const {
    data: incidents = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin-incidents', search, status, priority, serviceId, categoryId, technicianId, slaStatus, page],
    queryFn: () =>
      incidentsApi.getIncidents({
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        serviceId: serviceId ? Number(serviceId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        technicianId: technicianId ? Number(technicianId) : undefined,
        slaStatus: slaStatus || undefined,
        page,
        size,
      }),
    staleTime: 10000,
  });

  // Mutation: Assign Technician
  const assignMutation = useMutation({
    mutationFn: (vars: { id: number; techId: number }) =>
      adminApi.assignTechnician(vars.id, vars.techId),
    onSuccess: (_, vars) => {
      showToast({
        type: 'success',
        title: 'Technician Assigned',
        message: `Incident INC-${vars.id} successfully assigned.`,
      });
      setAssignIncidentId(null);
      setSelectedTechId('');
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Assignment failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Unassign Technician
  const unassignMutation = useMutation({
    mutationFn: (id: number) => adminApi.unassignTechnician(id),
    onSuccess: (_, id) => {
      showToast({
        type: 'success',
        title: 'Technician Unassigned',
        message: `Incident INC-${id} has been completely unassigned and returned to the queue.`,
      });
      setAssignIncidentId(null);
      setSelectedTechId('');
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Unassignment failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Classify Incident
  const classifyMutation = useMutation({
    mutationFn: (vars: { id: number; catId: number }) =>
      adminApi.classifyIncident(vars.id, vars.catId),
    onSuccess: (_, vars) => {
      showToast({
        type: 'success',
        title: 'Incident Reclassified',
        message: `Incident INC-${vars.id} category updated.`,
      });
      setClassifyIncidentId(null);
      setSelectedCategoryId('');
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Reclassification failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Close Incident
  const closeMutation = useMutation({
    mutationFn: (id: number) => adminApi.closeIncident(id),
    onSuccess: (_, id) => {
      showToast({
        type: 'success',
        title: 'Incident Formally Closed',
        message: `Ticket INC-${id} has been moved to CLOSED.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Closure failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  // Mutation: Trigger Automated Escalation Sweep
  const autoEscalateMutation = useMutation({
    mutationFn: () => adminApi.runAutoEscalation(),
    onSuccess: (res) => {
      showToast({
        type: 'success',
        title: 'Escalation Sweep Complete',
        message:
          res.escalatedCount > 0
            ? `Escalated ${res.escalatedCount} incident(s) breached by SLA or duplicate cluster.`
            : 'All active incidents are within healthy thresholds. 0 escalations needed.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to run escalation sweep';
      showToast({ type: 'error', title: 'Sweep Error', message: msg });
    },
  });

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '0');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = Boolean(search || status || priority || serviceId || categoryId || technicianId || slaStatus);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
            <Link to="/admin" className="hover:underline text-brand-pink">Operations Center</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70">All Incidents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            All Organization Incidents
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Central repository of all service disruptions across teams. Search, filter, assign engineers, and classify tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => autoEscalateMutation.mutate()}
            isLoading={autoEscalateMutation.isPending}
            leftIcon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
          >
            Auto-Escalate Sweep
          </Button>
          <Button variant="secondary" size="md" onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Server-Side Filter Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-1">
            <Input
              placeholder="Search ID, title, text..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <Select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Reported', value: 'REPORTED' },
                { label: 'Assigned', value: 'ASSIGNED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Waiting for User', value: 'WAITING_FOR_USER' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Closed', value: 'CLOSED' },
              ]}
            />
          </div>

          {/* Priority Dropdown */}
          <div>
            <Select
              value={priority}
              onChange={(e) => updateParam('priority', e.target.value)}
              options={[
                { label: 'All Priorities', value: '' },
                { label: 'P1 Critical', value: 'P1_CRITICAL' },
                { label: 'P2 High', value: 'P2_HIGH' },
                { label: 'P3 Medium', value: 'P3_MEDIUM' },
                { label: 'P4 Low', value: 'P4_LOW' },
              ]}
            />
          </div>

          {/* Service Dropdown */}
          <div>
            <Select
              value={serviceId}
              onChange={(e) => updateParam('serviceId', e.target.value)}
              options={[
                { label: 'All IT Services', value: '' },
                ...services.map((s) => ({ label: s.name, value: String(s.id) })),
              ]}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <Select
              value={categoryId}
              onChange={(e) => updateParam('categoryId', e.target.value)}
              options={[
                { label: 'All Categories', value: '' },
                ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
              ]}
            />
          </div>

          {/* Technician Dropdown */}
          <div>
            <Select
              value={technicianId}
              onChange={(e) => updateParam('technicianId', e.target.value)}
              options={[
                { label: 'All Technicians', value: '' },
                ...technicians.map((t) => ({ label: t.fullName, value: String(t.id) })),
              ]}
            />
          </div>

          {/* SLA Status Dropdown */}
          <div>
            <Select
              value={slaStatus}
              onChange={(e) => updateParam('slaStatus', e.target.value)}
              options={[
                { label: 'All SLA Conditions', value: '' },
                { label: 'Within SLA', value: 'WITHIN_SLA' },
                { label: 'Approaching Breach', value: 'APPROACHING_BREACH' },
                { label: 'Breached', value: 'BREACHED' },
              ]}
            />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-surface-border text-xs text-content-muted">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters applied. Returned <strong>{incidents.length}</strong> matching tickets.</span>
            </div>
            <button onClick={handleResetFilters} className="text-xs font-semibold text-brand-deep hover:underline">
              Clear All Filters
            </button>
          </div>
        )}
      </Card>

      {/* Table of Incidents */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-status-danger">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-rose-500" />
            <h3 className="font-bold text-base">Failed to fetch incidents</h3>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-3">
              Retry Query
            </Button>
          </div>
        ) : incidents.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10 text-brand-deep" />}
            title="No Incidents Found"
            description="No tickets match the selected search criteria and filters."
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : undefined
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
                  <th className="py-3 px-4">Assigned Tech</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Escalation</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/employee/incidents/${incident.id}`)}
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
                        {formatRelativeTime(incident.createdAt)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-content-dark">{incident.serviceName}</p>
                      <p className="text-[11px] text-content-muted">{incident.categoryName || 'Unclassified'}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-content-dark">
                      {incident.reporterName}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {incident.technicianName ? (
                        <span className="font-semibold text-brand-deep">{incident.technicianName}</span>
                      ) : (
                        <span className="text-content-muted italic">Unassigned</span>
                      )}
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
                        {/* Assign / Reassign Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setAssignIncidentId(incident.id);
                            setSelectedTechId('');
                          }}
                          leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                          title="Assign or Reassign Support Technician"
                        >
                          {incident.technicianName ? 'Reassign' : 'Assign'}
                        </Button>

                        {/* Unassign Button */}
                        {incident.technicianName && incident.status !== 'CLOSED' && incident.status !== 'RESOLVED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => unassignMutation.mutate(incident.id)}
                            isLoading={unassignMutation.isPending && assignIncidentId === incident.id}
                            disabled={unassignMutation.isPending}
                            leftIcon={<UserX className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                            title="Unassign technician completely"
                          >
                            Unassign
                          </Button>
                        )}

                        {/* Reclassify Category Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setClassifyIncidentId(incident.id);
                            setSelectedCategoryId('');
                          }}
                          leftIcon={<Tag className="w-3.5 h-3.5" />}
                          title="Reclassify Category"
                        >
                          Classify
                        </Button>

                        {/* Close Action (if resolved or verified) */}
                        {(incident.status === 'RESOLVED' || incident.status === 'VERIFIED') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => closeMutation.mutate(incident.id)}
                            isLoading={closeMutation.isPending}
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            className="font-bold shadow-pink"
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-content-muted">
          <div>
            Page <strong>{page + 1}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => updateParam('page', String(page - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={incidents.length < size}
              onClick={() => updateParam('page', String(page + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal: Assign / Reassign Technician */}
      {assignIncidentId !== null && (
        <Modal
          isOpen={true}
          onClose={() => setAssignIncidentId(null)}
          title={incidents.find(i => i.id === assignIncidentId)?.technicianName ? `Reassign Technician for INC-${assignIncidentId}` : `Assign Technician to INC-${assignIncidentId}`}
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
                ...(incidents.find(i => i.id === assignIncidentId)?.technicianName ? [
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
              {incidents.find(i => i.id === assignIncidentId)?.technicianName ? (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  isLoading={unassignMutation.isPending}
                  disabled={unassignMutation.isPending || assignMutation.isPending}
                  onClick={() => unassignMutation.mutate(assignIncidentId)}
                  leftIcon={<UserX className="w-3.5 h-3.5 text-rose-500" />}
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                >
                  Unassign Completely
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setAssignIncidentId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedTechId || assignMutation.isPending || unassignMutation.isPending}
                  isLoading={assignMutation.isPending || unassignMutation.isPending}
                  onClick={() => {
                    if (selectedTechId === '__unassign__') {
                      unassignMutation.mutate(assignIncidentId);
                    } else {
                      assignMutation.mutate({
                        id: assignIncidentId,
                        techId: Number(selectedTechId),
                      });
                    }
                  }}
                  className="font-bold shadow-pink"
                >
                  {selectedTechId === '__unassign__'
                    ? 'Confirm Unassignment'
                    : incidents.find(i => i.id === assignIncidentId)?.technicianName
                    ? 'Confirm Reassignment'
                    : 'Confirm Assignment'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Reclassify Incident Category */}
      {classifyIncidentId !== null && (
        <Modal
          isOpen={true}
          onClose={() => setClassifyIncidentId(null)}
          title={`Reclassify Category for INC-${classifyIncidentId}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-content-muted">
              Select the proper technical classification domain for this incident:
            </p>

            <Select
              label="Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              options={[
                { label: 'Choose a category...', value: '' },
                ...categories.map((c) => ({
                  label: c.name,
                  value: String(c.id),
                })),
              ]}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setClassifyIncidentId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedCategoryId || classifyMutation.isPending}
                isLoading={classifyMutation.isPending}
                onClick={() =>
                  classifyMutation.mutate({
                    id: classifyIncidentId,
                    catId: Number(selectedCategoryId),
                  })
                }
                className="font-bold shadow-pink"
              >
                Confirm Category
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
