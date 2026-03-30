import { useAuth } from '@/contexts/AuthContext';
import { documents as allDocs } from '@/data/mockData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { FileText, Download, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  invoice: 'Facture', packing_list: 'Packing List', customs: 'Douane', transport: 'Transport', contract: 'Contrat', other: 'Autre',
};

export default function ClientDocumentsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const myDocs = allDocs
    .filter(d => d.clientId === user?.id)
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Documents</h1>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Upload className="h-4 w-4 mr-2" /> Téléverser
          </Button>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un document..." className="pl-10" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Taille</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {myDocs.map(d => (
                <tr key={d.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /><span className="font-medium text-card-foreground">{d.name}</span></td>
                  <td className="px-4 py-3"><span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">{TYPE_LABELS[d.type]}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.createdAt}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {myDocs.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucun document.</div>}
        </div>
      </div>
    </ClientLayout>
  );
}
