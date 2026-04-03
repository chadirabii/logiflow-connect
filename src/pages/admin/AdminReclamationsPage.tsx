import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { reclamations, RECLAMATION_STATUS_LABELS, RECLAMATION_STATUS_COLORS, RECLAMATION_PRIORITY_LABELS, RECLAMATION_PRIORITY_COLORS, type Reclamation, type ReclamationStatus } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function AdminReclamationsPage() {
  const [filter, setFilter] = useState<ReclamationStatus | 'all'>('all');
  const [selected, setSelected] = useState<Reclamation | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<ReclamationStatus>('open');

  const filtered = filter === 'all' ? reclamations : reclamations.filter(r => r.status === filter);

  const handleUpdate = () => {
    if (selected) {
      const idx = reclamations.findIndex(r => r.id === selected.id);
      if (idx !== -1) {
        reclamations[idx] = { ...reclamations[idx], status: newStatus, adminResponse: response || reclamations[idx].adminResponse, updatedAt: new Date().toISOString().split('T')[0] };
        setSelected(null);
        setResponse('');
        toast.success('Réclamation mise à jour');
      }
    }
  };

  const openCount = reclamations.filter(r => r.status === 'open').length;
  const inProgressCount = reclamations.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reclamations.filter(r => r.status === 'resolved').length;
  const closedCount = reclamations.filter(r => r.status === 'closed').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des réclamations</h1>
          <p className="text-muted-foreground">Consultez et traitez les réclamations clients.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Ouvertes</p><p className="text-xl font-bold text-foreground">{openCount}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Clock className="h-5 w-5 text-accent" /></div>
            <div><p className="text-sm text-muted-foreground">En traitement</p><p className="text-xl font-bold text-foreground">{inProgressCount}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div><p className="text-sm text-muted-foreground">Résolues</p><p className="text-xl font-bold text-foreground">{resolvedCount}</p></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><XCircle className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-sm text-muted-foreground">Fermées</p><p className="text-xl font-bold text-foreground">{closedCount}</p></div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Label className="text-sm">Filtrer :</Label>
          <Select value={filter} onValueChange={v => setFilter(v as ReclamationStatus | 'all')}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="open">Ouvertes</SelectItem>
              <SelectItem value="in_progress">En traitement</SelectItem>
              <SelectItem value="resolved">Résolues</SelectItem>
              <SelectItem value="closed">Fermées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Sujet</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Réf. commande</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Priorité</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="p-3 text-foreground">{r.clientName}</td>
                  <td className="p-3 text-foreground">{r.subject}</td>
                  <td className="p-3 text-muted-foreground">{r.bookingRef || '—'}</td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', RECLAMATION_PRIORITY_COLORS[r.priority])}>
                      {RECLAMATION_PRIORITY_LABELS[r.priority]}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', RECLAMATION_STATUS_COLORS[r.status])}>
                      {RECLAMATION_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.createdAt}</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(r); setNewStatus(r.status); setResponse(r.adminResponse || ''); }}>
                      Traiter
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucune réclamation trouvée.</div>}
        </div>

        {/* Detail / respond dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Réclamation : {selected?.subject}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <p><span className="font-medium text-muted-foreground">Client :</span> {selected.clientName}</p>
                  {selected.bookingRef && <p><span className="font-medium text-muted-foreground">Commande :</span> {selected.bookingRef}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description du client</p>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{selected.description}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={newStatus} onValueChange={v => setNewStatus(v as ReclamationStatus)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouverte</SelectItem>
                      <SelectItem value="in_progress">En traitement</SelectItem>
                      <SelectItem value="resolved">Résolue</SelectItem>
                      <SelectItem value="closed">Fermée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Réponse admin</Label>
                  <Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Votre réponse au client..." className="mt-1.5 min-h-[100px]" />
                </div>
                <Button onClick={handleUpdate} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Mettre à jour</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
