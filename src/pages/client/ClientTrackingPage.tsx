import { useAuth } from '@/contexts/AuthContext';
import { shipments, trackingEvents } from '@/data/mockData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import { MapPin, Ship, Calendar, Anchor } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ClientTrackingPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  
  const myShipments = shipments
    .filter(s => s.clientId === user?.id)
    .filter(s => !search || s.referenceNumber.toLowerCase().includes(search.toLowerCase()));

  const activeShipment = selected ? shipments.find(s => s.id === selected) : myShipments[0];
  const events = activeShipment ? trackingEvents.filter(e => e.shipmentId === activeShipment.id) : [];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Suivi des expéditions</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par référence..." />
            {myShipments.map(s => (
              <div
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${activeShipment?.id === s.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-card hover:border-accent/30'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-semibold text-sm text-card-foreground">{s.referenceNumber}</span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-xs text-muted-foreground">{s.originPort} → {s.destinationPort}</p>
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span className="text-xs text-muted-foreground">{s.currentLocation}</span>
                </div>
              </div>
            ))}
            {myShipments.length === 0 && <p className="text-sm text-muted-foreground">Aucune expédition.</p>}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 space-y-6">
            {activeShipment ? (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-heading font-bold text-card-foreground">{activeShipment.referenceNumber}</h2>
                    <StatusBadge status={activeShipment.status} className="text-sm px-4 py-1" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Ship className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Navire :</span><span className="font-medium text-card-foreground">{activeShipment.vessel || 'N/A'}</span></div>
                    <div className="flex items-center gap-2"><Anchor className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Port actuel :</span><span className="font-medium text-card-foreground">{activeShipment.currentPort}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Position :</span><span className="font-medium text-card-foreground">{activeShipment.currentLocation}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /><span className="text-muted-foreground">ETA :</span><span className="font-medium text-card-foreground">{activeShipment.estimatedArrival}</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-heading font-semibold text-card-foreground mb-4">Historique</h3>
                  <TrackingTimeline events={events} />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Ship className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Sélectionnez une expédition pour voir le suivi.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
