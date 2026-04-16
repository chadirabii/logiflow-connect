import { AdminLayout } from '@/layouts/AdminLayout';
import { useStore } from '@/contexts/StoreContext';
import { STATUS_LABELS, type BookingStatus } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminRequestsPage() {
  const { bookingRequests, updateBooking } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = bookingRequests
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => !search || b.referenceNumber.toLowerCase().includes(search.toLowerCase()) || b.company.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = (id: string, status: BookingStatus) => {
    const booking = bookingRequests.find(b => b.id === id);
    if (booking) {
      updateBooking(id, { status, updatedAt: new Date().toISOString().split('T')[0] });
      toast.success(`Demande ${booking.referenceNumber} → ${STATUS_LABELS[status]}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des demandes</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Marchandise</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th><th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground">{b.referenceNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.company}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{b.originPort} → {b.destinationPort}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.cargoType}</td>
                    <td className="px-4 py-3"><span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">{b.shipmentMode}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.status === 'submitted' && <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'under_review')} className="text-warning h-7 px-2">Examiner</Button>}
                        {b.status === 'under_review' && (<><Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'approved')} className="text-success h-7 px-2"><Check className="h-3 w-3 mr-1" />Approuver</Button><Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'rejected')} className="text-destructive h-7 px-2"><X className="h-3 w-3 mr-1" />Refuser</Button></>)}
                        {b.status === 'approved' && <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'confirmed')} className="text-accent h-7 px-2">Confirmer</Button>}
                        {b.status === 'confirmed' && <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, 'in_transit')} className="text-accent h-7 px-2">Expédier</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucune demande trouvée.</div>}
        </div>
      </div>
    </AdminLayout>
  );
}
