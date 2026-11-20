import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../../components/ui/Toast';
import { TechnicianDashboardPage } from '../TechnicianDashboardPage';
import { technicianApi } from '../../../api/technician.api';
import type { IncidentSummaryResponse } from '../../../types/incident';

vi.mock('../../../api/technician.api', () => ({
  technicianApi: {
    getMyWorkload: vi.fn(),
    getMyAssignedIncidents: vi.fn(),
    setAvailability: vi.fn(),
  },
}));

vi.mock('../../../api/incidents.api', () => ({
  incidentsApi: {
    acknowledgeIncident: vi.fn(),
    startInvestigation: vi.fn(),
  },
}));

vi.mock('../../../auth', () => ({
  useAuth: () => ({
    user: {
      id: 2,
      username: 'tech_alice',
      fullName: 'Alice Specialist',
      role: 'TECHNICIAN',
      specialization: 'DATABASE',
    },
    token: 'mock-jwt-token',
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockWorkload = {
  technicianId: 2,
  fullName: 'Alice Specialist',
  experienceLevel: 'SENIOR',
  activeIncidentCount: 3,
  maxWorkload: 6,
  available: true,
  capacityRemaining: 3,
};

const mockAssignedIncidents: IncidentSummaryResponse[] = [
  {
    id: 301,
    title: 'Database replica synchronization lag exceeds threshold',
    status: 'ASSIGNED',
    priority: 'P1_CRITICAL',
    serviceName: 'Production Databases',
    categoryName: 'Database & Storage',
    reporterName: 'John Employee',
    technicianName: 'Alice Specialist',
    slaStatus: 'APPROACHING_BREACH',
    createdAt: new Date().toISOString(),
  },
];

const renderTechnicianDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <TechnicianDashboardPage />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('TechnicianDashboardPage', () => {
  it('renders technician console, workload gauge, and availability status', async () => {
    vi.mocked(technicianApi.getMyWorkload).mockResolvedValue(mockWorkload);
    vi.mocked(technicianApi.getMyAssignedIncidents).mockResolvedValue(mockAssignedIncidents);

    renderTechnicianDashboard();

    expect(screen.getByRole('heading', { name: /technician operations console/i })).toBeInTheDocument();
    expect(screen.getByText(/DATABASE Specialist/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Active Queue Workload')).toBeInTheDocument();
      expect(screen.getAllByText('Database replica synchronization lag exceeds threshold')[0]).toBeInTheDocument();
      expect(screen.getAllByText('INC-301')[0]).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /acknowledge/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start investigation/i })).toBeInTheDocument();
    });
  });
});
