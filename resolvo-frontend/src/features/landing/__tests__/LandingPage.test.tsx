import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../../../components/ui/Toast';
import { LandingPage } from '../LandingPage';

const renderLanding = () => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    </ToastProvider>
  );
};

describe('Public Marketing Landing Page', () => {
  it('renders brand logo and headline concept matching reference mockup', () => {
    renderLanding();
    expect(screen.getAllByText(/Resolvo/i)[0]).toBeInTheDocument();
    expect(
      screen.getByText(/Resolve IT Incidents Faster,/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Before They Become Outages/i)
    ).toBeInTheDocument();
  });

  it('renders dual CTA buttons in the hero section', () => {
    renderLanding();
    expect(
      screen.getByRole('button', { name: /report an incident/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /sign in/i }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders "Every service you depend on" grid with 8 core services', () => {
    renderLanding();
    expect(screen.getByText(/Cloud Infrastructure/i)).toBeInTheDocument();
    expect(screen.getByText(/Production Databases/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise Networks/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentication & IAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise Applications/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage & Data Volumes/i)).toBeInTheDocument();
    expect(screen.getByText(/Communication Systems/i)).toBeInTheDocument();
    expect(screen.getByText(/Digital & Payment APIs/i)).toBeInTheDocument();
  });

  it('renders all 8 incident lifecycle steps', () => {
    renderLanding();
    expect(screen.getByText(/The Full 8-Step/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Report/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Classify/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Prioritize/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Assign/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Investigate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Resolve/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Verify/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Close/i).length).toBeGreaterThan(0);
  });

  it('renders all 3 operational role sections (Employees, Technicians, Administrators)', () => {
    renderLanding();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Technicians')).toBeInTheDocument();
    expect(screen.getByText('Administrators')).toBeInTheDocument();
  });

  it('renders stats strip and footer with course attribution', () => {
    renderLanding();
    expect(screen.getAllByText(/SLA Compliance Rate/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/CS F213 \/ MAC F212 OOP Project/i)).toBeInTheDocument();
  });
});
