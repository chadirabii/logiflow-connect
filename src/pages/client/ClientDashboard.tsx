import { useAuth } from '@/contexts/AuthContext';
import { bookingRequests, shipments, conversations } from '@/data/mockData';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { Ship, Package, Clock, MessageSquare, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/layouts/ClientLayout';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const myBookings = bookingRequests.filter(b => b.clientId === user?.id);
  const myShipments = shipments.filter(s => s.clientId === user?.id);
  const activeShipments = myShipments.filter(s => !['delivered', 'rejected'].includes(s.status));
  const pendingRequests = myBookings.filter(b => ['submitted', 'under_review'].includes(b.status));
  const delivered = myBookings.filter(b => b.status === 'delivered');
  const myConvos = conversations.filter(c => c.clientId === user?.id);
  const unread = myConvos.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Bonjour, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-muted-foreground">Voici un aperçu de votre activité logistique.</p>
          </div>
          <Button onClick={() => navigate('/client/booking')} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" /> Nouvelle réservation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Expéditions actives" value={activeShipments.length} icon={Ship} />
          <KPICard title="Demandes en attente" value={pendingRequests.length} icon={Clock} />
          <KPICard title="Commandes terminées" value={delivered.length} icon={Package} />
          <KPICard title="Messages non lus" value={unread} icon={MessageSquare} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-card-foreground">Commandes récentes</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/orders')} className="text-accent">Voir tout</Button>
            </div>
            <div className="space-y-3">
              {myBookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => navigate(`/client/orders/${b.id}`)}>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{b.referenceNumber}</p>
                    <p className="text-xs text-muted-foreground">{b.originPort} → {b.destinationPort}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
              {myBookings.length === 0 && <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>}
            </div>
          </div>

          {/* Active shipments */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-card-foreground">Expéditions en cours</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/client/tracking')} className="text-accent">Suivi</Button>
            </div>
            <div className="space-y-3">
              {activeShipments.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => navigate('/client/tracking')}>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{s.referenceNumber}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-accent" />
                      <p className="text-xs text-muted-foreground">{s.currentLocation}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
              {activeShipments.length === 0 && <p className="text-sm text-muted-foreground">Aucune expédition active.</p>}
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
