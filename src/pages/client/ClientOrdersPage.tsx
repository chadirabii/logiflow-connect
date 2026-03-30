import { useAuth } from '@/contexts/AuthContext';
import { bookingRequests } from '@/data/mockData';
import { ClientLayout } from '@/layouts/ClientLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const myBookings = bookingRequests
    .filter(b => b.clientId === user?.id)
    .filter(b => !search || b.referenceNumber.toLowerCase().includes(search.toLowerCase()) || b.cargoType.toLowerCase().includes(search.toLowerCase()));

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Mes commandes</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Référence</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Origine</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Destination</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Marchandise</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map(b => (
                  <tr key={b.id} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/client/orders/${b.id}`)}>
                    <td className="px-4 py-3 font-medium text-card-foreground">{b.referenceNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.originPort}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.destinationPort}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.cargoType}</td>
                    <td className="px-4 py-3"><span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">{b.shipmentMode}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{b.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {myBookings.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Aucune commande trouvée.</div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
