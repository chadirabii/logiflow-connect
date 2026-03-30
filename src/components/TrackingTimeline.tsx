import { TrackingEvent, STATUS_LABELS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, MapPin } from 'lucide-react';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="relative space-y-0">
      {sorted.map((event, index) => {
        const isLast = index === sorted.length - 1;
        const date = new Date(event.timestamp);
        return (
          <div key={event.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[15px] top-[30px] h-full w-0.5 bg-border" />
            )}
            {/* Dot */}
            <div className="relative z-10 flex-shrink-0">
              {isLast ? (
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent">
                  <MapPin className="h-4 w-4 text-accent-foreground" />
                </div>
              ) : (
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-foreground">{STATUS_LABELS[event.status]}</span>
                {event.port && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{event.port}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-muted-foreground">{event.location}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
