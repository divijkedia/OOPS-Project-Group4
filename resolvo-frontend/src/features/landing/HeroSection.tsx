import React from 'react';
import { Button } from '../../components/ui/Button';
import { StackedBarCard } from '../../components/charts/StackedBarCard';
import { GaugeCard } from '../../components/charts/GaugeCard';
import { AreaLineCard } from '../../components/charts/AreaLineCard';
import { ArrowRight, LogIn, ShieldAlert, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onReportIncident?: () => void;
  onSignIn?: () => void;
  onWatchDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onReportIncident,
  onSignIn,
  onWatchDemo,
}) => {
  const handleSignIn = onSignIn || onWatchDemo;
  return (
    <section id="hero" className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-brand-azure/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-brand-pink/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Feature Tags Pill */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold mb-6 shadow-sm animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
          <span className="text-white/90">Smart Prioritization</span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/90 hidden sm:inline">SLA Monitoring</span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-brand-pink font-bold">Technician Assignment</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
          Resolve IT Incidents Faster,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-white to-brand-cyan">
            Before They Become Outages
          </span>
        </h1>

        {/* Supporting Paragraph */}
        <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
          Enterprise IT service management powered by automated classification, multi-factor technician assignment, and proactive SLA deadline monitoring.
        </p>

        {/* Dual Hero Pill Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onReportIncident}
            className="w-full sm:w-auto"
          >
            Report an Incident
          </Button>

          <Button
            variant="glass"
            size="lg"
            leftIcon={<LogIn className="w-4 h-4 text-brand-pink" />}
            onClick={handleSignIn}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </div>

        {/* Telemetry Status Strip */}
        <div className="mt-8 inline-flex items-center gap-2 text-xs text-slate-300/90 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-pink" />
          <span>Active Enterprise Protection</span>
          <span className="text-white/30">|</span>
          <span className="text-emerald-400 font-semibold">All Systems 99.8% Healthy</span>
        </div>
      </div>

      {/* Floating Preview Cards Overlapping Bottom Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 md:mt-16 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            <span>Interactive Operations Telemetry</span>
          </div>
          <span className="text-[11px] font-mono text-brand-pink bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
            Live SLA Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Horizontal Dual-Tone Bars */}
          <StackedBarCard />

          {/* Card 2: Center Featured Bubblegum Pink Gauge Card */}
          <GaugeCard
            value={65}
            title="Incidents Resolved"
            subtitle="Automated resolution & SLA adherence in last 24h"
            percentageChange="+12%"
          />

          {/* Card 3: System Health Line Chart */}
          <AreaLineCard title="Resolution Velocity & Health" />
        </div>
      </div>
    </section>
  );
};
