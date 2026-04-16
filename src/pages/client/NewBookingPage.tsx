import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/layouts/ClientLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingRequests, PORTS, CONTAINER_TYPES, INCOTERMS } from '@/data/mockData';
import { toast } from 'sonner';

export default function NewBookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.fullName || '', company: user?.company || '', email: user?.email || '', phone: user?.phone || '',
    originPort: '', destinationPort: '', cargoType: '', weight: '', volume: '',
    containerType: '', shipmentMode: '' as 'FCL' | 'LCL' | '', incoterm: '',
    requestedDate: '', specialInstructions: '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refNum = `BK-2024-${String(bookingRequests.length + 1).padStart(4, '0')}`;
    const originPort = PORTS.find(p => p.id === form.originPort);
    const destPort = PORTS.find(p => p.id === form.destinationPort);
    bookingRequests.push({
      id: `b${Date.now()}`,
      clientId: user!.id,
      referenceNumber: refNum,
      fullName: form.fullName,
      company: form.company,
      email: form.email,
      phone: form.phone,
      originCountry: originPort?.country || '',
      originPort: originPort?.name || '',
      destinationCountry: destPort?.country || '',
      destinationPort: destPort?.name || '',
      cargoType: form.cargoType,
      weight: Number(form.weight),
      volume: Number(form.volume),
      containerType: form.containerType,
      shipmentMode: form.shipmentMode as 'FCL' | 'LCL',
      incoterm: form.incoterm,
      requestedDate: form.requestedDate,
      specialInstructions: form.specialInstructions,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    toast.success(`Réservation ${refNum} créée avec succès !`);
    navigate('/client/orders');
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Nouvelle réservation</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading font-semibold text-card-foreground mb-4">Informations de contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Nom complet</Label><Input value={form.fullName} onChange={e => update('fullName', e.target.value)} className="mt-1.5" required /></div>
              <div><Label>Société</Label><Input value={form.company} onChange={e => update('company', e.target.value)} className="mt-1.5" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="mt-1.5" required /></div>
              <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1.5" /></div>
            </div>
          </section>

          {/* Route */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading font-semibold text-card-foreground mb-4">Itinéraire</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Port d'origine</Label>
                <Select value={form.originPort} onValueChange={v => update('originPort', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{PORTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.country})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Port de destination</Label>
                <Select value={form.destinationPort} onValueChange={v => update('destinationPort', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{PORTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.country})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Cargo */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-heading font-semibold text-card-foreground mb-4">Détails de la marchandise</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Type de marchandise</Label><Input value={form.cargoType} onChange={e => update('cargoType', e.target.value)} placeholder="Ex: Textiles, Électronique..." className="mt-1.5" required /></div>
              <div><Label>Poids (kg)</Label><Input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="12000" className="mt-1.5" required /></div>
              <div><Label>Volume (m³)</Label><Input type="number" value={form.volume} onChange={e => update('volume', e.target.value)} placeholder="65" className="mt-1.5" required /></div>
              <div>
                <Label>Type de conteneur</Label>
                <Select value={form.containerType} onValueChange={v => update('containerType', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{CONTAINER_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mode d'expédition</Label>
                <Select value={form.shipmentMode} onValueChange={v => update('shipmentMode', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCL">FCL - Conteneur complet</SelectItem>
                    <SelectItem value="LCL">LCL - Groupage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Incoterm</Label>
                <Select value={form.incoterm} onValueChange={v => update('incoterm', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{INCOTERMS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date souhaitée d'expédition</Label><Input type="date" value={form.requestedDate} onChange={e => update('requestedDate', e.target.value)} className="mt-1.5" required /></div>
            </div>
            <div className="mt-4">
              <Label>Instructions spéciales</Label>
              <Textarea value={form.specialInstructions} onChange={e => update('specialInstructions', e.target.value)} placeholder="Remarques, précautions..." className="mt-1.5" rows={3} />
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/client')}>Annuler</Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Soumettre la réservation</Button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
}
