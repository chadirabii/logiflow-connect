import { AdminLayout } from '@/layouts/AdminLayout';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { bookingRequests, shipments, users, conversations, messages } from '@/data/mockData';
import { Package, Ship, Users, Clock, MessageSquare, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const clients = users.filter(u => u.role === 'client');
  const activeShipments = shipments.filter(s => !['delivered', 'rejected'].includes(s.status));
  const pendingRequests = bookingRequests.filter(b => ['submitted', 'under_review'].includes(b.status));
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const recentActivity = [...bookingRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground">Vue d'ensemble de l'activité logistique.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Total demandes" value={bookingRequests.length} icon={Package} />
          <KPICard title="Expéditions actives" value={activeShipments.length} icon={Ship} />
          <KPICard title="En attente" value={pendingRequests.length} icon={Clock} />
          <KPICard title="Clients" value={clients.length} icon={Users} />
          <KPICard title="Messages non lus" value={totalUnread} icon={MessageSquare} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent requests */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-card-foreground">Activité récente</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/requests')} className="text-accent">Voir tout</Button>
            </div>
            <div className="space-y-3">
              {recentActivity.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => navigate('/admin/requests')}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-card-foreground">{b.referenceNumber}</p>
                      <span className="text-xs text-muted-foreground">• {b.company}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{b.originPort} → {b.destinationPort}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions + messages */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-card-foreground mb-4">Accès rapide</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/requests')}>
                  <Package className="h-4 w-4 mr-2" /> Gérer les demandes
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/shipments')}>
                  <Ship className="h-4 w-4 mr-2" /> Gérer les expéditions
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/clients')}>
                  <Users className="h-4 w-4 mr-2" /> Voir les clients
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/chat')}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Messagerie
                  {totalUnread > 0 && <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalUnread}</span>}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold text-card-foreground mb-4">Derniers messages</h3>
              <div className="space-y-3">
                {conversations.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/chat')}>
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                      {c.clientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{c.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && <span className="bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{c.unreadCount}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
