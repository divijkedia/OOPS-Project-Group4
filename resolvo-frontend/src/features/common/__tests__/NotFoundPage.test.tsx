import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';

vi.mock('../../../auth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
  })),
}));

import { useAuth } from '../../../auth';

describe('NotFoundPage', () => {
  it('renders 404 header and Return to Landing button for unauthenticated users', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Error 404 | Resource Not Found/i)).toBeInTheDocument();
    expect(screen.getByText('Lost in the Service Mesh')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();
    expect(screen.getByText('Return to Landing')).toBeInTheDocument();
  });

  it('renders direct role dashboard button for authenticated Employee', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        username: 'emp_john',
        fullName: 'John Employee',
        role: 'EMPLOYEE',
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
    });

    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
  });
});
