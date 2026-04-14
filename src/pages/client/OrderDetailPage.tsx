import { useParams, useNavigate } from 'react-router-dom';
import { useMyBookings, useMyShipments, useTrackingEvents, useMyDocuments } from '@/hooks/useSupabaseData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { TrackingTimeline } from '@/components/TrackingTimeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download, MapPin, Ship, Calendar } from 'lucide-react';
import { STATUS_LABELS } from '@/data/mockData';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: bookings = [] } = useMyBookings();
  const { data: shipments = [] } = useMyShipments();
  const booking = bookings.find(b => b.id === id);
  const shipment = booking ? shipments.find(s => s.booking_id === booking.id) : undefined;
  const { data: events = [] } = useTrackingEvents(shipment?.id);
  const { data: allDocs = [] } = useMyDocuments();
  const docs = allDocs.filter(d => d.booking_id === booking?.id);

  if (!booking) return <ClientLayout><p className="text-muted-foreground">Commande introuvable.</p></ClientLayout>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/client/orders')} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux commandes
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{booking.reference_number}</h1>
            <p className="text-muted-foreground">{booking.origin_port} → {booking.destination_port}</p>
          </div>
          <StatusBadge status={booking.status} className="text-sm px-4 py-1" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-heading font-semibold text-card-foreground">Détails de la réservation</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Société</span><p className="font-medium text-card-foreground">{booking.company}</p></div>
              <div><span className="text-muted-foreground">Marchandise</span><p className="font-medium text-card-foreground">{booking.cargo_type}</p></div>
              <div><span className="text-muted-foreground">Poids</span><p className="font-medium text-card-foreground">{booking.weight?.toLocaleString()} kg</p></div>
              <div><span className="text-muted-foreground">Volume</span><p className="font-medium text-card-foreground">{booking.volume} m³</p></div>
              <div><span className="text-muted-foreground">Conteneur</span><p className="font-medium text-card-foreground">{booking.container_type}</p></div>
              <div><span className="text-muted-foreground">Mode</span><p className="font-medium text-card-foreground">{booking.shipment_mode}</p></div>
              <div><span className="text-muted-foreground">Incoterm</span><p className="font-medium text-card-foreground">{booking.incoterm}</p></div>
              <div><span className="text-muted-foreground">Date souhaitée</span><p className="font-medium text-card-foreground">{booking.requested_date}</p></div>
            </div>
            {booking.special_instructions && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Instructions</span>
                <p className="text-sm font-medium text-card-foreground mt-1">{booking.special_instructions}</p>
              </div>
            )}
          </div>

          {shipment && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading font-semibold text-card-foreground">Informations d'expédition</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Ship className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Navire :</span><span className="font-medium text-card-foreground">{shipment.vessel}</span></div>
                <div className="flex items-center gap-2"><PackageIcon className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Conteneur :</span><span className="font-medium text-card-foreground">{shipment.container_number}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /><span className="text-muted-foreground">Position :</span><span className="font-medium text-card-foreground">{shipment.current_location}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /><span className="text-muted-foreground">ETA :</span><span className="font-medium text-card-foreground">{shipment.estimated_arrival}</span></div>
              </div>
            </div>
          )}
        </div>

        {events.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">Suivi de l'expédition</h3>
            <TrackingTimeline events={events.map(e => ({ ...e, shipmentId: e.shipment_id }))} />
          </div>
        )}

        {docs.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">Documents</h3>
            <div className="space-y-2">
              {docs.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.size} • {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

function PackageIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}
