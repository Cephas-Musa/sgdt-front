import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useAuth } from "@/lib/auth";
import {
  UserPlus, Copy, Eye, EyeOff, Shield, Users, DollarSign,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  SECRETAIRES_INSPECTEUR, SOLDE_VIRTUEL, DOSSIER_ASSIGNMENTS,
  type SecretaireInsp,
} from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/secretariat")({
  component: SecretariatPage,
});

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function SecretariatPage() {
  const { user } = useAuth();
  const isInspecteur = user?.role === "inspecteur_chef";
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [genPwd, setGenPwd] = useState("");

  return (
    <div>
      <PageHeader
        title={isInspecteur ? "Gestion Secrétaires & Solde" : "Secrétariat"}
        description={isInspecteur ? "Créez vos secrétaires et suivez vos performances financières" : "Validation, paiement, apurement."}
      />

      {isInspecteur ? (
        <div className="space-y-6">
          {/* ── GESTION SECRÉTAIRES ── */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-medium flex items-center gap-2"><Users className="h-5 w-5 text-accent" />Mes Secrétaires</h2>
              <FormDialog
                trigger={<Button size="sm" className="gap-1.5"><UserPlus className="h-4 w-4" />Nouveau secrétaire</Button>}
                title="Créer un Secrétaire Inspecteur"
                submitLabel="Enregistrer"
                onSubmit={() => toast.success("Secrétaire créé ✓ Copiez les identifiants.")}
              >
                <FormGrid>
                  <Field label="Nom" required><Input /></Field>
                  <Field label="Post-nom" required><Input /></Field>
                  <Field label="Prénom" required><Input /></Field>
                  <Field label="Matricule" required><Input placeholder="SEC-XXX" /></Field>
                  <Field label="Fonction"><Input value="Secrétaire Inspecteur" readOnly className="bg-muted/50" /></Field>
                  <Field label="Identifiant (auto ou manuel)"><Input placeholder="p.nom" /></Field>
                </FormGrid>
                <div className="mt-3">
                  <Field label="Mot de passe">
                    <div className="flex gap-2">
                      <Input value={genPwd} onChange={e => setGenPwd(e.target.value)} placeholder="Générer ou saisir" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setGenPwd(generatePassword())}>Générer</Button>
                    </div>
                  </Field>
                </div>
                <div className="mt-3">
                  <Button type="button" variant="outline" size="sm" className="gap-1"
                    onClick={() => { navigator.clipboard.writeText(`MDP: ${genPwd}`); toast.info("Identifiants copiés ✓"); }}>
                    <Copy className="h-3.5 w-3.5" />Copier identifiants
                  </Button>
                </div>
              </FormDialog>
            </div>
            <div className="p-3">
              <div className="mb-3 flex items-center gap-2 rounded-md bg-accent/5 border border-accent/20 p-3 text-sm">
                <Shield className="h-4 w-4 text-accent shrink-0" />
                <span>Vous êtes le seul à créer et gérer vos secrétaires. Chacun vous est rattaché.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nom complet</th>
                      <th className="px-3 py-2">Matricule</th>
                      <th className="px-3 py-2">Identifiant</th>
                      <th className="px-3 py-2">Mot de passe</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2">Traités/Assignés</th>
                      <th className="px-3 py-2">Créé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SECRETAIRES_INSPECTEUR.map(s => (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-medium">{s.prenom} {s.nom} {s.postNom}</td>
                        <td className="px-3 py-2 font-mono text-xs">{s.matricule}</td>
                        <td className="px-3 py-2 font-mono text-xs">{s.identifiant}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">{showPwd[s.id] ? s.motDePasse : "••••••••"}</span>
                            <button onClick={() => setShowPwd(p => ({ ...p, [s.id]: !p[s.id] }))} className="text-muted-foreground hover:text-foreground">
                              {showPwd[s.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(s.motDePasse); toast.info("Copié"); }} className="text-muted-foreground hover:text-foreground">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{s.status}</span>
                        </td>
                        <td className="px-3 py-2 text-xs font-medium">{s.dossiersTraites}/{s.dossiersAssignes}</td>
                        <td className="px-3 py-2 text-xs">{s.dateCreation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── SOLDE VIRTUEL ── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-accent" />Solde Virtuel</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-gradient-to-br from-success/5 to-transparent p-5">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground mb-1"><TrendingUp className="h-3.5 w-3.5" />Total encaissé</div>
                <div className="text-2xl font-bold text-success">${SOLDE_VIRTUEL.totalEncaisse}</div>
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-warning/5 to-transparent p-5">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground mb-1"><TrendingDown className="h-3.5 w-3.5" />Commissions</div>
                <div className="text-2xl font-bold text-warning">${SOLDE_VIRTUEL.totalCommissions}</div>
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-accent/5 to-transparent p-5">
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground mb-1"><DollarSign className="h-3.5 w-3.5" />Solde net</div>
                <div className="text-2xl font-bold text-accent">${SOLDE_VIRTUEL.soldeNet}</div>
                <div className="text-xs text-muted-foreground mt-1">Maj: {SOLDE_VIRTUEL.derniereMaj}</div>
              </div>
            </div>

            {/* Historique mouvements */}
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-border p-4"><h3 className="font-medium">Historique des mouvements</h3></div>
              <div className="p-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Libellé</th>
                      <th className="px-3 py-2">Réf.</th>
                      <th className="px-3 py-2">Montant</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SOLDE_VIRTUEL.mouvements.map(m => (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.type === "credit" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                            {m.type === "credit" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {m.type === "credit" ? "Crédit" : "Débit"}
                          </span>
                        </td>
                        <td className="px-3 py-2">{m.libelle}</td>
                        <td className="px-3 py-2 font-mono text-xs">{m.ref}</td>
                        <td className="px-3 py-2 font-semibold">${m.montant}</td>
                        <td className="px-3 py-2 text-xs">{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── SECRÉTAIRE / AUTRE: vue basique ── */
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Fonctionnalités de secrétariat disponibles depuis le tableau de bord et les pages Dossiers / Apurement.</p>
        </div>
      )}
    </div>
  );
}
