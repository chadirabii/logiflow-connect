import { useState } from 'react';
import { Bell, MessageSquare, Package, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/contexts/StoreContext';
import type { Notification } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const getNotificationIcon = (iconType?: string) => {
  switch (iconType) {
    case 'message': return <MessageSquare className="h-4 w-4" />;
    case 'package': return <Package className="h-4 w-4" />;
    case 'alert': return <AlertCircle className="h-4 w-4" />;
    case 'check': return <CheckCircle className="h-4 w-4" />;
    case 'info': return <Info className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'message': return 'bg-blue-100 text-blue-600';
    case 'success': return 'bg-green-100 text-green-600';
    case 'status_update': return 'bg-purple-100 text-purple-600';
    case 'alert': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'message': return 'Message';
    case 'success': return 'Succès';
    case 'status_update': return 'Mise à jour';
    case 'alert': return 'Alerte';
    case 'info': return 'Info';
    default: return 'Notification';
  }
};

export function NotificationPanel() {
  const { user } = useAuth();
  const { notifications } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const userNotifications = notifications.filter((n) => n.userId === user?.id);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) { navigate(notification.actionUrl); setOpen(false); }
  };

  const recentNotifications = userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 bg-popover border border-border rounded-lg shadow-lg">
        <div className="flex flex-col h-screen max-h-[600px]">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
            <div><h3 className="font-semibold text-sm">Notifications</h3>{unreadCount > 0 && <p className="text-xs text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}</div>
            {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount}</Badge>}
          </div>
          {recentNotifications.length > 0 ? (
            <ScrollArea className="flex-1">
              <div className="space-y-0">
                {recentNotifications.map((notification, index) => (
                  <button key={notification.id} onClick={() => handleNotificationClick(notification)} className={cn('w-full text-left p-3 border-b border-border/50 transition-colors hover:bg-accent/50 group', index === recentNotifications.length - 1 && 'border-b-0', !notification.read && 'bg-accent/25')}>
                    <div className="flex gap-3">
                      <div className={cn('mt-1 p-2 rounded-lg flex-shrink-0 flex items-center justify-center', getNotificationColor(notification.type))}>{getNotificationIcon(notification.icon)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between"><h4 className="text-sm font-medium text-foreground pr-2">{notification.title}</h4>{!notification.read && <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0 mt-1.5" />}</div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                        <div className="flex items-center justify-between mt-2"><span className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</span><Badge variant="outline" className="text-xs font-normal ml-2">{getTypeLabel(notification.type)}</Badge></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8"><Bell className="h-12 w-12 text-muted-foreground/30 mb-3" /><p className="text-sm font-medium text-muted-foreground">Aucune notification</p><p className="text-xs text-muted-foreground/70 mt-1">Revenez ici pour les dernières mises à jour</p></div>
          )}
          {recentNotifications.length > 0 && <div className="border-t border-border p-3 bg-muted/30"><Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => setOpen(false)}>Fermer</Button></div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
