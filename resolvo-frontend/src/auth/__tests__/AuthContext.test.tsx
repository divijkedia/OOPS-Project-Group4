import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import { authApi } from '../../api/auth.api';

// Mock authApi
vi.mock('../../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    register: vi.fn(),
  },
}));

describe('AuthContext & Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('initializes with unauthenticated state when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('successfully logs in and persists token and user to localStorage', async () => {
    const mockAuthResponse = {
      token: 'mock-jwt-token-xyz',
      type: 'Bearer',
      userId: 7,
      username: 'emp_john',
      fullName: 'John Doe',
      role: 'EMPLOYEE' as const,
    };

    const mockUserResponse = {
      id: 7,
      username: 'emp_john',
      email: 'john@enterprise.com',
      fullName: 'John Doe',
      role: 'EMPLOYEE' as const,
      active: true,
      department: 'Finance',
      createdAt: '2026-11-06T12:00:00Z',
    };

    vi.mocked(authApi.login).mockResolvedValueOnce(mockAuthResponse);
    vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUserResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ username: 'emp_john', password: 'password123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('emp_john');
    expect(result.current.token).toBe('mock-jwt-token-xyz');
    expect(localStorage.getItem('iitsm_token')).toBe('mock-jwt-token-xyz');
  });

  it('logout clears localStorage and resets auth state', async () => {
    localStorage.setItem('iitsm_token', 'sample-token');
    localStorage.setItem(
      'iitsm_user',
      JSON.stringify({ id: 1, username: 'admin', fullName: 'Admin', role: 'ADMIN' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('iitsm_token')).toBeNull();
    expect(localStorage.getItem('iitsm_user')).toBeNull();
  });
});
