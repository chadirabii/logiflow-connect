import { ManagerLayout } from "@/layouts/ManagerLayout";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/contexts/StoreContext";
import {
  Package,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Ship,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  RECLAMATION_STATUS_LABELS,
  RECLAMATION_STATUS_COLORS,
} from "@/data/mockData";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { bookingRequests, reclamations, shipments } = useStore();
  const openReclamations = reclamations.filter((r) =>
    ["open", "in_progress"].includes(r.status),
  );
  const resolvedReclamations = reclamations.filter(
    (r) => r.status === "resolved",
  );
  const activeShipments = shipments.filter(
    (s) => !["delivered", "rejected"].includes(s.status),
  );

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Dashboard Manager
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total commandes"
            value={bookingRequests.length}
            icon={Package}
          />
          <KPICard
            title="Expéditions actives"
            value={activeShipments.length}
            icon={Ship}
          />
          <KPICard
            title="Réclamations ouvertes"
            value={openReclamations.length}
            icon={AlertTriangle}
          />
          <KPICard
            title="Réclamations résolues"
            value={resolvedReclamations.length}
            icon={CheckCircle}
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-card-foreground">
                Expéditions récentes
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/manager/shipments")}
                className="text-accent"
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {shipments.slice(0, 5).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      {s.referenceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.originPort} → {s.destinationPort}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-card-foreground">
                Réclamations récentes
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/manager/reclamations")}
                className="text-accent"
              >
                Voir tout
              </Button>
            </div>
            <div className="space-y-3">
              {reclamations.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      {r.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.clientName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RECLAMATION_STATUS_COLORS[r.status]}`}
                  >
                    {RECLAMATION_STATUS_LABELS[r.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
