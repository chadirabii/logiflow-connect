import { AdminLayout } from '@/layouts/AdminLayout';
import { useAllShipments, useUpdateShipment } from '@/hooks/useSupabaseData';
import { STATUS_LABELS, type BookingStatus } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Edit, MapPin } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const STATUSES: BookingStatus[] = ['confirmed', 'in_transit', 'arrived_port', 'customs', 'delivering', 'delivered'];

export default function AdminShipmentsPage() {
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', currentLocation: '', currentPort: '', estimatedArrival: '' });
  const { data: shipments = [] } = useAllShipments();
  const updateShipment = useUpdateShipment();

  const filtered = shipments.filter(s => !search || s.reference_number.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (id: string) => {
    const s = shipments.find(sh => sh.id === id);
    if (s) { setEditForm({ status: s.status, currentLocation: s.current_location || '', currentPort: s.current_port || '', estimatedArrival: s.estimated_arrival || '' }); setEditId(id); }
  };

  const saveEdit = async () => {
    if (!editId) return;
    await updateShipment.mutateAsync({ id: editId, status: editForm.status, current_location: editForm.currentLocation, current_port: editForm.currentPort, estimated_arrival: editForm.estimatedArrival });
    toast.success('Expédition mise à jour');
    setEditId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des expéditions</h1>
        <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" /></div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Navire</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Position</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ETA</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
              </tr></thead>
              <tbody>{filtered.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{s.reference_number}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.origin_port} → {s.destination_port}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.vessel || '—'}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent" /><span className="text-xs text-muted-foreground">{s.current_location}</span></div></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.estimated_arrival}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <Dialog open={editId === s.id} onOpenChange={open => !open && setEditId(null)}>
                      <DialogTrigger asChild><Button size="sm" variant="ghost" onClick={() => startEdit(s.id)}><Edit className="h-4 w-4" /></Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Modifier l'expédition {s.reference_number}</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div><Label>Statut</Label><Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(st => <SelectItem key={st} value={st}>{STATUS_LABELS[st]}</SelectItem>)}</SelectContent></Select></div>
                          <div><Label>Localisation actuelle</Label><Input value={editForm.currentLocation} onChange={e => setEditForm({ ...editForm, currentLocation: e.target.value })} className="mt-1.5" /></div>
                          <div><Label>Port actuel</Label><Input value={editForm.currentPort} onChange={e => setEditForm({ ...editForm, currentPort: e.target.value })} className="mt-1.5" /></div>
                          <div><Label>ETA</Label><Input type="date" value={editForm.estimatedArrival} onChange={e => setEditForm({ ...editForm, estimatedArrival: e.target.value })} className="mt-1.5" /></div>
                          <Button onClick={saveEdit} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Enregistrer</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
