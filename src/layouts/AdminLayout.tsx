import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, Ship, FileText, MessageSquare, Users, LogOut, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { conversations } from '@/data/mockData';

const adminNav = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin' },
  { label: 'Demandes', icon: Package, path: '/admin/requests' },
  { label: 'Expéditions', icon: Ship, path: '/admin/shipments' },
  { label: 'Clients', icon: Users, path: '/admin/clients' },
  { label: 'Documents', icon: FileText, path: '/admin/documents' },
  { label: 'Messagerie', icon: MessageSquare, path: '/admin/chat' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className={cn(
        'flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <Ship className="h-7 w-7 text-sidebar-primary flex-shrink-0" />
          {!collapsed && (
            <div>
              <span className="font-heading font-bold text-lg">24/7 Logistics</span>
              <span className="block text-xs text-sidebar-foreground/60">Admin Panel</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {adminNav.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative',
                  isActive ? 'bg-sidebar-accent text-sidebar-primary font-medium' : 'hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {item.path === '/admin/chat' && totalUnread > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-sidebar-border">
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5" /><span>Réduire</span></>}
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 w-full">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-foreground">
            {adminNav.find(n => n.path === location.pathname)?.label || 'Administration'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Admin</span>
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
              A
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
