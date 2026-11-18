import React, { useState } from 'react';
import { Stepper } from '../../components/ui/Stepper';
import { LIFECYCLE_STEPS } from '../../lib/constants';
import {
  FileText,
  Tag,
  Gauge,
  UserCheck,
  SearchCode,
  CheckCircle,
  ThumbsUp,
  Archive,
  ArrowRight,
} from 'lucide-react';

interface StepDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  actor: 'Employee' | 'System Engine' | 'Technician' | 'Administrator';
  details: string[];
}

export const LifecycleSection: React.FC = () => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(2); // Default to Prioritize

  const stepDetails: StepDetail[] = [
    {
      id: 'REPORT',
      title: '1. Incident Reporting',
      subtitle: 'Employee Self-Service Submission',
      description: 'Employees report disruptions with title, detailed symptoms, affected service, and user impact counts.',
      icon: <FileText className="w-6 h-6 text-brand-pink" />,
      actor: 'Employee',
      details: [
        'Structured form with impact and urgency inputs',
        'Auto-suggests relevant IT service catalog items',
        'Immediate ticket token issuance and confirmation',
      ],
    },
    {
      id: 'CLASSIFY',
      title: '2. Heuristic Classification',
      subtitle: 'Automated Category Detection',
      description: 'The backend parses incident descriptions against category keywords to assign the correct classification.',
      icon: <Tag className="w-6 h-6 text-brand-cyan" />,
      actor: 'System Engine',
      details: [
        'Keyword token scoring for accurate domain targeting',
        'Direct mapping to Hardware, Software, Network, Security, Database',
        'Eliminates manual triage delays',
      ],
    },
    {
      id: 'PRIORITIZE',
      title: '3. Dynamic Prioritization',
      subtitle: 'Impact x Urgency SLA Matrix',
      description: 'Deterministic prioritization matrix evaluates business criticality and assigns P1 Critical through P4 Low.',
      icon: <Gauge className="w-6 h-6 text-rose-400" />,
      actor: 'System Engine',
      details: [
        'P1 Critical: 15-minute response, 2-hour resolution SLA',
        'P2 High: 30-minute response, 4-hour resolution SLA',
        'Instant SLA clock initialization and milestone stamping',
      ],
    },
    {
      id: 'ASSIGN',
      title: '4. Intelligent Assignment',
      subtitle: 'Multi-Factor Strategy Dispatch',
      description: 'AssignmentStrategyManager resolves available technicians using Round-Robin, Workload-Aware, or Skill-Based strategies.',
      icon: <UserCheck className="w-6 h-6 text-amber-400" />,
      actor: 'System Engine',
      details: [
        'Workload capacity checking (prevents engineer burnout)',
        'Domain expertise alignment (Database, Network, Cloud, Security)',
        'Immediate assignment notification dispatch via in-app & email',
      ],
    },
    {
      id: 'INVESTIGATE',
      title: '5. Active Investigation',
      subtitle: 'Technician Diagnosis & Notes',
      description: 'Assigned technician acknowledges the ticket, transitions state to IN_PROGRESS, and documents diagnosis notes.',
      icon: <SearchCode className="w-6 h-6 text-brand-pink" />,
      actor: 'Technician',
      details: [
        'Acknowledge action timestamps initial SLA response time',
        'Internal vs. public timeline communication comments',
        'Optional ON_HOLD state for third-party dependency waiting',
      ],
    },
    {
      id: 'RESOLVE',
      title: '6. Remediation & Resolution',
      subtitle: 'Solution Applied & Documented',
      description: 'Technician applies the root cause fix and provides detailed resolution summary to resolve the incident.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      actor: 'Technician',
      details: [
        'Captures resolution summary and root cause category',
        'Stops resolution SLA clock and verifies target compliance',
        'Automatically notifies reporter to verify service restoration',
      ],
    },
    {
      id: 'VERIFY',
      title: '7. Verification & Feedback',
      subtitle: 'Reporter Sign-off & Rating',
      description: 'The employee verifies that their service is fully operational and provides satisfaction feedback.',
      icon: <ThumbsUp className="w-6 h-6 text-brand-cyan" />,
      actor: 'Employee',
      details: [
        'Empowers the reporter to confirm real-world recovery',
        'Option to reopen ticket if disruption persists',
        'Quality feedback rating recorded in service analytics',
      ],
    },
    {
      id: 'CLOSE',
      title: '8. Final Closure & Archival',
      subtitle: 'Terminal State Finalization',
      description: 'Incident enters immutable CLOSED state. Workload counters decrement, and full audit logs are sealed.',
      icon: <Archive className="w-6 h-6 text-slate-300" />,
      actor: 'System Engine',
      details: [
        'Terminal state pattern enforcement (no further mutations allowed)',
        'Decrements technician active workload counter',
        'Sealed record indexed for historical duplicate detection and reporting',
      ],
    },
  ];

  const current = stepDetails[selectedStepIndex] || stepDetails[0];

  return (
    <section id="lifecycle" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-3 text-brand-pink">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Finite State Machine Lifecycle</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          The Full 8-Step{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
            Incident Lifecycle
          </span>
        </h2>
        <p className="mt-3 text-slate-300 text-base sm:text-lg">
          Governed by the GoF State Pattern. No illegal state jumps, no missed SLAs, and complete audit accountability from report to close.
        </p>
      </div>

      {/* Interactive Stepper Navigation Bar */}
      <div className="glass-card-dark rounded-2xl p-6 shadow-float border border-white/10 mb-8">
        <Stepper
          currentStepIndex={selectedStepIndex}
          steps={LIFECYCLE_STEPS}
          theme="dark"
          className="mb-4"
        />
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4 border-t border-white/10">
          {LIFECYCLE_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setSelectedStepIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                idx === selectedStepIndex
                  ? 'bg-brand-pink text-brand-deep font-bold shadow-pink'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {idx + 1}. {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Step Deep-Dive Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-float text-slate-900 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-deep/10 text-brand-deep flex items-center justify-center">
              {current.icon}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">
                Phase {selectedStepIndex + 1} of 8
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {current.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Executing Role:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-deep text-white">
              {current.actor}
            </span>
          </div>
        </div>

        <p className="mt-4 text-base text-slate-700 leading-relaxed">
          {current.description}
        </p>

        {/* Feature Checkpoints */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {current.details.map((detail, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium flex items-start gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
