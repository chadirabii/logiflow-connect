import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { ClientLayout } from "@/layouts/ClientLayout";
import {
  RECLAMATION_STATUS_LABELS,
  RECLAMATION_STATUS_COLORS,
  RECLAMATION_PRIORITY_LABELS,
  RECLAMATION_PRIORITY_COLORS,
  type Reclamation,
  type ReclamationPriority,
} from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientReclamationsPage() {
  const { user } = useAuth();
  const { reclamations, bookingRequests, addReclamation } = useStore();
  const myReclamations = reclamations.filter((r) => r.clientId === user?.id);
  const myBookings = bookingRequests.filter((b) => b.clientId === user?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium" as ReclamationPriority,
    bookingRef: "",
  });
  const [selected, setSelected] = useState<Reclamation | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addReclamation({
      id: `r${Date.now()}`,
      clientId: user!.id,
      clientName: user!.fullName,
      bookingRef: form.bookingRef || undefined,
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });

    if (!result.success) {
      toast.error(result.error ?? "Impossible de soumettre la réclamation");
      return;
    }

    setForm({
      subject: "",
      description: "",
      priority: "medium",
      bookingRef: "",
    });
    setOpen(false);
    toast.success("Réclamation soumise avec succès");
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Mes réclamations
            </h1>
            <p className="text-muted-foreground">
              Soumettez et suivez vos réclamations.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" /> Nouvelle réclamation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Soumettre une réclamation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Commande associée (optionnel)</Label>
                  <Select
                    value={form.bookingRef}
                    onValueChange={(v) => setForm({ ...form, bookingRef: v })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Sélectionner une commande" />
                    </SelectTrigger>
                    <SelectContent>
                      {myBookings.map((b) => (
                        <SelectItem key={b.id} value={b.referenceNumber}>
                          {b.referenceNumber} — {b.originPort} →{" "}
                          {b.destinationPort}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sujet *</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    placeholder="Résumé de votre réclamation"
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Priorité *</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm({ ...form, priority: v as ReclamationPriority })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Décrivez votre réclamation en détail..."
                    className="mt-1.5 min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Soumettre
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ouvertes</p>
              <p className="text-xl font-bold text-foreground">
                {myReclamations.filter((r) => r.status === "open").length}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">En traitement</p>
              <p className="text-xl font-bold text-foreground">
                {
                  myReclamations.filter((r) => r.status === "in_progress")
                    .length
                }
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Résolues</p>
              <p className="text-xl font-bold text-foreground">
                {
                  myReclamations.filter((r) =>
                    ["resolved", "closed"].includes(r.status),
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-heading font-semibold text-card-foreground">
              Historique des réclamations
            </h3>
          </div>
          {myReclamations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucune réclamation pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {myReclamations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-card-foreground">
                        {r.subject}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {r.bookingRef && (
                          <span className="bg-muted px-2 py-0.5 rounded">
                            {r.bookingRef}
                          </span>
                        )}
                        <span>{r.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          RECLAMATION_PRIORITY_COLORS[r.priority],
                        )}
                      >
                        {RECLAMATION_PRIORITY_LABELS[r.priority]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          RECLAMATION_STATUS_COLORS[r.status],
                        )}
                      >
                        {RECLAMATION_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected?.subject}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      RECLAMATION_STATUS_COLORS[selected.status],
                    )}
                  >
                    {RECLAMATION_STATUS_LABELS[selected.status]}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      RECLAMATION_PRIORITY_COLORS[selected.priority],
                    )}
                  >
                    {RECLAMATION_PRIORITY_LABELS[selected.priority]}
                  </span>
                  {selected.bookingRef && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      {selected.bookingRef}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm text-foreground">
                    {selected.description}
                  </p>
                </div>
                {selected.adminResponse && (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                    <p className="text-sm font-medium text-accent mb-1">
                      Réponse de l'admin
                    </p>
                    <p className="text-sm text-foreground">
                      {selected.adminResponse}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Soumise le {selected.createdAt} · Mise à jour le{" "}
                  {selected.updatedAt}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}
