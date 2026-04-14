import { ManagerLayout } from '@/layouts/ManagerLayout';
import { useAllBookings, useCreateBooking } from '@/hooks/useSupabaseData';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { PORTS, CONTAINER_TYPES, INCOTERMS } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function ManagerLegacyOrdersPage() {
  const { data: allBookings = [] } = useAllBookings();
  const createBooking = useCreateBooking();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', company: '', email: '', phone: '', originCountry: '', originPort: '', destinationCountry: '', destinationPort: '', cargoType: '', weight: '', volume: '', containerType: '', shipmentMode: 'FCL' as const, incoterm: '', requestedDate: '', specialInstructions: '', status: 'delivered' as const });

  const legacyOrders = allBookings.filter(b => b.reference_number.startsWith('LEGACY-'));

  const handleAddOrder = async () => {
    if (!formData.fullName || !formData.company || !formData.originPort || !formData.destinationPort) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      await createBooking.mutateAsync({
        client_id: '00000000-0000-0000-0000-000000000000', // placeholder for legacy
        reference_number: `LEGACY-${Date.now()}`,
        full_name: formData.fullName, company: formData.company, email: formData.email, phone: formData.phone,
        origin_country: formData.originCountry, origin_port: formData.originPort,
        destination_country: formData.destinationCountry, destination_port: formData.destinationPort,
        cargo_type: formData.cargoType || 'Non spécifié', weight: parseInt(formData.weight) || 0, volume: parseInt(formData.volume) || 0,
        container_type: formData.containerType, shipment_mode: formData.shipmentMode, incoterm: formData.incoterm,
        requested_date: formData.requestedDate || null, special_instructions: formData.specialInstructions,
        status: formData.status as any,
      });
      toast.success('Commande historique ajoutée');
      setOpen(false);
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Commandes Historiques</h1><p className="text-muted-foreground">Gérez les commandes des anciens clients.</p></div><Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" />Ajouter</Button></div>
        <div className="rounded-xl border border-border bg-card p-6">
          {legacyOrders.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune commande historique.</p> : (
            <div className="space-y-3">{legacyOrders.map(order => (<div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"><div className="flex-1"><p className="text-sm font-medium text-card-foreground">{order.reference_number}</p><p className="text-xs text-muted-foreground">{order.company} — {order.full_name}</p><p className="text-xs text-muted-foreground">{order.origin_port} → {order.destination_port}</p></div><StatusBadge status={order.status} /></div>))}</div>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Ajouter une commande historique</DialogTitle><DialogDescription>Enregistrez une commande d'un ancien client.</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50"><h3 className="font-semibold text-sm">Client</h3><Input placeholder="Nom complet *" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} /><Input placeholder="Entreprise *" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} /></div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50"><h3 className="font-semibold text-sm">Origine</h3><Select value={formData.originPort} onValueChange={v => setFormData({ ...formData, originPort: v })}><SelectTrigger><SelectValue placeholder="Port d'origine *" /></SelectTrigger><SelectContent>{PORTS.map(p => <SelectItem key={p.id} value={p.name}>{p.name} ({p.country})</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50"><h3 className="font-semibold text-sm">Destination</h3><Select value={formData.destinationPort} onValueChange={v => setFormData({ ...formData, destinationPort: v })}><SelectTrigger><SelectValue placeholder="Port de destination *" /></SelectTrigger><SelectContent>{PORTS.map(p => <SelectItem key={p.id} value={p.name}>{p.name} ({p.country})</SelectItem>)}</SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button onClick={handleAddOrder} className="bg-accent text-accent-foreground hover:bg-accent/90">Ajouter</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ManagerLayout>
  );
}
