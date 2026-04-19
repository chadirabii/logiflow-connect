import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ship, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [rneFile, setRneFile] = useState<File | null>(null);
  const [patenteFile, setPatenteFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!rneFile) {
      toast.error("Veuillez téléverser votre document RNE");
      return;
    }
    if (!patenteFile) {
      toast.error("Veuillez téléverser votre document Patente");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      company: form.company,
      phone: form.phone,
      rneFile: rneFile.name,
      patenteFile: patenteFile.name,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Inscription impossible");
      return;
    }

    if (result.requiresEmailConfirmation) {
      toast.success(
        "Compte créé. Vérifiez votre email pour confirmer l'inscription avant de vous connecter.",
      );
      navigate("/login");
      return;
    }

    if (result.success) {
      toast.success("Compte créé avec succès");
      navigate("/client");
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <Ship className="h-7 w-7 text-accent" />
            <span className="font-heading font-bold text-xl text-foreground">
              24/7 Logistics
            </span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Créer un compte
          </h1>
          <p className="mt-2 text-muted-foreground">
            Rejoignez notre plateforme logistique.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Jean Dupont"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="votre@email.com"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Société</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Nom de votre entreprise"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+212 600 000 000"
                className="mt-1.5"
              />
            </div>

            {/* RNE File Upload */}
            <div>
              <Label>Document RNE (Registre National des Entreprises) *</Label>
              <label
                htmlFor="rneFile"
                className="mt-1.5 flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
              >
                {rneFile ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {rneFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Cliquez pour téléverser le fichier RNE
                    </span>
                  </>
                )}
                <input
                  id="rneFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setRneFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés : PDF, JPG, PNG
              </p>
            </div>

            {/* Patente File Upload */}
            <div>
              <Label>Document Patente *</Label>
              <label
                htmlFor="patenteFile"
                className="mt-1.5 flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
              >
                {patenteFile ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">
                      {patenteFile.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Cliquez pour téléverser le fichier Patente
                    </span>
                  </>
                )}
                <input
                  id="patenteFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => setPatenteFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés : PDF, JPG, PNG
              </p>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmer le mot de passe *</Label>
              <Input
                id="confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                placeholder="••••••••"
                className="mt-1.5"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <Ship className="h-24 w-24 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-heading font-bold text-primary-foreground">
            Commencez maintenant
          </h2>
          <p className="mt-3 text-primary-foreground/70 max-w-sm">
            Inscription gratuite. Accédez à toutes les fonctionnalités de la
            plateforme.
          </p>
        </div>
      </div>
    </div>
  );
}
