import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { formatRelativeTime } from '../../lib/formatters';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Poll notifications every 15 seconds as specified in requirements
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 15000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-azure"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-pink text-brand-deep text-[10px] font-extrabold flex items-center justify-center shadow-pink animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-float border border-surface-border z-50 overflow-hidden text-content-dark animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-pink text-brand-deep">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="text-[11px] font-semibold text-brand-deep hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <span className="text-[10px] text-content-muted">Live 15s</span>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-surface-border/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-content-muted">
                  No notifications yet. You're completely up to date!
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 transition-colors flex items-start gap-3 ${
                      !item.read ? 'bg-brand-pink-soft/30 hover:bg-brand-pink-soft/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-content-dark">{item.title}</h4>
                        <span className="text-[10px] text-content-muted shrink-0">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-content-muted mt-1 leading-normal">{item.message}</p>
                    </div>

                    {!item.read && (
                      <button
                        onClick={() => markReadMutation.mutate(item.id)}
                        className="p-1 rounded-md text-brand-deep hover:bg-brand-deep/10 text-xs shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-surface-border text-center">
              <span className="text-[11px] font-semibold text-brand-deep hover:underline cursor-pointer flex items-center justify-center gap-1">
                <span>Multi-channel delivery enabled (In-App + Email)</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
