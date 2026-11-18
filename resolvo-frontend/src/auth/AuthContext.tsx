import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import type { UserResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { AuthContext } from './authContextDef';

/**
 * SECURITY ARCHITECTURE NOTE:
 * JWT Token Storage Tradeoff:
 * Storing JWT in `localStorage` protects against CSRF (Cross-Site Request Forgery) attacks
 * when coupled with modern SameSite policies, but exposes the token to potential XSS (Cross-Site Scripting)
 * if third-party scripts or unescaped HTML are executed.
 * In production enterprise architectures, `httpOnly` secure cookies with CSRF tokens are preferred.
 * For this client-side SPA with role-based routing, localStorage is used with automatic session expiration
 * and strict React DOM escaping.
 */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('iitsm_token'));
  const [user, setUser] = useState<UserResponse | null>(() => {
    const savedUser = localStorage.getItem('iitsm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('iitsm_token');
    localStorage.removeItem('iitsm_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for global auth expiration events from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('iitsm_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('iitsm_auth_expired', handleAuthExpired);
  }, [logout]);

  // Verify and hydrate current user if token exists on initial app mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('iitsm_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('iitsm_user', JSON.stringify(freshUser));
        } catch {
          // If token verification fails (e.g. backend restarted or expired), clear session
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (credentials: LoginRequest): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      const newToken = response.token;
      localStorage.setItem('iitsm_token', newToken);
      setToken(newToken);

      let userProfile: UserResponse;
      try {
        userProfile = await authApi.getCurrentUser();
      } catch {
        userProfile = {
          id: response.userId,
          username: response.username,
          email: '',
          fullName: response.fullName,
          role: response.role,
          active: true,
          createdAt: new Date().toISOString(),
        };
      }

      localStorage.setItem('iitsm_user', JSON.stringify(userProfile));
      setUser(userProfile);
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (details: RegisterRequest): Promise<UserResponse> => {
    setIsLoading(true);
    try {
      const newUser = await authApi.register(details);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
