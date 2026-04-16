import { AdminLayout } from '@/layouts/AdminLayout';
import { users, bookingRequests, shipments } from '@/data/mockData';
import { Search, Mail, Phone, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AdminClientsPage() {
  const [search, setSearch] = useState('');
  const clients = users
    .filter(u => u.role === 'client')
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || (u.company || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Gestion des clients</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un client..." className="pl-10" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => {
            const orders = bookingRequests.filter(b => b.clientId === c.id).length;
            const activeShips = shipments.filter(s => s.clientId === c.id && !['delivered'].includes(s.status)).length;
            return (
              <div key={c.id} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
                    {c.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">{c.fullName}</p>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{c.email}</div>
                  {c.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{c.phone}</div>}
                </div>
                <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-card-foreground">{orders}</p>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-accent">{activeShips}</p>
                    <p className="text-xs text-muted-foreground">En cours</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
