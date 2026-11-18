import React from 'react';
import { User, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface RolesSectionProps {
  onSelectRole?: (role: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN') => void;
}

export const RolesSection: React.FC<RolesSectionProps> = ({ onSelectRole }) => {
  const roles = [
    {
      id: 'EMPLOYEE' as const,
      name: 'Employees',
      tagline: 'Frictionless Self-Service Reporting',
      badge: 'Self-Service Portal',
      icon: <User className="w-6 h-6 text-brand-pink" />,
      description:
        'Report IT issues in seconds with smart category suggestions, track live resolution countdowns, and verify service restoration with feedback ratings.',
      capabilities: [
        'Quick incident reporting with impact assessment',
        'Real-time SLA resolution countdown timers',
        'Direct technician chat & information requests',
        'Verification sign-off & satisfaction rating',
      ],
      sampleUser: 'emp_john (John Doe, Finance)',
    },
    {
      id: 'TECHNICIAN' as const,
      name: 'Technicians',
      tagline: 'Focused Queue & Fast Investigation',
      badge: 'Engineer Console',
      icon: <Wrench className="w-6 h-6 text-brand-cyan" />,
      description:
        'Dedicated queue view, expertise matching scores, one-click state progression (Acknowledge, Investigate, Resolve), and duplicate incident linking.',
      capabilities: [
        'Assigned ticket queues with urgency sorting',
        'Visual workload headroom gauge (prevents overload)',
        'One-click lifecycle transitions & internal notes',
        'Automated duplicate detection and smart recommendations',
      ],
      sampleUser: 'tech_alice (Alice Smith, Senior DB)',
    },
    {
      id: 'ADMIN' as const,
      name: 'Administrators',
      tagline: 'Governance, Analytics & Policy Control',
      badge: 'Management Suite',
      icon: <ShieldAlert className="w-6 h-6 text-emerald-400" />,
      description:
        'Global overview dashboards, technician capacity rebalancing, dynamic assignment strategy switching, and immutable compliance audit inspection.',
      capabilities: [
        'Executive reports: MTTA, MTTR & SLA compliance rates',
        'Dynamic strategy switching (Skill-Based, Load-Based)',
        'User, Technician, Service & Category administration',
        'Complete audit trails & SLA breach inspection',
      ],
      sampleUser: 'admin (System Administrator)',
    },
  ];

  return (
    <section id="roles" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-3 text-brand-pink">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Role-Based Operational Workflows</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Built for Every Role in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
            Enterprise IT
          </span>
        </h2>
        <p className="mt-3 text-slate-300 text-base sm:text-lg">
          Tailored user experiences designed specifically for reporting employees, resolution engineers, and operations managers.
        </p>
      </div>

      {/* 3 Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-2xl p-6 sm:p-7 shadow-float text-slate-900 border border-slate-200 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-deep/10 text-brand-deep flex items-center justify-center">
                  {role.icon}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-deep bg-brand-pink-soft px-3 py-1 rounded-full border border-brand-pink-deep/20">
                  {role.badge}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {role.name}
              </h3>
              <p className="text-xs font-bold text-brand-deep mt-0.5">
                {role.tagline}
              </p>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {role.description}
              </p>

              {/* Capabilities List */}
              <div className="mt-5 space-y-2.5">
                {role.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Demo Credential & Action */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-3">
              <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-700">Test Account: </span>
                {role.sampleUser}
              </div>
              <Button
                variant="deep"
                size="sm"
                onClick={() => onSelectRole?.(role.id)}
                className="w-full text-xs font-bold"
              >
                Log In as {role.name.slice(0, -1)} →
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
