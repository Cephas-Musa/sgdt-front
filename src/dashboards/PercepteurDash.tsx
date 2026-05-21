import { useState } from "react";
import { FileText, DollarSign, Printer, Plus } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { EMPTY_MANIFESTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function PercepteurDash() {
  const solde = 1250; // Mock solde utilisateur
  const [showSoldeWarning, setShowSoldeWarning] = useState(false);

  return (
    <div>
      <DashHeader subtitle="Percepteur — création et gestion des empty manifests" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Manifests créés" value={EMPTY_MANIFESTS.length} />
        <StatCard
          icon={DollarSign}
          label="Solde disponible"
          value={`$${solde}`}
          hint="Vérifier avant impression"
        />
        <StatCard icon={Printer} label="Imprimés" value={8} />
        <StatCard icon={Plus} label="Aujourd'hui" value={2} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Créer un Empty Manifest"
          actions={
            <FormDialog
              trigger={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nouveau manifest
                </Button>
              }
              title="Créer un Empty Manifest"
              onSubmit={() => {
                if (solde < 25) {
                  toast.error("Solde insuffisant ! Veuillez recharger votre compte.");
                  return;
                }
                toast.success("Empty manifest créé avec succès. Numéro attribué.");
              }}
            >
              {/* Vérification du solde */}
              <div
                className={`mb-4 rounded-md p-3 border flex gap-3 ${solde >= 25 ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}
              >
                <DollarSign
                  className={`h-5 w-5 mt-0.5 ${solde >= 25 ? "text-success" : "text-destructive"}`}
                />
                <div className="text-sm">
                  <p className="font-medium">Solde: ${solde}</p>
                  <p className="text-muted-foreground">
                    {solde >= 25
                      ? "Solde suffisant pour créer un manifest"
                      : "⚠ Solde insuffisant — rechargez votre compte"}
                  </p>
                </div>
              </div>

              <FormGrid>
                <Field label="Référence" required>
                  <Input placeholder="EMP/2025/…" />
                </Field>
                <Field label="Date" required>
                  <Input type="date" />
                </Field>
                <Field label="Nom déclarant" required>
                  <Input />
                </Field>
                <Field label="Plaque véhicule" required>
                  <Input />
                </Field>
                <Field label="Type de véhicule" required>
                  <Input placeholder="Camion, Pick-up…" />
                </Field>
                <Field label="Transporteur" required>
                  <Input />
                </Field>
                <Field label="Lieu de chargement" required>
                  <Input />
                </Field>
                <Field label="Propriétaire véhicule">
                  <Input />
                </Field>
                <Field label="Destination" required>
                  <Input />
                </Field>
                <Field label="Marque véhicule">
                  <Input />
                </Field>
                <Field label="Nom chauffeur" required>
                  <Input />
                </Field>
              </FormGrid>
            </FormDialog>
          }
        >
          <div className="py-4 text-center text-sm text-muted-foreground">
            Cliquez sur "Nouveau manifest" pour créer un document. Le solde sera vérifié
            automatiquement avant l'attribution du numéro.
          </div>
        </Panel>

        <Panel title="Manifests récents">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Référence</th>
                  <th className="px-3 py-2">Déclarant</th>
                  <th className="px-3 py-2">Véhicule</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {EMPTY_MANIFESTS.slice(0, 8).map((m) => (
                  <tr
                    key={m.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <Link
                        to="/app/manifest/$manifestId"
                        params={{ manifestId: m.id }}
                        className="text-accent hover:underline font-mono text-xs"
                      >
                        {m.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{m.declarant}</td>
                    <td className="px-3 py-2">{m.vehicule}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
