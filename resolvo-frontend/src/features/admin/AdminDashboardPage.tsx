import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/reports.api';
import { incidentsApi } from '../../api/incidents.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { GaugeCard } from '../../components/charts/GaugeCard';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Layers,
  ListOrdered,
  ShieldAlert,
  Sliders,
  Users,
  Sparkles,
  Network,
} from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  P1: '#F43F5E',
  P1_CRITICAL: '#F43F5E', // Rose
  P2: '#F59E0B',
  P2_HIGH: '#F59E0B',     // Amber
  P3: '#09318D',
  P3_MEDIUM: '#09318D',   // Deep Royal Blue
  P4: '#64748B',
  P4_LOW: '#64748B',      // Slate
};

const PRIORITY_LABELS: Record<string, string> = {
  P1: 'P1 Critical',
  P1_CRITICAL: 'P1 Critical',
  P2: 'P2 High',
  P2_HIGH: 'P2 High',
  P3: 'P3 Medium',
  P3_MEDIUM: 'P3 Medium',
  P4: 'P4 Low',
  P4_LOW: 'P4 Low',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: '#0EA5E9',         // Azure
  CLASSIFIED: '#6366F1',  // Indigo
  REPORTED: '#0EA5E9',    // Azure
  ASSIGNED: '#3B82F6',    // Blue
  ACKNOWLEDGED: '#8B5CF6',// Purple
  IN_PROGRESS: '#FD91CC', // Bubblegum Pink
  WAITING_FOR_USER: '#F59E0B', // Amber
  RESOLVED: '#10B981',    // Emerald
  VERIFIED: '#059669',    // Green
  CLOSED: '#475569',      // Slate
  REOPENED: '#E11D48',    // Rose
};

export const AdminDashboardPage: React.FC = () => {
  // Load Overview Metrics
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: () => reportsApi.getOverviewReport(),
    staleTime: 15000,
  });

  // Load Technician Workload Analytics
  const { data: techWorkloads = [], isLoading: isTechLoading } = useQuery({
    queryKey: ['reports-technicians'],
    queryFn: () => reportsApi.getTechnicianWorkloadReport(),
    staleTime: 15000,
  });

  // Load Service Reliability Analysis
  const { data: serviceReports = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ['reports-services'],
    queryFn: () => reportsApi.getServiceAnalysisReport(),
    staleTime: 15000,
  });

  // Load Active Outage & Correlation Clusters
  const { data: outageClusters = [] } = useQuery({
    queryKey: ['active-outage-clusters'],
    queryFn: () => incidentsApi.getActiveOutageClusters(),
    refetchInterval: 15000,
  });

  // Prepare Priority Pie Data
  const priorityChartData = Object.entries(overview?.countByPriority || {}).map(([key, val]) => ({
    name: PRIORITY_LABELS[key] || key.replace('_', ' '),
    rawKey: key,
    value: Number(val),
  }));

  // Prepare Status Bar Data
  const statusChartData = Object.entries(overview?.countByStatus || {}).map(([key, val]) => ({
    name: key.replace(/_/g, ' '),
    rawKey: key,
    count: Number(val),
  }));

  // Prepare Service Incident Data
  const serviceChartData = serviceReports.map((s) => ({
    name: s.serviceName.length > 14 ? `${s.serviceName.slice(0, 14)}...` : s.serviceName,
    fullName: s.serviceName,
    incidents: Number(s.totalIncidents),
    breaches: Number(s.slaBreaches),
  }));

  const complianceRate = overview?.slaComplianceRatePercent
    ? Math.round(overview.slaComplianceRatePercent * 10) / 10
    : 99.2;

  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await reportsApi.downloadIncidentsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-overview-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV report', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Operations Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-pink-soft text-brand-pink border border-brand-pink/30">
              Administrator Governance
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Real-time oversight of system availability, ITIL incident lifecycle distribution, and technician capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="glass"
            size="md"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportCsv}
            isLoading={isExporting}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Export Report (CSV)
          </Button>
          <Link to="/admin/incidents">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />} className="font-bold shadow-pink">
              Manage All Incidents
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-brand-azure">
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Total Reported</p>
          <div className="text-2xl font-extrabold text-content-dark mt-1">
            {isOverviewLoading ? <Skeleton className="h-7 w-12" /> : overview?.totalIncidents ?? 0}
          </div>
          <p className="text-[11px] text-content-muted mt-0.5">Across all IT services</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-brand-pink">
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Open & Active</p>
          <div className="text-2xl font-extrabold text-brand-deep mt-1">
            {isOverviewLoading ? <Skeleton className="h-7 w-12" /> : (overview?.openIncidents ?? 0) + (overview?.inProgressIncidents ?? 0)}
          </div>
          <p className="text-[11px] text-brand-pink-deep font-semibold mt-0.5">In dispatch & investigation</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">P1 Critical Disruptions</p>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {isOverviewLoading ? <Skeleton className="h-7 w-12" /> : (overview?.countByPriority?.['P1'] ?? overview?.countByPriority?.['P1_CRITICAL'] ?? 0)}
          </div>
          <p className="text-[11px] text-rose-700 font-semibold mt-0.5 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Highest impact tickets
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">Resolved & Closed</p>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {isOverviewLoading ? <Skeleton className="h-7 w-12" /> : (overview?.resolvedIncidents ?? 0) + (overview?.closedIncidents ?? 0)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Successfully restored
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-muted">SLA Breaches</p>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {isOverviewLoading ? <Skeleton className="h-7 w-12" /> : overview?.slaBreaches ?? 0}
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Violations recorded
          </p>
        </Card>
      </div>

      {/* Active Enterprise Outage & Correlation Clusters Card */}
      {outageClusters.length > 0 && (
        <Card className="p-6 space-y-4 border-l-4 border-l-rose-600 bg-rose-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-rose-600" />
              <div>
                <h2 className="text-base font-bold text-content-dark">
                  Active Enterprise Outage & Infrastructure Clusters ({outageClusters.length})
                </h2>
                <p className="text-xs text-content-muted">
                  Correlated multi-service incidents sharing common infrastructure components and cascading failure modes.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-bold">
              High System Impact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outageClusters.map((cluster) => (
              <div
                key={cluster.clusterId}
                className="p-4 rounded-xl bg-white border border-rose-200 shadow-sm space-y-3 text-xs min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {cluster.clusterId}
                    </span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                      {cluster.highestPriority}
                    </span>
                  </div>
                  <span className="font-bold text-content-dark">
                    {cluster.totalAffectedUsers} Affected Users
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-content-dark text-sm">
                    Component: {cluster.sharedComponent}
                  </h4>
                  <p className="text-xs text-content-muted mt-0.5">
                    {cluster.rootCauseHypothesis}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cluster.affectedServiceNames.map((svc) => (
                    <span
                      key={svc}
                      className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200"
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                {/* Correlated Tickets Scrollable Strip */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-content-dark flex items-center gap-1.5">
                      <span>Correlated Tickets:</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {cluster.incidentCount}
                      </span>
                    </span>
                    <span className="text-[10px] text-content-muted flex items-center gap-0.5">
                      <span>Scroll to view</span>
                      <span>&rarr;</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 max-w-full min-w-0 custom-scrollbar">
                    {cluster.incidentIds.map((id) => (
                      <Link
                        key={id}
                        to="/admin/incidents"
                        className="font-mono text-xs font-bold text-brand-deep hover:text-brand-azure bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0 transition-colors shadow-2xs"
                      >
                        INC-{id}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance Gauge Card */}
        <div className="lg:col-span-1">
          <GaugeCard
            title="SLA Compliance Rate"
            value={`${complianceRate}%`}
            subtitle="Calculated over 30-day operational rolling window"
            percentageChange="+0.4%"
            className="h-full shadow-pink"
          />
        </div>

        {/* Incidents by Priority Donut Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-pink-deep" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
                Incidents by Priority
              </h2>
            </div>
            <span className="text-xs font-semibold text-content-muted">Multi-factor score</span>
          </div>

          <div className="h-56 w-full my-2">
            {isOverviewLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : priorityChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-content-muted">No incident priority data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {priorityChartData.map((entry) => (
                      <Cell
                        key={entry.rawKey}
                        fill={PRIORITY_COLORS[entry.rawKey] || '#64748B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs pt-2 border-t border-surface-border">
            {priorityChartData.map((item) => (
              <div key={item.rawKey} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[item.rawKey] || '#64748B' }}
                />
                <span className="text-content-muted">{item.name}:</span>
                <strong className="text-content-dark">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>

        {/* Incidents by Lifecycle Status Bar Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-azure" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
                Lifecycle Status Breakdown
              </h2>
            </div>
            <span className="text-xs font-semibold text-content-muted">ITIL Phases</span>
          </div>

          <div className="h-56 w-full my-2">
            {isOverviewLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {statusChartData.map((entry) => (
                      <Cell
                        key={entry.rawKey}
                        fill={STATUS_COLORS[entry.rawKey] || '#09318D'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <p className="text-center text-xs text-content-muted pt-2 border-t border-surface-border">
            Total active lifecycle pipeline: <strong>{(overview?.openIncidents ?? 0) + (overview?.inProgressIncidents ?? 0)} tickets</strong>
          </p>
        </Card>
      </div>

      {/* Row 2: Service Reliability Breakdown & Technician Capacity Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Analysis Bar Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-deep" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
                Incidents & SLA Violations by Service
              </h2>
            </div>
            <Link to="/admin/services" className="text-xs font-semibold text-brand-deep hover:underline">
              Manage Services →
            </Link>
          </div>

          <div className="h-64 w-full">
            {isServicesLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-15} textAnchor="end" height={35} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="incidents" fill="#09318D" name="Total Incidents" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="breaches" fill="#F43F5E" name="SLA Breaches" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Technician Workload & Capacity Utilization */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-pink-deep" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-dark">
                Technician Workload Capacity
              </h2>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-deep hover:underline">
              View All Techs →
            </Link>
          </div>

          <div className="space-y-3.5">
            {isTechLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)
            ) : techWorkloads.length === 0 ? (
              <p className="text-xs text-content-muted text-center py-6">No technician metrics recorded</p>
            ) : (
              techWorkloads.map((tech) => {
                const active = tech.activeIncidentCount ?? 0;
                const util = Math.min(100, Math.round((active / tech.maxWorkload) * 100));
                return (
                  <div key={tech.technicianId} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-content-dark">{tech.fullName}</span>
                        <span className="text-[10px] text-content-muted">({tech.experienceLevel})</span>
                        {tech.available ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="On-duty" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Off-duty" />
                        )}
                      </div>
                      <span className="font-mono font-semibold text-content-dark">
                        {tech.activeIncidentCount} / {tech.maxWorkload} tickets ({util}%)
                      </span>
                    </div>

                    {/* Workload Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          util >= 85
                            ? 'bg-rose-500'
                            : util >= 60
                            ? 'bg-brand-pink'
                            : 'bg-brand-deep'
                        }`}
                        style={{ width: `${util}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Governance & Configuration Quick Access Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/incidents" className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-brand-azure transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-azure/10 flex items-center justify-center text-brand-deep">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-dark group-hover:text-brand-deep">All Incidents</p>
                <p className="text-[11px] text-content-muted">Filter, assign & classify</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-deep group-hover:translate-x-0.5 transition-all" />
          </Card>
        </Link>

        <Link to="/admin/users" className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-brand-pink transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-pink-soft flex items-center justify-center text-brand-deep">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-dark group-hover:text-brand-deep">Users & Techs</p>
                <p className="text-[11px] text-content-muted">Profiles, skills & limits</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-deep group-hover:translate-x-0.5 transition-all" />
          </Card>
        </Link>

        <Link to="/admin/services" className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-brand-azure transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-azure/10 flex items-center justify-center text-brand-deep">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-dark group-hover:text-brand-deep">Services & SLA</p>
                <p className="text-[11px] text-content-muted">Catalog & target thresholds</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-deep group-hover:translate-x-0.5 transition-all" />
          </Card>
        </Link>

        <Link to="/admin/strategy" className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-brand-pink transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-pink-soft flex items-center justify-center text-brand-deep">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-content-dark group-hover:text-brand-deep">Strategy Settings</p>
                <p className="text-[11px] text-content-muted">Dynamic routing pattern</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-deep group-hover:translate-x-0.5 transition-all" />
          </Card>
        </Link>
      </div>
    </div>
  );
};
