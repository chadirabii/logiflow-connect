import { ManagerLayout } from '@/layouts/ManagerLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { bookingRequests } from '@/data/mockData';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ManagerOrdersPage() {
  const [search, setSearch] = useState('');

  const filtered = bookingRequests.filter(b =>
    b.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.company.toLowerCase().includes(search.toLowerCase()) ||
    b.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Consultation des commandes</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Trajet</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{b.referenceNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.originPort} → {b.destinationPort}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.shipmentMode}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{b.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerLayout>
  );
}
