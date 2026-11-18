import React from 'react';
import { ShieldCheck, Zap, Activity, Clock } from 'lucide-react';

export const StatsStripSection: React.FC = () => {
  const stats = [
    {
      value: '99.8%',
      label: 'SLA Compliance Rate',
      subtext: 'Across all enterprise tiers',
      icon: <ShieldCheck className="w-5 h-5 text-brand-pink" />,
    },
    {
      value: '< 15 min',
      label: 'P1 Mean Response Time',
      subtext: 'Instant automated triage',
      icon: <Clock className="w-5 h-5 text-brand-cyan" />,
    },
    {
      value: '40%+',
      label: 'Outage Risk Reduction',
      subtext: 'Proactive duplicate clustering',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      value: '60,000+',
      label: 'Incidents Mitigated',
      subtext: 'With zero data loss',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="glass-card-dark rounded-3xl p-6 sm:p-10 border border-white/15 shadow-float relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-azure/20 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center sm:justify-start gap-2 mb-2 text-white/90">
                {stat.icon}
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {stat.value}
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                {stat.subtext}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
