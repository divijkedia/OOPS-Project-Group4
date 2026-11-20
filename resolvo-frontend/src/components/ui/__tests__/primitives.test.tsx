import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';
import { PriorityBadge, StatusBadge } from '../Badge';
import { Stepper } from '../Stepper';
import { LIFECYCLE_STEPS } from '../../../lib/constants';

describe('UI Primitives & Design Tokens', () => {
  it('renders primary pink button with proper text and classes', () => {
    render(<Button variant="primary">Get Started</Button>);
    const btn = screen.getByRole('button', { name: /get started/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('bg-brand-pink');
    expect(btn.className).toContain('text-brand-deep');
  });

  it('renders glassy pill button variant', () => {
    render(<Button variant="glass">Watch Demo</Button>);
    const btn = screen.getByRole('button', { name: /watch demo/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('glass-pill');
  });

  it('renders semantic priority and status badges', () => {
    render(
      <div>
        <PriorityBadge priority="P1_CRITICAL" />
        <StatusBadge status="REPORTED" />
      </div>
    );
    expect(screen.getByText(/p1 critical/i)).toBeInTheDocument();
    expect(screen.getByText(/reported/i)).toBeInTheDocument();
  });

  it('renders all 8 lifecycle steps in Stepper', () => {
    render(<Stepper currentStepIndex={2} />);
    expect(LIFECYCLE_STEPS).toHaveLength(8);
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Classify')).toBeInTheDocument();
    expect(screen.getByText('Prioritize')).toBeInTheDocument();
    expect(screen.getByText('Assign')).toBeInTheDocument();
    expect(screen.getByText('Investigate')).toBeInTheDocument();
    expect(screen.getByText('Resolve')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });
});
