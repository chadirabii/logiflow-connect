import { AdminLayout } from '@/layouts/AdminLayout';
import { documents as allDocs, users } from '@/data/mockData';
import { FileText, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  invoice: 'Facture', packing_list: 'Packing List', customs: 'Douane', transport: 'Transport', contract: 'Contrat', other: 'Autre',
};

export default function AdminDocumentsPage() {
  const [search, setSearch] = useState('');
  const docs = allDocs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des documents</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Document</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Taille</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => {
                const client = users.find(u => u.id === d.clientId);
                return (
                  <tr key={d.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2"><FileText className="h-4 w-4 text-accent" /><span className="font-medium text-card-foreground">{d.name}</span></td>
                    <td className="px-4 py-3"><span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">{TYPE_LABELS[d.type]}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{client?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.size}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.createdAt}</td>
                    <td className="px-4 py-3"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
