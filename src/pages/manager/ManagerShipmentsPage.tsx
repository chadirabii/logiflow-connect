import { ManagerLayout } from "@/layouts/ManagerLayout";
import { useStore } from "@/contexts/StoreContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

export default function ManagerShipmentsPage() {
  const { shipments } = useStore();
  const [search, setSearch] = useState("");

  const filtered = shipments.filter(
    (shipment) =>
      !search ||
      shipment.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      shipment.originPort.toLowerCase().includes(search.toLowerCase()) ||
      shipment.destinationPort.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Expéditions
        </h1>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une expédition..."
            className="pl-10"
          />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Référence
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Route
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Navire
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Position
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    ETA
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-card-foreground">
                      {shipment.referenceNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {shipment.originPort} → {shipment.destinationPort}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {shipment.vessel || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-accent" />
                        <span className="text-xs text-muted-foreground">
                          {shipment.currentLocation || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {shipment.estimatedArrival || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={shipment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucune expédition trouvée.
            </div>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
