import { BookingStatus, STATUS_LABELS, STATUS_COLORS } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      STATUS_COLORS[status],
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
