import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export default function ClientProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', company: user?.company || '', phone: user?.phone || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Profil mis à jour');
  };

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Mon profil</h1>
        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Nom complet</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Société</Label><Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1.5" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Document RNE</Label><div className="mt-1.5 flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground truncate">{user?.rneFile || 'Non fourni'}</span></div></div>
              <div><Label>Document Patente</Label><div className="mt-1.5 flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground truncate">{user?.patenteFile || 'Non fourni'}</span></div></div>
            </div>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Enregistrer</Button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
