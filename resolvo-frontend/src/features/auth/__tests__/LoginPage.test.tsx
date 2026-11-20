import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../auth/AuthContext';
import { ToastProvider } from '../../../components/ui/Toast';
import { LoginPage } from '../LoginPage';

vi.mock('../../../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const renderLoginPage = () => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('LoginPage', () => {
  it('renders login form elements and brand panel', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('************')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to portal/i })).toBeInTheDocument();
  });

  it('quick-fill button populates credentials for employee', async () => {
    renderLoginPage();
    const employeeFillBtn = screen.getByRole('button', { name: /employee \(john\)/i });
    fireEvent.click(employeeFillBtn);

    const usernameInput = screen.getByLabelText(/username/i, { selector: 'input' }) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('************') as HTMLInputElement;

    await waitFor(() => {
      expect(usernameInput.value).toBe('emp_john');
      expect(passwordInput.value).toBe('password123');
    });
  });

  it('shows validation errors when submitting empty form', async () => {
    renderLoginPage();
    const submitBtn = screen.getByRole('button', { name: /sign in to portal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
