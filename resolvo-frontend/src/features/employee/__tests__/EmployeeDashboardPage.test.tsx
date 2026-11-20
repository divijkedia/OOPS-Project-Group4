import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../../components/ui/Toast';
import { AuthProvider } from '../../../auth';
import { EmployeeDashboardPage } from '../EmployeeDashboardPage';
import { incidentsApi } from '../../../api/incidents.api';
import type { IncidentSummaryResponse } from '../../../types/incident';

vi.mock('../../../api/incidents.api', () => ({
  incidentsApi: {
    getMyReportedIncidents: vi.fn(),
  },
}));

vi.mock('../../../auth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'emp_john',
      fullName: 'John Employee',
      role: 'EMPLOYEE',
      department: 'Finance',
    },
    token: 'mock-jwt-token',
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockIncidents: IncidentSummaryResponse[] = [
  {
    id: 101,
    title: 'PostgreSQL database query latency',
    status: 'IN_PROGRESS',
    priority: 'P1_CRITICAL',
    serviceName: 'Production Databases',
    categoryName: 'Database & Storage',
    reporterName: 'John Employee',
    technicianName: 'Alice Technician',
    slaStatus: 'WITHIN_SLA',
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    title: 'VPN mesh gateway intermittent dropouts',
    status: 'REPORTED',
    priority: 'P2_HIGH',
    serviceName: 'Corporate Networks',
    categoryName: 'Network & Connectivity',
    reporterName: 'John Employee',
    slaStatus: 'WITHIN_SLA',
    createdAt: new Date().toISOString(),
  },
];

const renderEmployeeDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <EmployeeDashboardPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('EmployeeDashboardPage', () => {
  it('renders employee portal header and KPI metrics', async () => {
    vi.mocked(incidentsApi.getMyReportedIncidents).mockResolvedValue(mockIncidents);

    renderEmployeeDashboard();

    expect(screen.getByRole('heading', { name: /employee portal/i })).toBeInTheDocument();
    expect(screen.getByText(/Finance/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('PostgreSQL database query latency')).toBeInTheDocument();
      expect(screen.getByText('VPN mesh gateway intermittent dropouts')).toBeInTheDocument();
      expect(screen.getByText('INC-101')).toBeInTheDocument();
    });
  });

  it('renders quick action button to report incident', () => {
    vi.mocked(incidentsApi.getMyReportedIncidents).mockResolvedValue([]);

    renderEmployeeDashboard();

    const reportBtn = screen.getByRole('button', { name: /report incident/i });
    expect(reportBtn).toBeInTheDocument();
  });
});
