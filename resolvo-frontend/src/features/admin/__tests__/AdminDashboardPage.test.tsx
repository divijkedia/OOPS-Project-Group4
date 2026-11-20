import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminDashboardPage } from '../AdminDashboardPage';
import { reportsApi } from '../../../api/reports.api';

vi.mock('../../../api/reports.api', () => ({
  reportsApi: {
    getOverviewReport: vi.fn(),
    getTechnicianWorkloadReport: vi.fn(),
    getServiceAnalysisReport: vi.fn(),
  },
}));

const mockOverview = {
  totalIncidents: 42,
  openIncidents: 8,
  inProgressIncidents: 14,
  resolvedIncidents: 12,
  closedIncidents: 8,
  slaBreaches: 2,
  slaComplianceRatePercent: 95.2,
  countByPriority: {
    P1_CRITICAL: 3,
    P2_HIGH: 9,
    P3_MEDIUM: 20,
    P4_LOW: 10,
  },
  countByStatus: {
    REPORTED: 8,
    ASSIGNED: 6,
    IN_PROGRESS: 8,
    WAITING_FOR_USER: 3,
    RESOLVED: 9,
    CLOSED: 8,
  },
};

const mockTechWorkloads = [
  {
    technicianId: 2,
    fullName: 'Alice Specialist',
    experienceLevel: 'SENIOR',
    maxWorkload: 6,
    activeIncidentCount: 3,
    available: true,
    utilizationPercentage: 50,
  },
  {
    technicianId: 3,
    fullName: 'Bob Networker',
    experienceLevel: 'MID',
    maxWorkload: 5,
    activeIncidentCount: 4,
    available: true,
    utilizationPercentage: 80,
  },
];

const mockServiceAnalysis = [
  {
    serviceId: 1,
    serviceName: 'Corporate VPN Gateway',
    businessCriticality: 'MISSION_CRITICAL',
    totalIncidents: 18,
    activeIncidents: 4,
    slaBreaches: 1,
  },
  {
    serviceId: 2,
    serviceName: 'HR Self-Service Portal',
    businessCriticality: 'BUSINESS_OPERATIONAL',
    totalIncidents: 12,
    activeIncidents: 2,
    slaBreaches: 0,
  },
];

describe('AdminDashboardPage', () => {
  it('renders overview KPI metrics, compliance gauge, and workload cards correctly', async () => {
    vi.mocked(reportsApi.getOverviewReport).mockResolvedValue(mockOverview);
    vi.mocked(reportsApi.getTechnicianWorkloadReport).mockResolvedValue(mockTechWorkloads);
    vi.mocked(reportsApi.getServiceAnalysisReport).mockResolvedValue(mockServiceAnalysis);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Verify Title & Subtitle
    expect(screen.getByText('Enterprise Operations Center')).toBeInTheDocument();
    expect(screen.getByText('Administrator Governance')).toBeInTheDocument();

    // Wait for queries to resolve and render KPI cards
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument(); // Total Reported
      expect(screen.getByText('22')).toBeInTheDocument(); // Open & Active
      expect(screen.getByText('SLA Compliance Rate')).toBeInTheDocument();
    });

    // Check Technicians
    expect(screen.getByText('Alice Specialist')).toBeInTheDocument();
    expect(screen.getByText('Bob Networker')).toBeInTheDocument();

    // Check Navigation Quick Links
    expect(screen.getByText('All Incidents')).toBeInTheDocument();
    expect(screen.getByText('Users & Techs')).toBeInTheDocument();
    expect(screen.getByText('Services & SLA')).toBeInTheDocument();
    expect(screen.getByText('Strategy Settings')).toBeInTheDocument();
  });
});
