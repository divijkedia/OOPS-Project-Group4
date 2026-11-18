import React from 'react';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface ClosingCtaSectionProps {
  onGetStarted?: () => void;
}

export const ClosingCtaSection: React.FC<ClosingCtaSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
      <div className="relative rounded-3xl p-8 sm:p-14 border border-white/20 overflow-hidden shadow-float hero-gradient">
        {/* Glow circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-pink/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-brand-cyan/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-4 text-brand-pink">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Production Incident Management?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Stop Firefighting Outages.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
              Automate Resolution Today.
            </span>
          </h2>

          <p className="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            Experience deterministic prioritization, multi-factor assignment, and real-time SLA deadline tracking designed for mission-critical digital infrastructure.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={onGetStarted}
              className="w-full sm:w-auto"
            >
              Access Resolvo Portal
            </Button>
          </div>

          {/* Micro trust row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Pre-seeded Test Accounts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              62 Automated Tests Verified
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real REST Backend Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
