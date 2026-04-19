import { AdminLayout } from "@/layouts/AdminLayout";
import { useStore } from "@/contexts/StoreContext";
import {
  type BookingRequest,
  PORTS,
  CONTAINER_TYPES,
  INCOTERMS,
  STATUS_LABELS,
} from "@/data/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export default function AdminLegacyOrdersPage() {
  const { bookingRequests, addBooking, deleteBooking } = useStore();
  const legacyOrders = bookingRequests.filter((b) =>
    b.referenceNumber.startsWith("LEGACY-"),
  );
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    originCountry: "",
    originPort: "",
    destinationCountry: "",
    destinationPort: "",
    cargoType: "",
    weight: "",
    volume: "",
    containerType: "",
    shipmentMode: "FCL" as const,
    incoterm: "",
    requestedDate: "",
    specialInstructions: "",
    status: "delivered" as const,
  });

  const handleAddOrder = async () => {
    if (
      !formData.fullName ||
      !formData.company ||
      !formData.originPort ||
      !formData.destinationPort
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    const result = await addBooking({
      id: `b${Math.random().toString(36).substr(2, 9)}`,
      clientId: `u${Math.random().toString(36).substr(2, 9)}`,
      referenceNumber: `LEGACY-${Date.now()}`,
      fullName: formData.fullName,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      originCountry: formData.originCountry,
      originPort: formData.originPort,
      destinationCountry: formData.destinationCountry,
      destinationPort: formData.destinationPort,
      cargoType: formData.cargoType,
      weight: parseInt(formData.weight) || 0,
      volume: parseInt(formData.volume) || 0,
      containerType: formData.containerType,
      shipmentMode: formData.shipmentMode,
      incoterm: formData.incoterm,
      requestedDate: formData.requestedDate,
      specialInstructions: formData.specialInstructions,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (!result.success) {
      toast.error(result.error ?? "Création de commande impossible");
      return;
    }

    setFormData({
      fullName: "",
      company: "",
      email: "",
      phone: "",
      originCountry: "",
      originPort: "",
      destinationCountry: "",
      destinationPort: "",
      cargoType: "",
      weight: "",
      volume: "",
      containerType: "",
      shipmentMode: "FCL",
      incoterm: "",
      requestedDate: "",
      specialInstructions: "",
      status: "delivered",
    });
    setOpen(false);
    toast.success("Commande historique ajoutée");
  };

  const handleDeleteOrder = async (id: string) => {
    const result = await deleteBooking(id);
    if (!result.success) {
      toast.error(result.error ?? "Suppression impossible");
      return;
    }
    toast.success("Commande supprimée");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Commandes Historiques
            </h1>
            <p className="text-muted-foreground">
              Gérez les commandes des anciens clients avant le lancement de la
              plateforme.
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une commande ancienne
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          {legacyOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune commande historique ajoutée.
            </p>
          ) : (
            <div className="space-y-3">
              {legacyOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {order.referenceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.company} — {order.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.originPort} → {order.destinationPort}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.cargoType} • {order.weight}kg • {order.volume}m³
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDeleteOrder(order.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter une commande historique</DialogTitle>
              <DialogDescription>
                Enregistrez une commande d'un ancien client avant le lancement
                de la plateforme.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">
                  Informations du client
                </h3>
                <Input
                  placeholder="Nom complet *"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                <Input
                  placeholder="Entreprise *"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Input
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">Origine</h3>
                <Input
                  placeholder="Pays d'origine"
                  value={formData.originCountry}
                  onChange={(e) =>
                    setFormData({ ...formData, originCountry: e.target.value })
                  }
                />
                <Select
                  value={formData.originPort}
                  onValueChange={(v) =>
                    setFormData({ ...formData, originPort: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Port d'origine *" />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTS.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} ({p.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">Destination</h3>
                <Input
                  placeholder="Pays de destination"
                  value={formData.destinationCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationCountry: e.target.value,
                    })
                  }
                />
                <Select
                  value={formData.destinationPort}
                  onValueChange={(v) =>
                    setFormData({ ...formData, destinationPort: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Port de destination *" />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTS.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} ({p.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">
                  Détails de la cargaison
                </h3>
                <Input
                  placeholder="Type de cargo"
                  value={formData.cargoType}
                  onChange={(e) =>
                    setFormData({ ...formData, cargoType: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Poids (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Volume (m³)"
                    type="number"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">Détails du transport</h3>
                <Select
                  value={formData.containerType}
                  onValueChange={(v) =>
                    setFormData({ ...formData, containerType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type de conteneur" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTAINER_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.shipmentMode}
                  onValueChange={(v) =>
                    setFormData({ ...formData, shipmentMode: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mode d'expédition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCL">FCL</SelectItem>
                    <SelectItem value="LCL">LCL</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.incoterm}
                  onValueChange={(v) =>
                    setFormData({ ...formData, incoterm: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOTERMS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold text-sm">
                  Informations supplémentaires
                </h3>
                <Input
                  placeholder="Date de la commande"
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedDate: e.target.value })
                  }
                />
                <Input
                  placeholder="Instructions spéciales"
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialInstructions: e.target.value,
                    })
                  }
                />
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivered">Livrée</SelectItem>
                    <SelectItem value="in_transit">En transit</SelectItem>
                    <SelectItem value="arrived_port">
                      Arrivée au port
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAddOrder}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Ajouter la commande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
