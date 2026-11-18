import React from 'react';
import {
  Sparkles,
  Users,
  Clock,
  CopyCheck,
  ShieldCheck,
  BellRing,
  CheckCircle2,
} from 'lucide-react';
import { PriorityBadge } from '../../components/ui/Badge';

export const FeatureHighlightsSection: React.FC = () => {
  const features = [
    {
      title: 'Intelligent Priority Matrix',
      subtitle: 'Deterministic P1-P4 Evaluation',
      description:
        'Calculates incident severity by evaluating business service criticality, department impact, and urgency score in real time.',
      icon: <Sparkles className="w-6 h-6 text-brand-pink" />,
      preview: (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <PriorityBadge priority="P1_CRITICAL" size="sm" />
          <PriorityBadge priority="P2_HIGH" size="sm" />
          <PriorityBadge priority="P3_MEDIUM" size="sm" />
          <PriorityBadge priority="P4_LOW" size="sm" />
        </div>
      ),
    },
    {
      title: 'Smart Technician Assignment',
      subtitle: 'Pluggable Strategy Heuristics',
      description:
        'GoF Strategy Pattern switches between Round-Robin, Workload-Aware (least loaded), and Skill-Based assignment without service downtime.',
      icon: <Users className="w-6 h-6 text-brand-cyan" />,
      preview: (
        <div className="mt-3 flex items-center justify-between text-xs bg-white/10 px-3 py-2 rounded-xl border border-white/10">
          <span className="text-slate-300">Active Strategy</span>
          <span className="text-brand-pink font-bold">Skill-Based Heuristic</span>
        </div>
      ),
    },
    {
      title: 'SLA Tracking & Violation Alerts',
      subtitle: 'Scheduled Background Daemon',
      description:
        'Continuous daemon evaluates non-terminal incidents every 60s, flags approaching deadlines at the 80% mark, and detects violations.',
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      preview: (
        <div className="mt-3 flex items-center justify-between text-xs bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 text-amber-300">
          <span>Approaching Warning</span>
          <span className="font-bold">80% Window Reached</span>
        </div>
      ),
    },
    {
      title: 'Duplicate Incident Detection',
      subtitle: 'Tokenized Jaccard Similarity',
      description:
        'Computes text token similarity (threshold >= 0.40) over a 7-day sliding window to prevent duplicate tickets from fracturing IT response.',
      icon: <CopyCheck className="w-6 h-6 text-emerald-400" />,
      preview: (
        <div className="mt-3 flex items-center justify-between text-xs bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 text-emerald-300">
          <span>Similarity Score</span>
          <span className="font-bold">0.78 Match (Auto-Linked)</span>
        </div>
      ),
    },
    {
      title: 'Immutable Audit Trail',
      subtitle: 'Observer Pattern Event Sourcing',
      description:
        'Spring Application Event listeners log every status transition, assignment change, comment, and SLA alert to an append-only audit log.',
      icon: <ShieldCheck className="w-6 h-6 text-sky-400" />,
      preview: (
        <div className="mt-3 font-mono text-[11px] text-slate-300 bg-white/10 px-3 py-2 rounded-xl border border-white/10 truncate">
          [AUDIT] STATUS_CHANGE: ASSIGNED → IN_PROGRESS
        </div>
      ),
    },
    {
      title: 'Multi-Channel Notifications',
      subtitle: 'In-App Web Alerts & Email Dispatch',
      description:
        'Reactive notification listeners deliver instant alerts to employees and technicians via in-app banners and asynchronous email dispatch.',
      icon: <BellRing className="w-6 h-6 text-brand-pink" />,
      preview: (
        <div className="mt-3 flex items-center justify-between text-xs bg-brand-pink/10 px-3 py-2 rounded-xl border border-brand-pink/20 text-brand-pink">
          <span>Dispatch Channels</span>
          <span className="font-bold">IN_APP + EMAIL</span>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-3 text-brand-pink">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Intelligent System Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Engineered for Enterprise{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
            Reliability & Speed
          </span>
        </h2>
        <p className="mt-3 text-slate-300 text-base sm:text-lg">
          Classic Object-Oriented patterns combined with intelligent heuristics to keep enterprise systems available 24/7.
        </p>
      </div>

      {/* 6 Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="glass-card-dark rounded-2xl p-6 border border-white/10 hover:border-brand-pink/40 hover:bg-white/[0.08] transition-all duration-300 flex flex-col justify-between shadow-float group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-pink">
                {feature.subtitle}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1 group-hover:text-brand-pink transition-colors">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>

            {feature.preview}
          </div>
        ))}
      </div>
    </section>
  );
};
