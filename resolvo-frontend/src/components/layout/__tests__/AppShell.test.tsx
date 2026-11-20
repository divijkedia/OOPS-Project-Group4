import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../../ui/Toast';
import { AppShell } from '../AppShell';

vi.mock('../../../auth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 1,
      username: 'emp_john',
      fullName: 'John Employee',
      role: 'EMPLOYEE',
      department: 'ENGINEERING',
      email: 'john@example.com',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    token: 'jwt-token',
    role: 'EMPLOYEE',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  })),
}));

vi.mock('../../../api/notifications.api', () => ({
  notificationsApi: {
    getMyNotifications: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn(),
  },
}));

describe('AppShell', () => {
  it('renders brand logo, employee navigation links, and notification trigger', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    );

    // Verify Brand
    expect(screen.getByText('Resolvo')).toBeInTheDocument();
    expect(screen.getByText('EMPLOYEE')).toBeInTheDocument();

    // Verify Employee Nav Links
    expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Report Incident')).toBeInTheDocument();
    expect(screen.getByText('My Incidents')).toBeInTheDocument();
    expect(screen.getByText('Design Style Guide')).toBeInTheDocument();
  });
});
