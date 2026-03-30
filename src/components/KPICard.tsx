import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
  iconClassName?: string;
}

export function KPICard({ title, value, icon: Icon, trend, className, iconClassName }: KPICardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold font-heading text-card-foreground">{value}</p>
          {trend && <p className="mt-1 text-xs text-success">{trend}</p>}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10', iconClassName)}>
          <Icon className="h-6 w-6 text-accent" />
        </div>
      </div>
    </div>
  );
}
