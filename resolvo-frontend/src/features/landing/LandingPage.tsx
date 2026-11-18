import React, { useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { StatsStripSection } from './StatsStripSection';
import { ServicesGridSection } from './ServicesGridSection';
import { LifecycleSection } from './LifecycleSection';
import { FeatureHighlightsSection } from './FeatureHighlightsSection';
import { RolesSection } from './RolesSection';
import { ClosingCtaSection } from './ClosingCtaSection';
import { Footer } from './Footer';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { User, Wrench, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN' | null>(null);

  const handleOpenAuth = (role?: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN') => {
    setSelectedRole(role || 'EMPLOYEE');
    setAuthModalOpen(true);
  };

  const handleProceedToLogin = (username: string) => {
    setAuthModalOpen(false);
    showToast({
      type: 'info',
      title: 'Portal Access Ready',
      message: `Connecting as ${username} (password: password123)...`,
    });
    // In Step 3 we wire the live backend auth routes.
    // For now we navigate to /login with pre-selected role/username query param.
    navigate(`/login?user=${username}`);
  };

  return (
    <div className="min-h-screen app-royal-bg text-white selection:bg-brand-pink selection:text-brand-deep">
      {/* Floating Header Navbar */}
      <LandingNavbar
        onSignInClick={() => handleOpenAuth('EMPLOYEE')}
        onReportClick={() => handleOpenAuth('EMPLOYEE')}
      />

      {/* Main Landing Sections */}
      <main>
        {/* 1. Hero Section with Headline, Dual CTAs & Overlapping Preview Cards */}
        <HeroSection
          onReportIncident={() => handleOpenAuth('EMPLOYEE')}
          onWatchDemo={() => handleOpenAuth('TECHNICIAN')}
        />

        {/* 2. Scale & Stats Strip */}
        <StatsStripSection />

        {/* 3. "Every Service You Depend On" Catalog Grid */}
        <ServicesGridSection />

        {/* 4. Full 8-Step Lifecycle Section */}
        <LifecycleSection />

        {/* 5. Feature Highlights (Priority, Assignment, SLA, Duplicates, Audit, Alerts) */}
        <FeatureHighlightsSection />

        {/* 6. Built for Every Role (Employee, Technician, Admin) */}
        <RolesSection onSelectRole={(role) => handleOpenAuth(role)} />

        {/* 7. Closing High-Impact CTA Strip */}
        <ClosingCtaSection onGetStarted={() => handleOpenAuth('EMPLOYEE')} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Role Access / Demo Login Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Access Resolvo Portal"
        description="Select a pre-seeded enterprise role to test operational workflows:"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setAuthModalOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 pt-2">
          {/* Employee Option */}
          <div
            onClick={() => handleProceedToLogin('emp_john')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedRole === 'EMPLOYEE'
                ? 'border-brand-deep bg-brand-deep/5 ring-2 ring-brand-deep/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-deep/10 text-brand-deep flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Employee Portal</h4>
                <p className="text-xs text-slate-500">Report & track incidents as <code className="font-bold text-brand-deep">emp_john</code></p>
              </div>
            </div>
            <Button variant="deep" size="sm" className="text-xs">
              Select →
            </Button>
          </div>

          {/* Technician Option */}
          <div
            onClick={() => handleProceedToLogin('tech_alice')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedRole === 'TECHNICIAN'
                ? 'border-brand-deep bg-brand-deep/5 ring-2 ring-brand-deep/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-cyan/20 text-brand-deep flex items-center justify-center">
                <Wrench className="w-5 h-5 text-brand-deep" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Technician Console</h4>
                <p className="text-xs text-slate-500">Investigate & resolve as <code className="font-bold text-brand-deep">tech_alice</code></p>
              </div>
            </div>
            <Button variant="deep" size="sm" className="text-xs">
              Select →
            </Button>
          </div>

          {/* Administrator Option */}
          <div
            onClick={() => handleProceedToLogin('admin')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              selectedRole === 'ADMIN'
                ? 'border-brand-deep bg-brand-deep/5 ring-2 ring-brand-deep/20'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Administrator Suite</h4>
                <p className="text-xs text-slate-500">Reports, strategies & audit logs as <code className="font-bold text-brand-deep">admin</code></p>
              </div>
            </div>
            <Button variant="deep" size="sm" className="text-xs">
              Select →
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 pt-1 text-center">
            All accounts pre-seeded with password: <code className="font-bold text-slate-700">password123</code>
          </p>
        </div>
      </Modal>
    </div>
  );
};
