import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../hooks/useToast';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Role, RegisterRequest } from '../../types/auth';
import {
  Users,
  UserPlus,
  Wrench,
  Search,
  RefreshCw,
  Mail,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'TECHNICIANS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form state for registration modal
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<Role>('EMPLOYEE');
  const [newDepartment, setNewDepartment] = useState('Operations');
  const [newSpecialization, setNewSpecialization] = useState('DATABASE');
  const [newMaxWorkload, setNewMaxWorkload] = useState(5);

  // Load All Users
  const { data: users = [], isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers(),
    staleTime: 10000,
  });

  // Load Technicians
  const { data: technicians = [], isLoading: isTechLoading, refetch: refetchTechs } = useQuery({
    queryKey: ['admin-technicians'],
    queryFn: () => adminApi.listTechnicians(),
    staleTime: 10000,
  });

  // Mutation: Register New User
  const registerMutation = useMutation({
    mutationFn: (request: RegisterRequest) => authApi.register(request),
    onSuccess: (created) => {
      showToast({
        type: 'success',
        title: 'User Registered Successfully',
        message: `Account created for ${created.fullName} (${created.role}).`,
      });
      setShowRegisterModal(false);
      setNewFullName('');
      setNewUsername('');
      setNewEmail('');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-technicians'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showToast({ type: 'error', title: 'Error', message: msg });
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newUsername || !newEmail || !newPassword) {
      showToast({ type: 'error', title: 'Validation', message: 'All required fields must be completed' });
      return;
    }

    registerMutation.mutate({
      fullName: newFullName,
      username: newUsername,
      email: newEmail,
      password: newPassword,
      role: newRole,
      department: newRole === 'EMPLOYEE' ? newDepartment : undefined,
      specialization: newRole === 'TECHNICIAN' ? newSpecialization : undefined,
      skills: newRole === 'TECHNICIAN' ? [newSpecialization] : undefined,
      maxWorkload: newRole === 'TECHNICIAN' ? Number(newMaxWorkload) : undefined,
    });
  };

  const displayedList = activeTab === 'ALL' ? users : technicians;
  const filteredList = displayedList.filter((u) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.department?.toLowerCase().includes(query) ?? false) ||
      (u.specialization?.toLowerCase().includes(query) ?? false)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-pink mb-1">
            <Link to="/admin" className="hover:underline text-brand-pink">Operations Center</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/70">Identity & Team Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Users & Technical Personnel
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Manage enterprise personnel, role authorizations, technician domain specializations, and queue limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              refetchUsers();
              refetchTechs();
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowRegisterModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
            className="font-bold shadow-pink"
          >
            Add New Member
          </Button>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-white text-brand-deep shadow-xs'
                : 'text-content-muted hover:text-content-dark'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Enterprise Users ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TECHNICIANS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'TECHNICIANS'
                ? 'bg-white text-brand-deep shadow-xs'
                : 'text-content-muted hover:text-content-dark'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-brand-pink-deep" />
            Support Engineers ({technicians.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search name, username, domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Directory Table */}
      <Card className="overflow-hidden">
        {isUsersLoading || isTechLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-surface-border last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-content-muted">
            No personnel match your search term.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-surface-border text-xs font-semibold uppercase tracking-wider text-content-muted">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Specialization</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Workload Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredList.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Identity */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-deep text-white font-bold flex items-center justify-center shrink-0 text-xs">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-content-dark">{member.fullName}</p>
                          <p className="text-[11px] text-content-muted font-mono">@{member.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {member.role === 'ADMIN' ? (
                        <Badge variant="primary" size="sm" dot>
                          Administrator
                        </Badge>
                      ) : member.role === 'TECHNICIAN' ? (
                        <Badge variant="pink" size="sm" dot>
                          Technician
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm" dot>
                          Employee
                        </Badge>
                      )}
                    </td>

                    {/* Department or Specialization */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-content-dark">
                      {member.role === 'TECHNICIAN' ? (
                        <div>
                          <span className="font-bold text-brand-deep">{member.specialization || 'GENERAL'}</span>
                          <span className="text-[11px] text-content-muted block">
                            Level: {member.experienceLevel || 'INTERMEDIATE'}
                          </span>
                        </div>
                      ) : (
                        <span>{member.department || 'Enterprise Ops'}</span>
                      )}
                    </td>

                    {/* Email / Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-content-muted">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.email}</span>
                      </div>
                    </td>

                    {/* Workload Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {member.role === 'TECHNICIAN' ? (
                        (() => {
                          const active = member.activeIncidentCount ?? member.activeIncidentsCount ?? 0;
                          const max = member.maxWorkload || 5;
                          const util = Math.min(100, Math.round((active / max) * 100));
                          const isFull = active >= max;

                          return (
                            <div className="space-y-1.5 min-w-[150px]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xs text-content-dark">
                                  {active} / {max} active
                                </span>
                                {!member.available ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    Off-Duty
                                  </span>
                                ) : isFull ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    Full ({util}%)
                                  </span>
                                ) : active > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                    Active ({util}%)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Available
                                  </span>
                                )}
                              </div>
                              {/* Visual Workload progress bar */}
                              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isFull
                                      ? 'bg-rose-500'
                                      : util >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${util}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-content-muted text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Register New User */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register New Enterprise Member"
      >
        <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="e.g. Robert Smith"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              required
            />
            <Input
              label="Username"
              placeholder="e.g. tech_robert"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Corporate Email"
              type="email"
              placeholder="robert@enterprise.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Initial Password"
              type="password"
              placeholder="************"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Operational Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              options={[
                { label: 'Employee (Reporting & Verification)', value: 'EMPLOYEE' },
                { label: 'Technician (Investigation & Resolution)', value: 'TECHNICIAN' },
                { label: 'Administrator (Governance & Configuration)', value: 'ADMIN' },
              ]}
              required
            />

            {newRole === 'EMPLOYEE' ? (
              <Input
                label="Department"
                placeholder="Finance, Marketing, HR..."
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
            ) : newRole === 'TECHNICIAN' ? (
              <Select
                label="Domain Specialization"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                options={[
                  { label: 'Database & Storage', value: 'DATABASE' },
                  { label: 'Networks & Connectivity', value: 'NETWORK' },
                  { label: 'Cloud Infrastructure', value: 'CLOUD' },
                  { label: 'Security & Access Control', value: 'SECURITY' },
                  { label: 'Software & Applications', value: 'SOFTWARE' },
                ]}
              />
            ) : null}
          </div>

          {newRole === 'TECHNICIAN' && (
            <Input
              label="Maximum Active Workload Limit"
              type="number"
              min={1}
              max={20}
              value={newMaxWorkload}
              onChange={(e) => setNewMaxWorkload(Number(e.target.value))}
              helperText="Maximum concurrent tickets assigned by strategy routing"
            />
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button variant="secondary" size="sm" type="button" onClick={() => setShowRegisterModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={registerMutation.isPending}
              className="font-bold shadow-pink"
            >
              Register Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
