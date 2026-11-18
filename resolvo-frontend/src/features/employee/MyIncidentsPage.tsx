import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { incidentsApi } from '../../api/incidents.api';
import { catalogApi } from '../../api/catalog.api';
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
  PlusCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
} from 'lucide-react';

export const MyIncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Load employee incidents
  const { data: incidents = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['employee-incidents'],
    queryFn: () => incidentsApi.getMyReportedIncidents(),
    staleTime: 10000,
  });

  // Load service catalog for filter dropdown
  const { data: services = [] } = useQuery({
    queryKey: ['catalog-services'],
    queryFn: () => catalogApi.getServices(),
  });

  // Client-side filtering
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search text match (ID, title, service, category, technician)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = `inc-${incident.id}`.includes(query) || `${incident.id}` === query;
        const matchesTitle = incident.title.toLowerCase().includes(query);
        const matchesService = incident.serviceName?.toLowerCase().includes(query) ?? false;
        const matchesCategory = incident.categoryName?.toLowerCase().includes(query) ?? false;
        const matchesTech = incident.technicianName?.toLowerCase().includes(query) ?? false;

        if (!matchesId && !matchesTitle && !matchesService && !matchesCategory && !matchesTech) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'ALL' && incident.status !== selectedStatus) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && incident.priority !== selectedPriority) {
        return false;
      }

      // Service filter
      if (selectedService !== 'ALL' && incident.serviceName !== selectedService) {
        return false;
      }

      return true;
    });
  }, [incidents, searchTerm, selectedStatus, selectedPriority, selectedService]);

  // Pagination calculation
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
    setSelectedService('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
            <Link to="/employee" className="hover:underline text-brand-pink">Employee Portal</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70">My Incidents</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Reported Incidents
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            View, track real-time resolution progress, and respond to technician inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Link to="/employee/report">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="font-bold shadow-pink"
            >
              Report Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-1">
            <Input
              placeholder="Search by ID, title, tech..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All Lifecycle Statuses', value: 'ALL' },
                { label: 'New / Classified', value: 'CLASSIFIED' },
                { label: 'Assigned', value: 'ASSIGNED' },
                { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Awaiting Your Response', value: 'WAITING_FOR_USER' },
                { label: 'Resolved', value: 'RESOLVED' },
                { label: 'Verified', value: 'VERIFIED' },
                { label: 'Closed', value: 'CLOSED' },
                { label: 'Reopened', value: 'REOPENED' },
              ]}
            />
          </div>

          {/* Priority Dropdown */}
          <div>
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
          </div>

          {/* Service Dropdown */}
          <div>
            <Select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { label: 'All IT Services', value: 'ALL' },
                ...services.map((s) => ({ label: s.name, value: s.name })),
              ]}
            />
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchTerm || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || selectedService !== 'ALL') && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-border text-xs text-content-muted">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents</span>
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-brand-deep hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* Incidents Data Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-status-danger">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-rose-500" />
            <h3 className="font-bold text-base">Failed to fetch incidents</h3>
            <p className="text-xs text-content-muted mt-1">
              Could not communicate with the incident API. Please try again.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4">
              Retry Query
            </Button>
          </div>
        ) : paginatedIncidents.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-10 h-10 text-brand-deep" />}
            title="No Incidents Found"
            description={
              searchTerm || selectedStatus !== 'ALL' || selectedPriority !== 'ALL'
                ? 'No reported tickets match the specified criteria. Try clearing your search or status filters.'
                : 'You have not reported any incidents yet. When you experience a service issue, report it here.'
            }
            action={
              searchTerm || selectedStatus !== 'ALL' || selectedPriority !== 'ALL' ? (
                <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  onClick={() => navigate('/employee/report')}
                >
                  Report New Incident
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-surface-border text-xs font-semibold uppercase tracking-wider text-content-muted">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Service & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Escalation</th>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => navigate(`/employee/incidents/${incident.id}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Ticket Summary */}
                    <td className="py-3.5 px-4 font-medium max-w-xs sm:max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-deep px-1.5 py-0.5 rounded bg-brand-azure/10 shrink-0">
                          INC-{incident.id}
                        </span>
                        <span className="font-bold text-content-dark truncate group-hover:text-brand-deep transition-colors">
                          {incident.title}
                        </span>
                      </div>
                      {incident.technicianName && (
                        <p className="text-[11px] text-content-muted mt-0.5">
                          Assigned to: <span className="font-semibold text-content-dark">{incident.technicianName}</span>
                        </p>
                      )}
                    </td>

                    {/* Service & Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-semibold text-content-dark">{incident.serviceName || 'General IT'}</p>
                      <p className="text-[11px] text-content-muted">{incident.categoryName || 'Unclassified'}</p>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={incident.priority as Priority} size="sm" />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={incident.status as IncidentStatus} size="sm" />
                    </td>

                    {/* SLA Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SlaBadge status={incident.slaStatus} size="sm" />
                    </td>

                    {/* Escalation Level */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EscalationBadge level={incident.escalationLevel} size="sm" />
                    </td>

                    {/* Reported Relative Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-content-muted text-xs">
                      {formatRelativeTime(incident.createdAt)}
                    </td>

                    {/* Action Link */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/employee/incidents/${incident.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-bold text-xs text-brand-deep hover:text-brand-azure group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
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
