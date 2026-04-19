import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { STATUS_LABELS } from "@/data/mockData";
import { ClientLayout } from "@/layouts/ClientLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Download,
  MapPin,
  Ship,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookingRequests,
    shipments,
    trackingEvents,
    documents,
    getDocumentDownloadUrl,
  } = useStore();
  const booking = bookingRequests.find((b) => b.id === id);
  if (!booking)
    return (
      <ClientLayout>
        <p className="text-muted-foreground">Commande introuvable.</p>
      </ClientLayout>
    );

  const shipment = shipments.find((s) => s.bookingId === booking.id);
  const events = shipment
    ? trackingEvents.filter((e) => e.shipmentId === shipment.id)
    : [];
  const docs = documents.filter((d) => d.bookingId === booking.id);

  const handleDownload = async (documentId: string) => {
    const document = docs.find((d) => d.id === documentId);
    if (!document) return;

    const result = await getDocumentDownloadUrl(document);
    if (!result.success || !result.url) {
      toast.error(result.error ?? "Téléchargement impossible");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/client/orders")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux commandes
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {booking.referenceNumber}
            </h1>
            <p className="text-muted-foreground">
              {booking.originPort} → {booking.destinationPort}
            </p>
          </div>
          <StatusBadge status={booking.status} className="text-sm px-4 py-1" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-heading font-semibold text-card-foreground">
              Détails de la réservation
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Société</span>
                <p className="font-medium text-card-foreground">
                  {booking.company}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Marchandise</span>
                <p className="font-medium text-card-foreground">
                  {booking.cargoType}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Poids</span>
                <p className="font-medium text-card-foreground">
                  {booking.weight.toLocaleString()} kg
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Volume</span>
                <p className="font-medium text-card-foreground">
                  {booking.volume} m³
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Conteneur</span>
                <p className="font-medium text-card-foreground">
                  {booking.containerType}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Mode</span>
                <p className="font-medium text-card-foreground">
                  {booking.shipmentMode}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Incoterm</span>
                <p className="font-medium text-card-foreground">
                  {booking.incoterm}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Date souhaitée</span>
                <p className="font-medium text-card-foreground">
                  {booking.requestedDate}
                </p>
              </div>
            </div>
            {booking.specialInstructions && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">
                  Instructions
                </span>
                <p className="text-sm font-medium text-card-foreground mt-1">
                  {booking.specialInstructions}
                </p>
              </div>
            )}
          </div>
          {shipment && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading font-semibold text-card-foreground">
                Informations d'expédition
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Navire :</span>
                  <span className="font-medium text-card-foreground">
                    {shipment.vessel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Conteneur :</span>
                  <span className="font-medium text-card-foreground">
                    {shipment.containerNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Position :</span>
                  <span className="font-medium text-card-foreground">
                    {shipment.currentLocation}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">ETA :</span>
                  <span className="font-medium text-card-foreground">
                    {shipment.estimatedArrival}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {events.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">
              Suivi de l'expédition
            </h3>
            <TrackingTimeline events={events} />
          </div>
        )}
        {docs.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-4">
              Documents
            </h3>
            <div className="space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {d.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.size} • {d.createdAt}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDownload(d.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

function PackageIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
