import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge, PriorityBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import type { Priority } from '../../types/incident';
import {
  Layers,
  FolderTree,
  ShieldAlert,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  Server,
} from 'lucide-react';

// Form Schemas
const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  businessCriticality: z.enum([
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
    'MISSION_CRITICAL',
    'BUSINESS_OPERATIONAL',
    'ADMINISTRATIVE_SUPPORT',
  ]),
});
type ServiceFormInput = z.infer<typeof serviceSchema>;

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  keywords: z.string().min(2, 'Provide comma-separated keywords for classification'),
});
type CategoryFormInput = z.infer<typeof categorySchema>;

const slaSchema = z.object({
  priority: z.enum(['P1', 'P2', 'P3', 'P4', 'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW']),
  serviceId: z.number().optional(),
  responseTargetMinutes: z.number().min(1, 'Target response time must be > 0 minutes'),
  resolutionTargetMinutes: z.number().min(1, 'Target resolution time must be > 0 minutes'),
});
type SlaFormInput = z.infer<typeof slaSchema>;

export const AdminServicesPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'CATEGORIES' | 'SLA'>('SERVICES');

  // Modals
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSlaModalOpen, setIsSlaModalOpen] = useState(false);

  // Queries
  const {
    data: services,
    isLoading: isServicesLoading,
    refetch: refetchServices,
  } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => adminApi.listServices(),
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.listCategories(),
  });

  const {
    data: slaPolicies,
    isLoading: isSlaLoading,
    refetch: refetchSla,
  } = useQuery({
    queryKey: ['admin-sla-policies'],
    queryFn: () => adminApi.listSlaPolicies(),
  });

  // Service Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: ServiceFormInput) => adminApi.createService(data),
    onSuccess: (created) => {
      showToast({ title: 'IT Service Created', message: `${created.name} is now live in catalog.`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-services'] });
      setIsServiceModalOpen(false);
      resetService();
    },
    onError: (err: Error) => {
      showToast({ title: 'Creation Failed', message: err.message, type: 'error' });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteService(id),
    onSuccess: () => {
      showToast({ title: 'Service Removed', message: 'IT Service has been deleted.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-services'] });
    },
    onError: (err: Error) => {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    },
  });

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormInput) => adminApi.createCategory(data),
    onSuccess: (created) => {
      showToast({ title: 'Category Created', message: `${created.name} added to ITIL classifier.`, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      setIsCategoryModalOpen(false);
      resetCategory();
    },
    onError: (err: Error) => {
      showToast({ title: 'Creation Failed', message: err.message, type: 'error' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCategory(id),
    onSuccess: () => {
      showToast({ title: 'Category Removed', message: 'Category has been deleted.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
    },
    onError: (err: Error) => {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    },
  });

  // SLA Mutations
  const createSlaMutation = useMutation({
    mutationFn: (data: SlaFormInput) => {
      const normalizedPriority = data.priority.startsWith('P1') ? 'P1'
        : data.priority.startsWith('P2') ? 'P2'
        : data.priority.startsWith('P3') ? 'P3'
        : 'P4';
      return adminApi.createSlaPolicy({
        priority: normalizedPriority,
        serviceId: data.serviceId || undefined,
        responseTargetMinutes: data.responseTargetMinutes,
        resolutionTargetMinutes: data.resolutionTargetMinutes,
      });
    },
    onSuccess: () => {
      showToast({ title: 'SLA Policy Configured', message: 'SLA targets successfully updated.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-sla-policies'] });
      setIsSlaModalOpen(false);
      resetSla();
    },
    onError: (err: Error) => {
      showToast({ title: 'Configuration Failed', message: err.message, type: 'error' });
    },
  });

  const deleteSlaMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteSlaPolicy(id),
    onSuccess: () => {
      showToast({ title: 'Policy Removed', message: 'SLA policy deleted.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-sla-policies'] });
    },
    onError: (err: Error) => {
      showToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    },
  });

  // Forms
  const {
    register: registerService,
    handleSubmit: handleServiceSubmit,
    reset: resetService,
    formState: { errors: serviceErrors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      businessCriticality: 'HIGH',
    },
  });

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
  });

  const {
    register: registerSla,
    handleSubmit: handleSlaSubmit,
    reset: resetSla,
    formState: { errors: slaErrors },
  } = useForm<SlaFormInput>({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      priority: 'P3',
      responseTargetMinutes: 60,
      resolutionTargetMinutes: 480,
    },
  });

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
  };

  const getCriticalityBadge = (crit: string) => {
    switch (crit?.toUpperCase()) {
      case 'CRITICAL':
      case 'MISSION_CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'HIGH':
      case 'BUSINESS_OPERATIONAL':
        return <Badge variant="warning">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="info">Medium</Badge>;
      case 'LOW':
      case 'ADMINISTRATIVE_SUPPORT':
      default:
        return <Badge variant="default">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-pink" />
            Service Catalogs & SLA Policies
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Configure IT infrastructure services, incident classification tags, and binding service-level agreements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SERVICES' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsServiceModalOpen(true)}
            >
              Add IT Service
            </Button>
          )}
          {activeTab === 'CATEGORIES' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCategoryModalOpen(true)}
            >
              Add Category
            </Button>
          )}
          {activeTab === 'SLA' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsSlaModalOpen(true)}
            >
              New SLA Policy
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'SERVICES'
              ? 'bg-pink text-royal-900 font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Server className="w-4 h-4" />
          IT Services ({services?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'CATEGORIES'
              ? 'bg-pink text-royal-900 font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Incident Categories ({categories?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('SLA')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === 'SLA'
              ? 'bg-pink text-royal-900 font-semibold'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          SLA Policies ({slaPolicies?.length ?? 0})
        </button>
      </div>

      {/* TAB 1: IT Services */}
      {activeTab === 'SERVICES' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-royal-900">Registered IT Services</h2>
              <p className="text-xs text-royal-600">
                Core enterprise systems, platforms, and network assets monitored under ITIL.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetchServices()}
            >
              Refresh
            </Button>
          </div>

          {isServicesLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !services || services.length === 0 ? (
            <EmptyState
              title="No IT Services Found"
              description="Start by registering your enterprise IT services."
              icon={<Server className="w-12 h-12 text-royal-400" />}
              action={
                <Button variant="primary" size="sm" onClick={() => setIsServiceModalOpen(true)}>
                  Create First Service
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-royal-100 text-xs font-semibold text-royal-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Criticality</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-50 text-sm">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-royal-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-royal-600">#{svc.id}</td>
                      <td className="py-3 px-4 font-semibold text-royal-900">{svc.name}</td>
                      <td className="py-3 px-4 text-royal-600 text-xs max-w-md truncate">
                        {svc.description}
                      </td>
                      <td className="py-3 px-4">{getCriticalityBadge(svc.businessCriticality)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />}
                          onClick={() => {
                            if (window.confirm(`Delete IT Service "${svc.name}"?`)) {
                              deleteServiceMutation.mutate(svc.id);
                            }
                          }}
                          aria-label={`Delete ${svc.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: Incident Categories */}
      {activeTab === 'CATEGORIES' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-royal-900">Incident Categories & Keywords</h2>
              <p className="text-xs text-royal-600">
                Rule-based tags powering real-time classification and duplicate matching.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetchCategories()}
            >
              Refresh
            </Button>
          </div>

          {isCategoriesLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !categories || categories.length === 0 ? (
            <EmptyState
              title="No Categories Configured"
              description="Define categories to empower automated ticket classification."
              icon={<FolderTree className="w-12 h-12 text-royal-400" />}
              action={
                <Button variant="primary" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
                  Create Category
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-royal-100 text-xs font-semibold text-royal-500 uppercase tracking-wider">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Keywords</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-50 text-sm">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-royal-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-royal-600">#{cat.id}</td>
                      <td className="py-3 px-4 font-semibold text-royal-900">{cat.name}</td>
                      <td className="py-3 px-4 text-royal-600 text-xs max-w-sm truncate">
                        {cat.description}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {cat.keywords
                            ? cat.keywords.split(',').map((kw, i) => (
                                <span
                                  key={i}
                                  className="inline-block bg-royal-100/70 text-royal-800 text-[11px] font-mono px-2 py-0.5 rounded"
                                >
                                  {kw.trim()}
                                </span>
                              ))
                            : <span className="text-royal-400 italic text-xs">No keywords</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />}
                          onClick={() => {
                            if (window.confirm(`Delete Category "${cat.name}"?`)) {
                              deleteCategoryMutation.mutate(cat.id);
                            }
                          }}
                          aria-label={`Delete ${cat.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: SLA Policies */}
      {activeTab === 'SLA' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-royal-900">Configured SLA Policies</h2>
              <p className="text-xs text-royal-600">
                Guaranteed target response and resolution windows across incident priorities.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => refetchSla()}
            >
              Refresh
            </Button>
          </div>

          {isSlaLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !slaPolicies || slaPolicies.length === 0 ? (
            <EmptyState
              title="No SLA Policies Configured"
              description="Define SLA threshold targets to track response and resolution breaches."
              icon={<ShieldAlert className="w-12 h-12 text-royal-400" />}
              action={
                <Button variant="primary" size="sm" onClick={() => setIsSlaModalOpen(true)}>
                  Create SLA Policy
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-royal-100 text-xs font-semibold text-royal-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Priority Level</th>
                    <th className="py-3 px-4">Scope</th>
                    <th className="py-3 px-4">Target Response</th>
                    <th className="py-3 px-4">Target Resolution</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-50 text-sm">
                  {slaPolicies.map((sla) => (
                    <tr key={sla.id} className="hover:bg-royal-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <PriorityBadge priority={sla.priority as Priority} />
                      </td>
                      <td className="py-3 px-4 font-medium text-royal-900">
                        {sla.global || !sla.serviceName ? (
                          <span className="inline-flex items-center gap-1.5 text-royal-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Global (All Services)
                          </span>
                        ) : (
                          <span className="text-royal-900 font-semibold">{sla.serviceName}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-royal-700 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-royal-500" />
                          {formatMinutes(sla.responseTargetMinutes)} ({sla.responseTargetMinutes} mins)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-royal-700 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-pink" />
                          {formatMinutes(sla.resolutionTargetMinutes)} ({sla.resolutionTargetMinutes} mins)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />}
                          onClick={() => {
                            if (window.confirm(`Delete SLA Policy for ${sla.priority}?`)) {
                              deleteSlaMutation.mutate(sla.id);
                            }
                          }}
                          aria-label={`Delete SLA Policy ${sla.id}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* MODAL 1: Create IT Service */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title="Register New IT Service"
      >
        <form onSubmit={handleServiceSubmit((d) => createServiceMutation.mutate(d))} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Service Name
            </label>
            <Input
              placeholder="e.g. ERP Cloud, VPN Gateway, Email Exchange"
              {...registerService('name')}
              error={serviceErrors.name?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-royal-200 bg-white p-3 text-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500 min-h-[90px]"
              placeholder="Provide a clear description of the business service and systems encompassed..."
              {...registerService('description')}
            />
            {serviceErrors.description && (
              <p className="mt-1 text-xs text-rose-500">{serviceErrors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Business Criticality
            </label>
            <select
              className="w-full rounded-lg border border-royal-200 bg-white p-2.5 text-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
              {...registerService('businessCriticality')}
            >
              <option value="CRITICAL">Critical (Mission-critical core systems)</option>
              <option value="HIGH">High (Key enterprise services)</option>
              <option value="MEDIUM">Medium (Departmental support systems)</option>
              <option value="LOW">Low (Internal non-essential tools)</option>
            </select>
            {serviceErrors.businessCriticality && (
              <p className="mt-1 text-xs text-rose-500">{serviceErrors.businessCriticality.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-royal-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsServiceModalOpen(false)}
              disabled={createServiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createServiceMutation.isPending}
            >
              Create Service
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Create Category */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Incident Category"
      >
        <form onSubmit={handleCategorySubmit((d) => createCategoryMutation.mutate(d))} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Category Name
            </label>
            <Input
              placeholder="e.g. Identity & Access, Database Failure, Network Outage"
              {...registerCategory('name')}
              error={categoryErrors.name?.message}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-royal-200 bg-white p-3 text-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500 min-h-[90px]"
              placeholder="Describe what kind of failures and tickets fall under this category..."
              {...registerCategory('description')}
            />
            {categoryErrors.description && (
              <p className="mt-1 text-xs text-rose-500">{categoryErrors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Auto-Classification Keywords (Comma-Separated)
            </label>
            <Input
              placeholder="e.g. vpn, login, password, 2fa, sso, lock, authenticate"
              {...registerCategory('keywords')}
              error={categoryErrors.keywords?.message}
            />
            <p className="mt-1 text-xs text-royal-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink" />
              Incoming incident descriptions matching these keywords are automatically categorized.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-royal-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={createCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createCategoryMutation.isPending}
            >
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Configure SLA Policy */}
      <Modal
        isOpen={isSlaModalOpen}
        onClose={() => setIsSlaModalOpen(false)}
        title="Configure SLA Policy"
      >
        <form onSubmit={handleSlaSubmit((d) => createSlaMutation.mutate(d))} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Incident Priority Level
            </label>
            <select
              className="w-full rounded-lg border border-royal-200 bg-white p-2.5 text-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
              {...registerSla('priority')}
            >
              <option value="P1">P1 - Critical Outage</option>
              <option value="P2">P2 - High Degradation</option>
              <option value="P3">P3 - Medium Impact</option>
              <option value="P4">P4 - Low / Minor</option>
            </select>
            {slaErrors.priority && (
              <p className="mt-1 text-xs text-rose-500">{slaErrors.priority.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
              Applies To IT Service (Optional)
            </label>
            <select
              className="w-full rounded-lg border border-royal-200 bg-white p-2.5 text-sm text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
              {...registerSla('serviceId', { valueAsNumber: true })}
            >
              <option value="">Global (All Services Default)</option>
              {services?.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
                Response Target (Minutes)
              </label>
              <Input
                type="number"
                placeholder="60"
                {...registerSla('responseTargetMinutes', { valueAsNumber: true })}
                error={slaErrors.responseTargetMinutes?.message}
              />
              <span className="text-[11px] text-royal-500">e.g. 15 for P1, 60 for P3</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-royal-800 uppercase tracking-wider mb-1">
                Resolution Target (Minutes)
              </label>
              <Input
                type="number"
                placeholder="480"
                {...registerSla('resolutionTargetMinutes', { valueAsNumber: true })}
                error={slaErrors.resolutionTargetMinutes?.message}
              />
              <span className="text-[11px] text-royal-500">e.g. 240 for 4 hours</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-royal-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSlaModalOpen(false)}
              disabled={createSlaMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createSlaMutation.isPending}
            >
              Save Policy
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
