import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  User,
  Phone,
  Building2,
  Calendar,
  Shield,
  Edit,
  KeyRound,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNTS } from "@/lib/mock";
import { ROLE_LABELS } from "@/lib/roles";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/app/comptes/$compteId")({
  component: CompteDetailPage,
});

function CompteDetailPage() {
  const { compteId } = useParams({ from: "/app/comptes/$compteId" });
  const router = useRouter();

  const compte = ACCOUNTS.find((c) => c.id === compteId);

  if (!compte) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Compte non trouvé</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[compte.role]?.fr ?? compte.role;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">{compte.fullName}</h1>
                  <p className="text-sm text-muted-foreground">{roleLabel}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${compte.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
              >
                {compte.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Identifiant
                </div>
                <div className="font-mono text-sm">{compte.username}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Matricule
                </div>
                <div className="font-mono text-sm">{compte.matricule}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Téléphone
                </div>
                <div className="text-sm">{compte.phone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Rôle
                </div>
                <div className="text-sm font-medium">{roleLabel}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Bureau
                </div>
                <div className="text-sm">{compte.bureau ?? "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Province
                </div>
                <div className="text-sm">{compte.province ?? "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date de création
                </div>
                <div className="text-sm">{compte.dateCreation}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Créé par
                </div>
                <div className="text-sm">{compte.creePar ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Actions</h3>
            <div className="space-y-2">
              <FormDialog
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier le compte
                  </Button>
                }
                title="Modifier le compte"
                onSubmit={() => toast.success("Compte modifié")}
              >
                <FormGrid>
                  <Field label="Nom complet">
                    <Input defaultValue={compte.fullName} />
                  </Field>
                  <Field label="Téléphone">
                    <Input defaultValue={compte.phone} />
                  </Field>
                  <Field label="Bureau">
                    <Input defaultValue={compte.bureau} />
                  </Field>
                  <Field label="Province">
                    <Input defaultValue={compte.province} />
                  </Field>
                </FormGrid>
              </FormDialog>

              <FormDialog
                trigger={
                  <Button variant="outline" className="w-full justify-start">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Réinitialiser le mot de passe
                  </Button>
                }
                title="Réinitialiser le mot de passe"
                onSubmit={() =>
                  toast.success("Mot de passe réinitialisé. Nouveau mot de passe envoyé.")
                }
              >
                <Field label="Nouveau mot de passe">
                  <div className="flex gap-2">
                    <Input placeholder="Généré automatiquement" readOnly />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info("Mot de passe généré")}
                    >
                      <KeyRound className="mr-1 h-3.5 w-3.5" />
                      Générer
                    </Button>
                  </div>
                </Field>
              </FormDialog>

              {compte.status === "actif" ? (
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => toast.success("Compte désactivé")}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Désactiver le compte
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start text-success hover:text-success"
                  onClick={() => toast.success("Compte réactivé")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Réactiver le compte
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Historique</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <div className="w-0.5 h-6 bg-border" />
                </div>
                <div>
                  <div className="font-medium">Compte créé</div>
                  <div className="text-xs text-muted-foreground">
                    {compte.dateCreation} par {compte.creePar ?? "—"}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${compte.status === "actif" ? "bg-success" : "bg-destructive"}`}
                  />
                </div>
                <div>
                  <div className="font-medium">
                    {compte.status === "actif" ? "Actif" : "Désactivé"}
                  </div>
                  <div className="text-xs text-muted-foreground">Statut actuel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
