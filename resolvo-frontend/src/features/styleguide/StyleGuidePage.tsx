import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PriorityBadge, StatusBadge, SlaBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Stepper } from '../../components/ui/Stepper';
import { LIFECYCLE_STEPS } from '../../lib/constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import { GaugeCard } from '../../components/charts/GaugeCard';
import { StackedBarCard } from '../../components/charts/StackedBarCard';
import { AreaLineCard } from '../../components/charts/AreaLineCard';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  Play,
  Mail,
  Search,
  FileText,
} from 'lucide-react';

export const StyleGuidePage: React.FC = () => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(3); // In Progress step

  const colorSwatches = [
    { name: 'Royal Deep Blue', hex: '#09318D', note: 'Primary brand, card headers' },
    { name: 'Dark Midnight Blue', hex: '#051A4D', note: 'App base background' },
    { name: 'Luminous Azure', hex: '#1652D9', note: 'Glow radial gradient' },
    { name: 'Vibrant Blue', hex: '#1E60E8', note: 'Interactive focus rings' },
    { name: 'Accent Cyan', hex: '#4CC9F0', note: 'Chart metrics & data series' },
    { name: 'Bubblegum Pink', hex: '#FD91CC', note: 'Primary CTAs & gauge fill' },
    { name: 'Deep Pink', hex: '#D44286', note: 'High-contrast pink text' },
    { name: 'Pure White', hex: '#FFFFFF', note: 'Floating card surfaces' },
    { name: 'Glass Card Navy', hex: '#0A246A', note: 'Dark-mode glass containers' },
    { name: 'Muted Slate', hex: '#94A3B8', note: 'Secondary text on dark' },
  ];

  return (
    <div className="min-h-screen app-royal-bg text-white selection:bg-brand-pink selection:text-brand-deep">
      {/* Top Floating Pill Navigation Demo */}
      <header className="pt-6 px-6 max-w-6xl mx-auto">
        <nav className="glass-pill rounded-full px-6 py-3 flex items-center justify-between shadow-float">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer" title="Return to Main Website">
            <div className="w-8 h-8 rounded-xl bg-brand-pink flex items-center justify-center shadow-pink group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-brand-deep" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-brand-pink transition-colors">
              Resolvo <span className="text-brand-pink text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 ml-1">UI KIT</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 text-xs font-semibold transition-all mr-2"
              title="Return to Main Website"
            >
              <Home className="w-3.5 h-3.5 text-brand-pink" />
              Main Website
            </Link>
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-xs cursor-pointer">
              Overview
            </span>
            <span className="px-4 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors">
              Primitives
            </span>
            <span className="px-4 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors">
              Charts
            </span>
            <span className="px-4 py-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-colors">
              Feedback
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back to Website
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Header Section */}
      <section className="py-14 px-6 text-center max-w-4xl mx-auto">
        {/* Sub-headline Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
          <span className="text-white/90">Enterprise-Grade Incident Management</span>
          <span className="text-white/40">|</span>
          <span className="text-brand-pink font-bold">Dark Royal Blue Theme</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Modern IT Service Management <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink via-white to-brand-cyan">
            Without Complexity
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mt-4 text-base md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
          Deep royal blue base, bubblegum pink primary call-to-actions, high-contrast typography, and enterprise design patterns.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => showToast({ type: 'success', title: 'CTA Triggered', message: 'Primary pink button clicked' })}
          >
            Test Primary CTA
          </Button>

          <Button
            variant="glass"
            size="lg"
            leftIcon={<Play className="w-4 h-4 fill-current" />}
            onClick={() => setIsModalOpen(true)}
          >
            Open Modal Preview
          </Button>
        </div>
      </section>

      {/* Main Sections */}
      <main className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
        {/* 1. The 3 Overlapping Preview Cards from Reference Mockup */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">1. Hero Floating Preview Cards</h2>
            <p className="text-sm text-slate-300">Faithful reproduction of the 3 preview cards shown at the bottom of the reference mockup.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Left Card: Stacked horizontal bars */}
            <StackedBarCard />

            {/* Center Card: Pink Gauge Card */}
            <GaugeCard value={65} title="Threats & Incidents Mitigated" subtitle="Automated SLA resolution in last 24h" />

            {/* Right Card: System Health Line Chart */}
            <AreaLineCard title="System Health & Uptime" />
          </div>
        </section>

        {/* 2. Color Palette Tokens */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">2. Design Tokens & Royal Blue Dark Palette</h2>
            <p className="text-sm text-slate-300">Theme tokens derived strictly from the reference image with no hardcoded hex values in components.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {colorSwatches.map((color) => (
              <div key={color.name} className="glass-card-dark rounded-2xl p-3.5 shadow-float flex flex-col justify-between">
                <div
                  className="w-full h-16 rounded-xl border border-white/10 shadow-inner mb-3"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{color.name}</h4>
                  <p className="font-mono text-[11px] text-brand-pink font-bold mt-0.5">{color.hex}</p>
                  <p className="text-[10px] text-slate-300 mt-1 leading-normal">{color.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Buttons & Action Elements */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">3. Buttons & Interactive States</h2>
            <p className="text-sm text-slate-300">Pill and rounded button variants supporting loading indicators and left/right icons.</p>
          </div>
          <div className="glass-card-dark rounded-2xl p-6 shadow-float space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Pink Pill</Button>
              <Button variant="glass" leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}>
                Glassy Outline
              </Button>
              <Button variant="deep">Deep Blue Solid</Button>
              <Button variant="secondary">Secondary White</Button>
              <Button variant="danger">Danger Action</Button>
              <Button variant="primary" isLoading>Loading State</Button>
              <Button variant="primary" disabled>Disabled State</Button>
            </div>
          </div>
        </section>

        {/* 4. Semantic Badges */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">4. Semantic Badges</h2>
            <p className="text-sm text-slate-300">Standardized badges across the full incident lifecycle, priority matrices, and SLA tracking.</p>
          </div>
          <div className="glass-card-dark rounded-2xl p-6 shadow-float space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Priority Badges (P1 - P4)</h4>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority="P1_CRITICAL" />
                <PriorityBadge priority="P2_HIGH" />
                <PriorityBadge priority="P3_MEDIUM" />
                <PriorityBadge priority="P4_LOW" />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Lifecycle State Badges</h4>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="REPORTED" />
                <StatusBadge status="ASSIGNED" />
                <StatusBadge status="IN_PROGRESS" />
                <StatusBadge status="ON_HOLD" />
                <StatusBadge status="RESOLVED" />
                <StatusBadge status="CLOSED" />
                <StatusBadge status="CANCELLED" />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">SLA Compliance Badges</h4>
              <div className="flex flex-wrap gap-2">
                <SlaBadge status="WITHIN_SLA" />
                <SlaBadge status="APPROACHING" />
                <SlaBadge status="VIOLATED" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Incident Lifecycle Stepper */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">5. Incident Lifecycle Stepper</h2>
              <p className="text-sm text-slate-300">8-step incident progression: Report → Classify → Prioritize → Assign → Investigate → Resolve → Verify → Close.</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              >
                Previous Step
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep((prev) => Math.min(LIFECYCLE_STEPS.length - 1, prev + 1))}
              >
                Next Step
              </Button>
            </div>
          </div>
          <div className="glass-card-dark rounded-2xl p-6 shadow-float space-y-6">
            <Stepper currentStepIndex={currentStep} theme="dark" />
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Compact Stepper Variant</h4>
              <Stepper currentStepIndex={currentStep} variant="compact" theme="dark" />
            </div>
          </div>
        </section>

        {/* 6. Form Controls */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">6. Form Inputs & Selects</h2>
            <p className="text-sm text-slate-300">Form elements with consistent typography, focus halos, and validation states.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-float text-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Incident Title"
                placeholder="e.g. Postgres Connection Pool Exhausted"
                helperText="Provide a clear, succinct summary of the failure"
                required
              />
              <Input
                label="Search Incidents"
                placeholder="Search by keyword, ID or service..."
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Select
                label="Impact Assessment"
                options={[
                  { label: 'Select Impact...', value: '' },
                  { label: 'Critical (Entire organization affected)', value: 'CRITICAL' },
                  { label: 'High (Multiple departments affected)', value: 'HIGH' },
                  { label: 'Medium (Single department affected)', value: 'MEDIUM' },
                  { label: 'Low (Individual user impacted)', value: 'LOW' },
                ]}
                required
              />
              <Input
                label="Validated Email (Error State Demo)"
                defaultValue="invalid-email-address"
                error="Please enter a valid corporate email address ending in .com"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>
          </div>
        </section>

        {/* 7. Enterprise Data Table */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">7. Enterprise Data Table</h2>
            <p className="text-sm text-slate-300">High-density tabular view with status indicators and hover actions.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono font-bold text-brand-deep">INC-1001</TableCell>
                <TableCell className="font-semibold text-slate-900">Checkout Gateway HTTP 504 Timeouts</TableCell>
                <TableCell className="text-slate-700">Payment Service</TableCell>
                <TableCell><PriorityBadge priority="P1_CRITICAL" size="sm" /></TableCell>
                <TableCell><StatusBadge status="IN_PROGRESS" size="sm" /></TableCell>
                <TableCell><span className="text-rose-600 font-bold text-xs">due in 12m</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-bold text-brand-deep">INC-1002</TableCell>
                <TableCell className="font-semibold text-slate-900">VPN Gateway Authentication Failure</TableCell>
                <TableCell className="text-slate-700">Corporate Network</TableCell>
                <TableCell><PriorityBadge priority="P2_HIGH" size="sm" /></TableCell>
                <TableCell><StatusBadge status="ASSIGNED" size="sm" /></TableCell>
                <TableCell><span className="text-amber-600 font-semibold text-xs">due in 1h 45m</span></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono font-bold text-brand-deep">INC-1003</TableCell>
                <TableCell className="font-semibold text-slate-900">SSL Certificate Renewal on Auth Proxy</TableCell>
                <TableCell className="text-slate-700">SSO Provider</TableCell>
                <TableCell><PriorityBadge priority="P3_MEDIUM" size="sm" /></TableCell>
                <TableCell><StatusBadge status="RESOLVED" size="sm" /></TableCell>
                <TableCell><span className="text-emerald-600 font-semibold text-xs">Met on time</span></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* 8. Toasts, Empty State & Skeletons */}
        <section>
          <div className="border-b border-white/10 pb-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">8. Feedback & Loading States</h2>
            <p className="text-sm text-slate-300">Notification toasts, empty states, and loading shimmer placeholders.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toast Triggers Card */}
            <div className="glass-card-dark rounded-2xl p-6 shadow-float flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Notification Toasts</h3>
                <p className="text-sm text-slate-300 mt-0.5">Click to trigger reactive sliding notification toasts.</p>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <Button
                    variant="glass"
                    size="sm"
                    className="border-emerald-400/40 hover:bg-emerald-500/20 text-emerald-300 hover:text-white"
                    onClick={() => showToast({ type: 'success', title: 'Incident Resolved', message: 'Ticket #1001 marked as resolved.' })}
                  >
                    Success Toast
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="border-rose-400/40 hover:bg-rose-500/20 text-rose-300 hover:text-white"
                    onClick={() => showToast({ type: 'error', title: 'SLA Breach Warning', message: 'Ticket #1002 resolution exceeded 2 hours.' })}
                  >
                    Error Toast
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="border-amber-400/40 hover:bg-amber-500/20 text-amber-300 hover:text-white"
                    onClick={() => showToast({ type: 'warning', title: 'Workload Capacity', message: 'Technician Alice is at 4/5 active incidents.' })}
                  >
                    Warning Toast
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    className="border-sky-400/40 hover:bg-sky-500/20 text-sky-300 hover:text-white"
                    onClick={() => showToast({ type: 'info', title: 'Auto-Assignment', message: 'Incident assigned to Bob Jones via Round-Robin.' })}
                  >
                    Info Toast
                  </Button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300">
                Toasts auto-dismiss after 4 seconds or on manual close.
              </div>
            </div>

            {/* Skeleton Card */}
            <div className="glass-card-dark rounded-2xl p-6 shadow-float">
              <h3 className="text-lg font-bold text-white">Skeleton Shimmer</h3>
              <p className="text-sm text-slate-300 mt-0.5">Rendered during background data fetching.</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" theme="dark" className="w-10 h-10 bg-white/20" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton theme="dark" className="h-4 w-3/4 bg-white/20" />
                    <Skeleton theme="dark" className="h-3 w-1/2 bg-white/20" />
                  </div>
                </div>
                <Skeleton theme="dark" className="h-20 w-full bg-white/20" />
                <div className="flex gap-2">
                  <Skeleton theme="dark" className="h-8 w-24 bg-white/20" />
                  <Skeleton theme="dark" className="h-8 w-24 bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <EmptyState
              icon={<FileText className="w-6 h-6 stroke-[1.75] text-brand-pink" />}
              title="No Incidents Currently In Queue"
              description="All submitted incidents for this service have been investigated and closed by the IT team."
              action={
                <Link to="/">
                  <Button variant="primary" size="sm">Report New Incident</Button>
                </Link>
              }
              theme="dark"
              className="glass-card-dark border-white/20 text-white"
            />
          </div>
        </section>

        {/* Return to Platform Banner */}
        <section className="glass-card-dark rounded-2xl p-8 shadow-float text-center border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-brand-pink" />
              Return to Resolvo Operations Platform
            </h3>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Explore the full interactive system with live incident reporting, technician workbenches, SLA breach monitoring, and administrative governance.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/">
              <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Website
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Accessible Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Incident Reassignment Confirmation"
        description="Select a qualified technician to take over this incident."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                showToast({ type: 'success', title: 'Technician Assigned', message: 'Incident successfully assigned.' });
              }}
            >
              Confirm Assignment
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 mb-4">
          Assigning an incident changes the assignee and notifies both the technician and original reporter.
        </p>
        <Select
          label="Available Technicians"
          options={[
            { label: 'Alice Smith (Senior DB Engineer - 2 active)', value: '1' },
            { label: 'Bob Jones (Network Specialist - 1 active)', value: '2' },
            { label: 'Carol White (Security Expert - 0 active)', value: '3' },
          ]}
        />
      </Modal>
    </div>
  );
};
