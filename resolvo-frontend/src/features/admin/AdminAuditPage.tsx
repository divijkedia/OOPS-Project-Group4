import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileCheck2,
  Search,
  ArrowRight,
  Clock,
  User,
  ShieldAlert,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminAuditPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId') || '';

  const [inputVal, setInputVal] = useState(initialIncidentId);
  const [activeIncidentId, setActiveIncidentId] = useState<number | null>(
    initialIncidentId ? parseInt(initialIncidentId.replace(/\D/g, ''), 10) || null : null
  );

  useEffect(() => {
    const q = searchParams.get('incidentId');
    if (q) {
      const num = parseInt(q.replace(/\D/g, ''), 10);
      if (!isNaN(num)) {
        setActiveIncidentId(num);
        setInputVal(String(num));
      }
    } else {
      setActiveIncidentId(null);
      setInputVal('');
    }
  }, [searchParams]);

  const {
    data: auditTrail = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-audit', activeIncidentId],
    queryFn: () =>
      activeIncidentId
        ? adminApi.getIncidentAuditTrail(activeIncidentId)
        : adminApi.getAllAuditRecords(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = parseInt(inputVal.replace(/\D/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      setActiveIncidentId(cleanNum);
      setSearchParams({ incidentId: String(cleanNum) });
    } else {
      setActiveIncidentId(null);
      setSearchParams({});
    }
  };

  const handleClearFilter = () => {
    setInputVal('');
    setActiveIncidentId(null);
    setSearchParams({});
  };

  const exportToJson = () => {
    if (!auditTrail || auditTrail.length === 0) return;
    const blob = new Blob([JSON.stringify(auditTrail, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeIncidentId
      ? `incident-INC-${activeIncidentId}-audit-trail.json`
      : 'organization-audit-trail.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    if (!auditTrail || auditTrail.length === 0) return;
    const headers = ['ID', 'Incident ID', 'Action', 'Actor', 'User ID', 'Previous State', 'New State', 'Timestamp', 'Description'];
    const rows = auditTrail.map((r) => [
      r.id,
      r.incidentId,
      r.action,
      `"${r.username.replace(/"/g, '""')}"`,
      r.userId,
      r.previousState || '',
      r.newState || '',
      `"${new Date(r.timestamp).toISOString()}"`,
      `"${r.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeIncidentId
      ? `incident-INC-${activeIncidentId}-audit-trail.csv`
      : 'organization-audit-trail.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadgeVariant = (action: string): 'default' | 'info' | 'primary' | 'warning' | 'success' | 'danger' => {
    switch (action.toUpperCase()) {
      case 'CREATED':
      case 'REPORTED':
        return 'info';
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'primary';
      case 'INVESTIGATION_STARTED':
      case 'NOTE_ADDED':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'REOPENED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-pink" />
            Compliance & Incident Audit Trail
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Immutable ITIL change ledger recording state transitions, operator assignments, and diagnostic events.
          </p>
        </div>

        {auditTrail && auditTrail.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportToCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportToJson}
            >
              Export JSON
            </Button>
          </div>
        )}
      </div>

      {/* Incident ID Search Box */}
      <Card className="p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-royal-400" />
            <Input
              type="text"
              placeholder="Filter by Incident ID (e.g. 1, 42, or INC-1)... leave blank to view all events"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="submit" variant="primary" size="md">
              Filter Audit Log
            </Button>
            {activeIncidentId !== null && (
              <Button type="button" variant="secondary" size="md" onClick={handleClearFilter}>
                View All
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Audit Timeline Content */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-4 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3 text-rose-600">
            <AlertCircle className="w-10 h-10" />
            <h3 className="font-bold text-lg">Failed to Load Audit Trail</h3>
            <p className="text-sm text-royal-600 max-w-md">
              {(error as Error)?.message || 'An error occurred while fetching audit trail records.'}
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      ) : !auditTrail || auditTrail.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title={activeIncidentId ? `No Audit Records for Incident INC-${activeIncidentId}` : 'No Audit Records Recorded'}
            description={activeIncidentId ? 'No mutation events recorded for this incident identifier yet.' : 'No audit trail actions recorded across the system yet.'}
            icon={<ShieldAlert className="w-12 h-12 text-royal-400" />}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-royal-100">
            <div>
              <span className="text-xs font-semibold text-royal-500 uppercase tracking-wider">
                Audited Scope
              </span>
              <h2 className="text-xl font-bold text-royal-900">
                {activeIncidentId ? `Incident INC-${activeIncidentId}` : 'All System Incidents Audit Trail'}
              </h2>
            </div>
            <Badge variant="default" className="text-xs">
              {auditTrail.length} {auditTrail.length === 1 ? 'Record' : 'Records'} Logged
            </Badge>
          </div>

          {/* Timeline List */}
          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-royal-200">
            {auditTrail.map((record) => (
              <div key={record.id} className="relative group">
                {/* Timeline Node Dot */}
                <span className="absolute -left-6 top-1.5 flex h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-royal-700 shadow ring-2 ring-pink/40" />

                <div className="bg-royal-50/60 rounded-xl p-4 border border-royal-100 hover:border-pink/30 hover:bg-royal-50 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionBadgeVariant(record.action)}>
                        {record.action.replace(/_/g, ' ')}
                      </Badge>

                      {record.incidentId && (
                        <Link
                          to={`/employee/incidents/${record.incidentId}`}
                          className="font-mono text-xs font-bold text-brand-deep hover:underline px-2 py-0.5 rounded bg-brand-azure/10 border border-brand-azure/20 flex items-center gap-1"
                        >
                          <span>INC-{record.incidentId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      {record.previousState && record.newState && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-royal-700 bg-white px-2 py-0.5 rounded border border-royal-200">
                          <span>{record.previousState}</span>
                          <ArrowRight className="w-3 h-3 text-royal-400" />
                          <span className="font-semibold text-royal-900">{record.newState}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-royal-500 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <p className="text-sm text-royal-900 font-medium leading-relaxed">
                    {record.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-royal-100 flex items-center justify-between text-xs text-royal-600">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-royal-400" />
                      <span>
                        Actor: <strong>{record.username}</strong> (User #{record.userId})
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-royal-400">
                      Audit #{record.id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
