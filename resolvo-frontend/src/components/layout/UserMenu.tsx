import React, { useState } from 'react';
import { useAuth } from '../../auth';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely logged out of your session.',
    });
    navigate('/login');
  };

  const roleBadgeStyle = {
    EMPLOYEE: 'bg-brand-pink text-brand-deep font-bold',
    TECHNICIAN: 'bg-brand-cyan text-brand-deep font-bold',
    ADMIN: 'bg-emerald-400 text-brand-deep font-bold',
  }[user.role];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-azure"
        aria-label="User account menu"
      >
        <div className="w-8 h-8 rounded-full bg-brand-pink text-brand-deep font-bold text-xs flex items-center justify-center shadow-pink">
          {initials}
        </div>
        <div className="hidden sm:block text-left text-xs">
          <div className="font-bold text-white truncate max-w-[120px]">{user.fullName}</div>
          <div className="text-[10px] text-slate-300 capitalize">{user.role.toLowerCase()}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-float border border-surface-border z-50 overflow-hidden text-content-dark p-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 border-b border-surface-border/70 mb-1">
              <div className="font-bold text-sm text-content-dark">{user.fullName}</div>
              <div className="text-xs text-content-muted mt-0.5">{user.email}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleBadgeStyle}`}>
                  {user.role}
                </span>
                {user.department && (
                  <span className="text-[10px] text-content-muted">Dept: {user.department}</span>
                )}
                {user.specialization && (
                  <span className="text-[10px] text-content-muted">Spec: {user.specialization}</span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-status-danger hover:bg-rose-50 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Session</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
