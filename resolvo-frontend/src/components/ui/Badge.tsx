import React from 'react';
import { cn } from '../../lib/utils';

export type PriorityType = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
export type IncidentStatusType =
  | 'NEW'
  | 'CLASSIFIED'
  | 'REPORTED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_USER'
  | 'ON_HOLD'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED'
  | 'CANCELLED';
export type SlaStatusType = 'WITHIN_SLA' | 'APPROACHING' | 'VIOLATED';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'pink'
    | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide shrink-0 transition-colors';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-2',
  }[size];

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-blue-100 text-blue-900 border border-blue-300 font-semibold',
    pink: 'bg-pink-100 text-pink-900 border border-pink-300 font-semibold',
    success: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold',
    warning: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
    danger: 'bg-rose-100 text-rose-900 border border-rose-300 font-semibold',
    info: 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold',
    outline: 'bg-transparent text-content-dark border border-surface-border',
  }[variant];

  const dotColorStyles = {
    default: 'bg-slate-500',
    primary: 'bg-blue-600',
    pink: 'bg-pink-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-600',
    info: 'bg-sky-600',
    outline: 'bg-slate-400',
  }[variant];

  return (
    <span className={cn(baseStyles, sizeStyles, variantStyles, className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColorStyles)} />}
      <span>{children}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityType | string; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'md',
}) => {
  const normalized = priority.toUpperCase();
  switch (normalized) {
    case 'P1_CRITICAL':
    case 'P1':
    case 'CRITICAL':
      return <Badge variant="danger" size={size} dot>P1 Critical</Badge>;
    case 'P2_HIGH':
    case 'P2':
    case 'HIGH':
      return <Badge variant="warning" size={size} dot>P2 High</Badge>;
    case 'P3_MEDIUM':
    case 'P3':
    case 'MEDIUM':
      return <Badge variant="info" size={size} dot>P3 Medium</Badge>;
    case 'P4_LOW':
    case 'P4':
    case 'LOW':
    default:
      return <Badge variant="default" size={size} dot>P4 Low</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: IncidentStatusType | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'NEW':
      return <Badge variant="info" size={size} dot>New</Badge>;
    case 'CLASSIFIED':
      return <Badge variant="info" size={size} dot>Classified</Badge>;
    case 'REPORTED':
      return <Badge variant="info" size={size} dot>Reported</Badge>;
    case 'ASSIGNED':
      return <Badge variant="primary" size={size} dot>Assigned</Badge>;
    case 'ACKNOWLEDGED':
      return <Badge variant="primary" size={size} dot>Acknowledged</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="pink" size={size} dot>In Progress</Badge>;
    case 'WAITING_FOR_USER':
      return <Badge variant="warning" size={size} dot>Awaiting Info</Badge>;
    case 'ON_HOLD':
      return <Badge variant="warning" size={size} dot>On Hold</Badge>;
    case 'RESOLVED':
      return <Badge variant="success" size={size} dot>Resolved</Badge>;
    case 'VERIFIED':
      return <Badge variant="success" size={size} dot>Verified</Badge>;
    case 'CLOSED':
      return <Badge variant="default" size={size} dot>Closed</Badge>;
    case 'REOPENED':
      return <Badge variant="danger" size={size} dot>Reopened</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger" size={size} dot>Cancelled</Badge>;
    default:
      return <Badge variant="default" size={size}>{status}</Badge>;
  }
};

export const SlaBadge: React.FC<{ status: SlaStatusType | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'WITHIN_SLA':
    case 'MET':
      return <Badge variant="success" size={size} dot>Within SLA</Badge>;
    case 'APPROACHING':
    case 'AT_RISK':
      return <Badge variant="warning" size={size} dot>Approaching SLA</Badge>;
    case 'VIOLATED':
    case 'BREACHED':
      return <Badge variant="danger" size={size} dot>SLA Violated</Badge>;
    default:
      return <Badge variant="default" size={size}>{status}</Badge>;
  }
};

export type EscalationLevelType = 'NONE' | 'TECHNICIAN' | 'TEAM_LEAD' | 'SYSTEM_ADMINISTRATOR' | 'IT_MANAGER';

export const EscalationBadge: React.FC<{ level?: EscalationLevelType | string | null; size?: 'sm' | 'md' }> = ({
  level,
  size = 'md',
}) => {
  if (!level || level === 'NONE') return null;
  const normalized = level.toUpperCase();
  switch (normalized) {
    case 'TECHNICIAN':
      return <Badge variant="info" size={size} dot>Tier 1: Technician</Badge>;
    case 'TEAM_LEAD':
      return <Badge variant="warning" size={size} dot>Tier 2: Team Lead</Badge>;
    case 'SYSTEM_ADMINISTRATOR':
      return <Badge variant="primary" size={size} dot>Tier 3: SysAdmin</Badge>;
    case 'IT_MANAGER':
      return <Badge variant="danger" size={size} dot>Tier 4: IT Manager</Badge>;
    default:
      return <Badge variant="default" size={size} dot>{level}</Badge>;
  }
};
