import { ManagerLayout } from '@/layouts/ManagerLayout';
import { reclamations, RECLAMATION_STATUS_LABELS, RECLAMATION_STATUS_COLORS, RECLAMATION_PRIORITY_LABELS, RECLAMATION_PRIORITY_COLORS } from '@/data/mockData';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { ReclamationStatus } from '@/data/mockData';

export default function ManagerReclamationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const filtered = filter === 'all' ? reclamations : reclamations.filter(r => r.status === filter);
  const selected = reclamations.find(r => r.id === selectedId);

  const handleRespond = () => {
    if (!selected || !response.trim()) return;
    selected.adminResponse = response;
    selected.status = 'in_progress';
    selected.updatedAt = new Date().toISOString().split('T')[0];
    toast.success('Réponse envoyée');
    setResponse('');
    setSelectedId(null);
  };

  const handleStatusChange = (id: string, newStatus: ReclamationStatus) => {
    const rec = reclamations.find(r => r.id === id);
    if (rec) {
      rec.status = newStatus;
      rec.updatedAt = new Date().toISOString().split('T')[0];
      toast.success('Statut mis à jour');
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des réclamations</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="open">Ouvertes</SelectItem>
              <SelectItem value="in_progress">En traitement</SelectItem>
              <SelectItem value="resolved">Résolues</SelectItem>
              <SelectItem value="closed">Fermées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filtered.map(r => (
              <div
                key={r.id}
                onClick={() => { setSelectedId(r.id); setResponse(r.adminResponse || ''); }}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedId === r.id ? 'border-accent bg-accent/5' : 'border-border bg-card hover:bg-muted/30'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{r.subject}</h4>
                    <p className="text-sm text-muted-foreground">{r.clientName} {r.bookingRef && `• ${r.bookingRef}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RECLAMATION_PRIORITY_COLORS[r.priority]}`}>
                      {RECLAMATION_PRIORITY_LABELS[r.priority]}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RECLAMATION_STATUS_COLORS[r.status]}`}>
                      {RECLAMATION_STATUS_LABELS[r.status]}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              </div>
            ))}
          </div>

          {selected && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading font-semibold text-foreground">{selected.subject}</h3>
              <p className="text-sm text-muted-foreground">{selected.description}</p>

              <div>
                <label className="text-sm font-medium text-foreground">Changer le statut</label>
                <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v as ReclamationStatus)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouverte</SelectItem>
                    <SelectItem value="in_progress">En traitement</SelectItem>
                    <SelectItem value="resolved">Résolue</SelectItem>
                    <SelectItem value="closed">Fermée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Réponse</label>
                <Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Votre réponse..." className="mt-1.5" rows={4} />
              </div>

              <Button onClick={handleRespond} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Envoyer la réponse</Button>
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
