import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ClientProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', company: user?.company || '', phone: user?.phone || '',
    rne: user?.rne || '', patente: user?.patente || '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Enregistrer</Button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
