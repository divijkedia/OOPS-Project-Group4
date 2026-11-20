import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../../components/ui/Toast';
import { ReportIncidentPage } from '../ReportIncidentPage';
import { catalogApi } from '../../../api/catalog.api';
import { incidentsApi } from '../../../api/incidents.api';
import type { IncidentResponse } from '../../../types/incident';

vi.mock('../../../api/catalog.api', () => ({
  catalogApi: {
    getServices: vi.fn(),
    getCategories: vi.fn(),
    suggestCategory: vi.fn(),
  },
}));

vi.mock('../../../api/incidents.api', () => ({
  incidentsApi: {
    getIncidents: vi.fn(),
    createIncident: vi.fn(),
  },
}));

const mockServices = [
  { id: 1, name: 'Cloud Infrastructure', businessCriticality: 'MISSION_CRITICAL' as const, active: true },
  { id: 2, name: 'Production Databases', businessCriticality: 'MISSION_CRITICAL' as const, active: true },
];

const mockCategories = [
  { id: 1, name: 'Hardware & Devices', description: 'Hardware issues' },
  { id: 2, name: 'Database & Storage', description: 'Database issues' },
];

const renderReportPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <ReportIncidentPage />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('ReportIncidentPage', () => {
  it('renders report form with fields and priority prediction', async () => {
    vi.mocked(catalogApi.getServices).mockResolvedValue(mockServices);
    vi.mocked(catalogApi.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(incidentsApi.getIncidents).mockResolvedValue([]);

    renderReportPage();

    expect(screen.getByRole('heading', { name: /report it service incident/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/incident title \/ summary/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByText(/detailed description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/affected it service/i, { selector: 'select' })).toBeInTheDocument();
  });

  it('submits form and calls createIncident', async () => {
    vi.mocked(catalogApi.getServices).mockResolvedValue(mockServices);
    vi.mocked(catalogApi.getCategories).mockResolvedValue(mockCategories);
    vi.mocked(incidentsApi.getIncidents).mockResolvedValue([]);

    const mockCreated: Partial<IncidentResponse> = {
      id: 201,
      title: 'Database connection pool exhausted',
      description: 'Multiple microservices failing with connection timeouts',
      priority: 'P1_CRITICAL',
      status: 'REPORTED',
      affectedUserCount: 50,
      service: { id: 2, name: 'Production Databases', businessCriticality: 'MISSION_CRITICAL' },
      category: { id: 2, name: 'Database & Storage' },
      createdAt: new Date().toISOString(),
    };

    vi.mocked(incidentsApi.createIncident).mockResolvedValue(mockCreated as IncidentResponse);

    renderReportPage();

    const titleInput = screen.getByLabelText(/incident title \/ summary/i, { selector: 'input' });
    const descTextarea = screen.getByPlaceholderText(/describe what happened/i);
    const submitBtn = screen.getByRole('button', { name: /submit incident report/i });

    fireEvent.change(titleInput, { target: { value: 'Database connection pool exhausted' } });
    fireEvent.change(descTextarea, { target: { value: 'Multiple microservices failing with connection timeouts' } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(incidentsApi.createIncident).toHaveBeenCalledTimes(1);
    });
  });
});
