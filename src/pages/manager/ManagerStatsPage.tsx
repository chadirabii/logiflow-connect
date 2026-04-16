import { ManagerLayout } from '@/layouts/ManagerLayout';
import { KPICard } from '@/components/KPICard';
import { useStore } from '@/contexts/StoreContext';
import { Package, Ship, AlertTriangle, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function ManagerStatsPage() {
  const { bookingRequests, shipments, reclamations, users } = useStore();
  const clients = users.filter(u => u.role === 'client');
  const activeShipments = shipments.filter(s => !['delivered', 'rejected'].includes(s.status));
  const deliveredOrders = bookingRequests.filter(b => b.status === 'delivered');
  const inTransit = bookingRequests.filter(b => b.status === 'in_transit');
  const pendingRequests = bookingRequests.filter(b => ['submitted', 'under_review'].includes(b.status));
  const openReclamations = reclamations.filter(r => ['open', 'in_progress'].includes(r.status));

  const statusBreakdown = [
    { label: 'Soumises', count: bookingRequests.filter(b => b.status === 'submitted').length, color: 'bg-muted' },
    { label: 'En validation', count: bookingRequests.filter(b => b.status === 'under_review').length, color: 'bg-warning/20' },
    { label: 'Approuvées', count: bookingRequests.filter(b => b.status === 'approved').length, color: 'bg-info/20' },
    { label: 'Confirmées', count: bookingRequests.filter(b => b.status === 'confirmed').length, color: 'bg-accent/20' },
    { label: 'En transit', count: inTransit.length, color: 'bg-accent/20' },
    { label: 'Livrées', count: deliveredOrders.length, color: 'bg-success/20' },
    { label: 'Refusées', count: bookingRequests.filter(b => b.status === 'rejected').length, color: 'bg-destructive/20' },
  ];

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Statistiques</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard title="Total commandes" value={bookingRequests.length} icon={Package} />
          <KPICard title="Expéditions actives" value={activeShipments.length} icon={Ship} />
          <KPICard title="En attente" value={pendingRequests.length} icon={TrendingUp} />
          <KPICard title="Livrées" value={deliveredOrders.length} icon={CheckCircle} />
          <KPICard title="Clients" value={clients.length} icon={Users} />
          <KPICard title="Réclamations ouvertes" value={openReclamations.length} icon={AlertTriangle} />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-heading font-semibold text-card-foreground mb-4">Répartition par statut</h3>
          <div className="space-y-3">
            {statusBreakdown.map(item => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-28">{item.label}</span>
                <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color} flex items-center justify-end pr-2`} style={{ width: `${Math.max((item.count / Math.max(bookingRequests.length, 1)) * 100, 8)}%` }}>
                    <span className="text-xs font-medium text-foreground">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
