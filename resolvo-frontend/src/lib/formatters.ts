export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function formatSlaCountdown(deadlineString?: string): { text: string; isOverdue: boolean } {
  if (!deadlineString) return { text: 'No SLA', isOverdue: false };
  const deadline = new Date(deadlineString);
  const now = new Date();
  const diffInMinutes = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));

  if (diffInMinutes < 0) {
    const overdue = Math.abs(diffInMinutes);
    if (overdue < 60) return { text: `overdue ${overdue}m`, isOverdue: true };
    return { text: `overdue ${Math.floor(overdue / 60)}h ${overdue % 60}m`, isOverdue: true };
  }

  if (diffInMinutes < 60) return { text: `due in ${diffInMinutes}m`, isOverdue: false };
  return { text: `due in ${Math.floor(diffInMinutes / 60)}h ${diffInMinutes % 60}m`, isOverdue: false };
}
