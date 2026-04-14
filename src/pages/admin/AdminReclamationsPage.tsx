import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useAllReclamations, useUpdateReclamation } from '@/hooks/useSupabaseData';
import { RECLAMATION_STATUS_LABELS, RECLAMATION_STATUS_COLORS, RECLAMATION_PRIORITY_LABELS, RECLAMATION_PRIORITY_COLORS } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function AdminReclamationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('open');
  const { data: reclamations = [] } = useAllReclamations();
  const updateReclamation = useUpdateReclamation();

  const filtered = filter === 'all' ? reclamations : reclamations.filter(r => r.status === filter);

  const handleUpdate = async () => {
    if (!selected) return;
    await updateReclamation.mutateAsync({ id: selected.id, status: newStatus, admin_response: response || undefined });
    setSelected(null); setResponse('');
    toast.success('Réclamation mise à jour');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-heading font-bold text-foreground">Gestion des réclamations</h1><p className="text-muted-foreground">Consultez et traitez les réclamations clients.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">Ouvertes</p><p className="text-xl font-bold text-foreground">{reclamations.filter(r => r.status === 'open').length}</p></div></div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center"><Clock className="h-5 w-5 text-accent" /></div><div><p className="text-sm text-muted-foreground">En traitement</p><p className="text-xl font-bold text-foreground">{reclamations.filter(r => r.status === 'in_progress').length}</p></div></div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div><div><p className="text-sm text-muted-foreground">Résolues</p><p className="text-xl font-bold text-foreground">{reclamations.filter(r => r.status === 'resolved').length}</p></div></div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><XCircle className="h-5 w-5 text-muted-foreground" /></div><div><p className="text-sm text-muted-foreground">Fermées</p><p className="text-xl font-bold text-foreground">{reclamations.filter(r => r.status === 'closed').length}</p></div></div>
        </div>
        <div className="flex items-center gap-2"><Label className="text-sm">Filtrer :</Label><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Toutes</SelectItem><SelectItem value="open">Ouvertes</SelectItem><SelectItem value="in_progress">En traitement</SelectItem><SelectItem value="resolved">Résolues</SelectItem><SelectItem value="closed">Fermées</SelectItem></SelectContent></Select></div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-3 font-medium text-muted-foreground">Sujet</th><th className="text-left p-3 font-medium text-muted-foreground">Réf. commande</th><th className="text-left p-3 font-medium text-muted-foreground">Priorité</th><th className="text-left p-3 font-medium text-muted-foreground">Statut</th><th className="text-left p-3 font-medium text-muted-foreground">Date</th><th className="text-left p-3 font-medium text-muted-foreground">Actions</th></tr></thead>
          <tbody className="divide-y divide-border">{filtered.map(r => (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="p-3 text-foreground">{r.subject}</td>
              <td className="p-3 text-muted-foreground">{r.booking_ref || '—'}</td>
              <td className="p-3"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', RECLAMATION_PRIORITY_COLORS[r.priority as keyof typeof RECLAMATION_PRIORITY_COLORS])}>{RECLAMATION_PRIORITY_LABELS[r.priority as keyof typeof RECLAMATION_PRIORITY_LABELS]}</span></td>
              <td className="p-3"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', RECLAMATION_STATUS_COLORS[r.status as keyof typeof RECLAMATION_STATUS_COLORS])}>{RECLAMATION_STATUS_LABELS[r.status as keyof typeof RECLAMATION_STATUS_LABELS]}</span></td>
              <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
              <td className="p-3"><Button size="sm" variant="outline" onClick={() => { setSelected(r); setNewStatus(r.status); setResponse(r.admin_response || ''); }}>Traiter</Button></td>
            </tr>
          ))}</tbody></table>
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucune réclamation trouvée.</div>}
        </div>
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Réclamation : {selected?.subject}</DialogTitle></DialogHeader>
            {selected && (<div className="space-y-4">
              <div><p className="text-sm font-medium text-muted-foreground mb-1">Description du client</p><p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{selected.description}</p></div>
              <div><Label>Statut</Label><Select value={newStatus} onValueChange={setNewStatus}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Ouverte</SelectItem><SelectItem value="in_progress">En traitement</SelectItem><SelectItem value="resolved">Résolue</SelectItem><SelectItem value="closed">Fermée</SelectItem></SelectContent></Select></div>
              <div><Label>Réponse admin</Label><Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Votre réponse au client..." className="mt-1.5 min-h-[100px]" /></div>
              <Button onClick={handleUpdate} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Mettre à jour</Button>
            </div>)}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
