import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { ClientLayout } from "@/layouts/ClientLayout";
import { FileText, Download, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  invoice: "Facture",
  packing_list: "Packing List",
  customs: "Douane",
  transport: "Transport",
  contract: "Contrat",
  other: "Autre",
};

export default function ClientDocumentsPage() {
  const { user } = useAuth();
  const { documents, uploadDocumentFile, getDocumentDownloadUrl } = useStore();
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState<
    "invoice" | "packing_list" | "customs" | "transport" | "contract" | "other"
  >("other");
  const [isUploading, setIsUploading] = useState(false);

  const myDocs = documents
    .filter((d) => d.clientId === user?.id)
    .filter(
      (d) => !search || d.name.toLowerCase().includes(search.toLowerCase()),
    );

  const handleUpload = async () => {
    if (!user) return;
    if (!selectedFile) {
      toast.error("Veuillez choisir un fichier");
      return;
    }

    setIsUploading(true);
    const result = await uploadDocumentFile({
      file: selectedFile,
      clientId: user.id,
      uploadedBy: user.id,
      type: selectedType,
    });
    setIsUploading(false);

    if (!result.success) {
      toast.error(result.error ?? "Téléversement impossible");
      return;
    }

    setSelectedFile(null);
    setSelectedType("other");
    toast.success("Document téléversé avec succès");
  };

  const handleDownload = async (documentId: string) => {
    const document = myDocs.find((d) => d.id === documentId);
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Documents
          </h1>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="w-[260px]"
            />
            <Select
              value={selectedType}
              onValueChange={(v) =>
                setSelectedType(
                  v as
                    | "invoice"
                    | "packing_list"
                    | "customs"
                    | "transport"
                    | "contract"
                    | "other",
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">Facture</SelectItem>
                <SelectItem value="packing_list">Packing List</SelectItem>
                <SelectItem value="customs">Douane</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="contract">Contrat</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => void handleUpload()}
              disabled={isUploading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Upload className="h-4 w-4 mr-2" />{" "}
              {isUploading ? "Téléversement..." : "Téléverser"}
            </Button>
          </div>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="pl-10"
          />
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Nom
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Taille
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {myDocs.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="font-medium text-card-foreground">
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">
                      {TYPE_LABELS[d.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.createdAt}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDownload(d.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myDocs.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucun document.
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
