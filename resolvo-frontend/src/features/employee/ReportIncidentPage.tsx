import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog.api';
import { incidentsApi } from '../../api/incidents.api';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { PriorityBadge } from '../../components/ui/Badge';
import { formatRelativeTime } from '../../lib/formatters';
import type { Impact, Urgency, IncidentResponse, CategoryResponse, FileAttachment } from '../../types/incident';
import { AttachmentInput } from '../../components/common/AttachmentInput';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  Clock,
  UserCheck,
  Zap,
} from 'lucide-react';

const reportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(10, 'Please provide at least 10 characters describing the issue'),
  serviceId: z.coerce.number().min(1, 'Please select an affected IT service'),
  categoryId: z.coerce.number().optional(),
  impact: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  urgency: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  affectedUserCount: z.coerce.number().min(1, 'Must affect at least 1 user'),
});

type ReportFormInput = z.input<typeof reportSchema>;
type ReportFormOutput = z.output<typeof reportSchema>;

export const ReportIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<CategoryResponse | null>(null);
  const [createdIncident, setCreatedIncident] = useState<IncidentResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);

  // Load Services and Categories from Catalog API
  const { data: services = [] } = useQuery({
    queryKey: ['catalog-services'],
    queryFn: () => catalogApi.getServices(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  // Query existing incidents to perform real-time client-side duplicate detection
  const { data: existingIncidents = [] } = useQuery({
    queryKey: ['employee-existing-incidents'],
    queryFn: () => incidentsApi.getIncidents({ size: 100 }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormInput, unknown, ReportFormOutput>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      serviceId: 1,
      impact: 'MEDIUM',
      urgency: 'MEDIUM',
      affectedUserCount: 1,
    },
  });

  const title = watch('title');
  const description = watch('description');
  const selectedServiceId = watch('serviceId');
  const selectedImpact: Impact = watch('impact');
  const selectedUrgency: Urgency = watch('urgency');

  // Real-time Category Auto-Suggestion heuristic as user types
  useEffect(() => {
    const combinedText = `${title || ''} ${description || ''}`.trim();
    if (combinedText.length > 8) {
      const timer = setTimeout(async () => {
        const suggestion = await catalogApi.suggestCategory(combinedText);
        setSuggestedCategory(suggestion);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestedCategory(null);
    }
  }, [title, description]);

  // Real-time Duplicate Incident Detection: Jaccard Token Similarity
  const duplicateAlert = useMemo(() => {
    const text = `${title || ''} ${description || ''}`.toLowerCase().trim();
    if (text.length < 10 || !selectedServiceId) return null;

    const tokens = new Set(
      text
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2 && !['the', 'and', 'with', 'for', 'this', 'that', 'not'].includes(t))
    );

    if (tokens.size === 0) return null;

    for (const other of existingIncidents) {
      const otherText = `${other.title}`.toLowerCase();
      const otherTokens = new Set(
        otherText
          .split(/[^a-z0-9]+/)
          .filter((t) => t.length > 2 && !['the', 'and', 'with', 'for', 'this', 'that', 'not'].includes(t))
      );

      const intersection = new Set([...tokens].filter((x) => otherTokens.has(x)));
      const union = new Set([...tokens, ...otherTokens]);
      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      if (similarity >= 0.35) {
        return {
          incidentId: other.id,
          title: other.title,
          similarity: Math.round(similarity * 100),
          status: other.status,
        };
      }
    }
    return null;
  }, [title, description, selectedServiceId, existingIncidents]);

  // Dynamic Priority Preview Calculation
  const estimatedPriority = useMemo(() => {
    const selectedService = services.find((s) => s.id === Number(selectedServiceId));
    const crit = selectedService?.businessCriticality || 'HIGH';

    const impactWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[selectedImpact] || 2;
    const urgencyWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[selectedUrgency] || 2;
    const critWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, MISSION_CRITICAL: 4 }[crit] || 3;

    const score = impactWeight * 2 + urgencyWeight * 2 + critWeight * 3;

    if (score >= 24) return { level: 'P1_CRITICAL', label: 'P1 Critical', text: 'Immediate incident response team dispatched.' };
    if (score >= 18) return { level: 'P2_HIGH', label: 'P2 High', text: 'High-priority resolution with 2-hour SLA window.' };
    if (score >= 12) return { level: 'P3_MEDIUM', label: 'P3 Medium', text: 'Normal queue assignment with 4-hour SLA window.' };
    return { level: 'P4_LOW', label: 'P4 Low', text: 'Low-impact issue scheduled for next available slot.' };
  }, [services, selectedServiceId, selectedImpact, selectedUrgency]);

  const onSubmit = async (data: ReportFormOutput) => {
    setIsSubmitting(true);
    try {
      const created = await incidentsApi.createIncident({
        title: data.title,
        description: data.description,
        serviceId: Number(data.serviceId),
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        impact: data.impact,
        urgency: data.urgency,
        affectedUserCount: Number(data.affectedUserCount),
        attachmentName: attachment?.name,
        attachmentType: attachment?.type,
        attachmentData: attachment?.data,
      });

      setCreatedIncident(created);
      setShowSuccessModal(true);

      // Invalidate query caches so employee dashboard and history update immediately
      queryClient.invalidateQueries({ queryKey: ['employee-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['employee-existing-incidents'] });

      showToast({
        type: 'success',
        title: 'Incident Reported Successfully',
        message: `Assigned reference INC-${created.id} with priority ${created.priority}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit incident report. Please verify inputs.';
      showToast({
        type: 'error',
        title: 'Submission Error',
        message: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
            <Link to="/employee" className="hover:underline text-brand-pink">Employee Portal</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70">New Ticket</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Report IT Service Incident
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Submit a disruption report. Our automated routing system will evaluate business impact and dispatch an on-duty technician.
          </p>
        </div>

        <Link to="/employee">
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Real-time Duplicate Warning Alert */}
        {duplicateAlert && (
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3 animate-fade-in shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm flex-1">
              <strong className="font-bold text-amber-950">
                Potential Duplicate Disruption Detected ({duplicateAlert.similarity}% match)
              </strong>
              <p className="mt-0.5 text-amber-900">
                A similar ticket (<strong className="font-mono">INC-{duplicateAlert.incidentId}</strong>: "{duplicateAlert.title}") is currently {duplicateAlert.status}. If this is part of the same incident, your ticket will be automatically linked for correlation.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Core Incident Details */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
            <Zap className="w-5 h-5 text-brand-deep" />
            <h2 className="text-base font-bold text-content-dark">
              1. Incident Details & Scope
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Incident Title / Summary"
              placeholder="e.g. Production PostgreSQL database query timeouts on auth cluster"
              {...register('title')}
              error={errors.title?.message}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-content-dark mb-1.5">
                Detailed Description <span className="text-status-danger">*</span>
              </label>
              <textarea
                rows={4}
                className="block w-full rounded-xl border border-surface-border bg-white px-3.5 py-2.5 text-sm text-content-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent transition-colors"
                placeholder="Describe what happened, any error messages displayed, and steps to reproduce..."
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-status-danger font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Smart Category Auto-Suggest Badge */}
            {suggestedCategory && (
              <div className="p-3 rounded-xl bg-brand-pink-soft/40 border border-brand-pink-deep/30 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-pink-deep" />
                  <span className="text-xs text-content-dark">
                    Intelligent Classification Rule Match: <strong className="text-brand-deep">{suggestedCategory.name}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('categoryId', suggestedCategory.id, { shouldValidate: true })}
                  className="px-2.5 py-1 text-xs font-bold bg-white text-brand-deep rounded-lg border border-brand-pink shadow-xs hover:bg-brand-pink hover:text-white transition-all cursor-pointer"
                >
                  Apply Suggestion
                </button>
              </div>
            )}

            {/* Evidence & Screenshot Attachment Dropzone */}
            <div className="pt-2">
              <AttachmentInput
                attachment={attachment}
                onChange={setAttachment}
                variant="dropzone"
                label="Attach Screenshot or Diagnostic Log (Optional)"
                hint="Capture an error message or drag & drop a screenshot (PNG, JPG, WebP, PDF) up to 10MB. Or paste (Ctrl+V) directly from your clipboard."
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Affected Service & Category */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
            <Info className="w-5 h-5 text-brand-azure" />
            <h2 className="text-base font-bold text-content-dark">
              2. Affected Service & Categorization
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Affected IT Service"
              {...register('serviceId')}
              options={services.map((s) => ({
                label: `${s.name} (${s.businessCriticality})`,
                value: s.id,
              }))}
              error={errors.serviceId?.message}
              required
            />

            <Select
              label="Incident Category"
              {...register('categoryId')}
              options={[
                { label: 'Auto-classify using Intelligent Heuristics', value: '' },
                ...categories.map((c) => ({
                  label: c.name,
                  value: c.id,
                })),
              ]}
              helperText="Optional: If omitted, AI will classify automatically from keywords"
            />
          </div>
        </Card>

        {/* Section 3: Impact, Urgency & Priority Preview */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-content-dark">
                3. Business Impact & Urgency Evaluation
              </h2>
            </div>

            {/* Live Priority Prediction Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-content-muted font-medium">Estimated Priority:</span>
              <PriorityBadge priority={estimatedPriority.level} size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Organizational Impact"
              {...register('impact')}
              options={[
                { label: 'Critical - Entire organization halted', value: 'CRITICAL' },
                { label: 'High - Core business unit stopped', value: 'HIGH' },
                { label: 'Medium - Multiple users degraded', value: 'MEDIUM' },
                { label: 'Low - Isolated single user disruption', value: 'LOW' },
              ]}
              required
            />

            <Select
              label="Business Urgency"
              {...register('urgency')}
              options={[
                { label: 'Critical - Zero workaround available', value: 'CRITICAL' },
                { label: 'High - Significant operational barrier', value: 'HIGH' },
                { label: 'Medium - Degraded but viable workaround', value: 'MEDIUM' },
                { label: 'Low - Inconvenience or scheduled task', value: 'LOW' },
              ]}
              required
            />

            <Input
              label="Estimated Affected Users"
              type="number"
              min={1}
              placeholder="1"
              {...register('affectedUserCount')}
              error={errors.affectedUserCount?.message}
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-content-muted flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-content-dark">Matrix Heuristic Calculation:</p>
              <p className="mt-0.5">{estimatedPriority.text}</p>
            </div>
          </div>
        </Card>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link to="/employee" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            ← Return to Dashboard
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold shadow-pink"
          >
            Submit Incident Report
          </Button>
        </div>
      </form>

      {/* Confirmation Success Modal */}
      {createdIncident && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate(`/employee/incidents/${createdIncident.id}`);
          }}
          title="Incident Dispatched Successfully"
        >
          <div className="space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center">
              <span className="font-mono text-xs font-bold text-brand-deep px-3 py-1 rounded-full bg-brand-azure/10">
                INC-{createdIncident.id}
              </span>
              <h3 className="text-lg font-extrabold text-content-dark mt-2">
                {createdIncident.title}
              </h3>
              <p className="text-xs text-content-muted mt-1">
                Your incident has been recorded and injected into the automated SLA resolution queue.
              </p>
            </div>

            {/* Incident Specification Recap */}
            <div className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Calculated Priority:</span>
                <PriorityBadge priority={createdIncident.priority} size="sm" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-content-muted">Affected IT Service:</span>
                <strong className="text-content-dark">{createdIncident.service?.name}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-content-muted">Assigned Category:</span>
                <strong className="text-content-dark">{createdIncident.category?.name}</strong>
              </div>

              {createdIncident.assignedTechnician ? (
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-content-muted flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-brand-deep" />
                    Assigned Technician:
                  </span>
                  <span className="font-bold text-brand-deep">
                    {createdIncident.assignedTechnician.fullName} ({createdIncident.assignedTechnician.experienceLevel})
                  </span>
                </div>
              ) : null}

              {createdIncident.slaTracking && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-content-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Resolution SLA Deadline:
                  </span>
                  <span className="font-mono font-semibold text-content-dark">
                    {formatRelativeTime(createdIncident.slaTracking.resolutionDeadline)}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.reload();
                }}
                className="flex-1"
              >
                Report Another
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/employee/incidents/${createdIncident.id}`);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="flex-1 font-bold shadow-pink"
              >
                Go to Ticket Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
