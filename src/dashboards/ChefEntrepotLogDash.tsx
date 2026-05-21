import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Users,
  Package,
  Plus,
  Eye,
  X,
  Scale,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { BATIMENTS, ACCOUNTS } from "@/lib/mock";
import { RAPPORTS_COLISAGE, type RapportColisage } from "@/lib/colisage-store";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ChefEntrepotLogDash() {
  const agents = ACCOUNTS.filter((a) => a.role === "agent_pointage");
  const [rapportOuvert, setRapportOuvert] = useState<RapportColisage | null>(null);

  return (
    <>
    <div>
      <DashHeader subtitle="Chef Entrepôt Logistique — véhicules, bâtiments, agents, entreposage" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Véhicules entrants" value={12} />
        <StatCard icon={ArrowUpFromLine} label="Véhicules sortants" value={9} />
        <StatCard icon={Building2} label="Bâtiments" value={BATIMENTS.length} />
        <StatCard icon={Users} label="Agents pointage" value={agents.length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="vehicules">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="vehicules">Véhicule</TabsTrigger>
            <TabsTrigger value="vrac">Vrac</TabsTrigger>
            <TabsTrigger value="batiments">Bâtiment</TabsTrigger>
            <TabsTrigger value="agents">Agent pointage</TabsTrigger>
            <TabsTrigger value="entreposage">Entreposage</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicules" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Véhicules entrants">
                <div className="grid gap-2">
                  <Link
                    to="/app/entrepots"
                    className="rounded border border-border p-3 hover:bg-muted/40 transition-colors"
                  >
                    🚚 Entrant — Chargé
                  </Link>
                  <Link
                    to="/app/entrepots"
                    className="rounded border border-border p-3 hover:bg-muted/40 transition-colors"
                  >
                    🚛 Entrant — Vide
                  </Link>
                </div>
              </Panel>
              <Panel title="Véhicules sortants">
                <div className="grid gap-2">
                  <Link
                    to="/app/entrepots"
                    className="rounded border border-border p-3 hover:bg-muted/40 transition-colors"
                  >
                    🚚 Sortant — Chargé
                  </Link>
                  <Link
                    to="/app/entrepots"
                    className="rounded border border-border p-3 hover:bg-muted/40 transition-colors"
                  >
                    🚛 Sortant — Vide
                  </Link>
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="vrac" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Vrac entrant">
                <FormDialog
                  trigger={
                    <Button className="w-full">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Enregistrer vrac entrant
                    </Button>
                  }
                  title="Vrac entrant"
                  onSubmit={() => toast.success("Vrac entrant enregistré")}
                >
                  <FormGrid>
                    <Field label="Importateur">
                      <Input />
                    </Field>
                    <Field label="Châssis">
                      <Input />
                    </Field>
                    <Field label="Référence DRA">
                      <Input />
                    </Field>
                    <Field label="T1">
                      <Input />
                    </Field>
                    <Field label="Marque">
                      <Input />
                    </Field>
                    <Field label="Date">
                      <Input type="date" />
                    </Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
              <Panel title="Vrac sortant">
                <FormDialog
                  trigger={
                    <Button className="w-full" variant="outline">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Enregistrer vrac sortant
                    </Button>
                  }
                  title="Vrac sortant"
                  onSubmit={() => toast.success("Vrac sortant enregistré")}
                >
                  <FormGrid>
                    <Field label="Châssis (recherche)">
                      <Input />
                    </Field>
                    <Field label="Réf. déclaration">
                      <Input />
                    </Field>
                    <Field label="Date">
                      <Input type="date" />
                    </Field>
                    <Field label="Bon de sortie">
                      <Input />
                    </Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="batiments" className="mt-4">
            <Panel
              title="Bâtiments"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouveau bâtiment
                    </Button>
                  }
                  title="Créer un bâtiment"
                  onSubmit={() => toast.success("Bâtiment créé")}
                >
                  <FormGrid>
                    <Field label="Nom du bâtiment" required>
                      <Input placeholder="Bâtiment 4" />
                    </Field>
                    <Field label="Entrepôt">
                      <Input />
                    </Field>
                    <Field label="Nombre d'espaces">
                      <Input type="number" />
                    </Field>
                  </FormGrid>
                </FormDialog>
              }
            >
              <div className="space-y-4">
                {BATIMENTS.map((bat) => (
                  <div key={bat.id} className="rounded-lg border border-border p-4">
                    <h4 className="font-medium mb-3">{bat.nom}</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {bat.espaces.map((esp) => (
                        <div
                          key={esp.id}
                          className={`rounded-lg border p-3 text-sm transition-colors ${
                            esp.status === "libre"
                              ? "border-success/40 bg-success/5"
                              : esp.status === "plein"
                                ? "border-destructive/40 bg-destructive/5"
                                : "border-warning/40 bg-warning/5"
                          }`}
                        >
                          <div className="font-medium">{esp.nom}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {esp.occupe}/{esp.capacite} occupé
                          </div>
                          <div className="mt-1">
                            <div className="h-2 w-full rounded-full bg-muted">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  esp.status === "libre"
                                    ? "bg-success"
                                    : esp.status === "plein"
                                      ? "bg-destructive"
                                      : "bg-warning"
                                }`}
                                style={{ width: `${(esp.occupe / esp.capacite) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                esp.status === "libre"
                                  ? "bg-success/15 text-success"
                                  : esp.status === "plein"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-warning/15 text-warning"
                              }`}
                            >
                              {esp.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="agents" className="mt-4">
            <Panel
              title="Agents de pointage"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouvel agent
                    </Button>
                  }
                  title="Créer un agent pointage"
                  onSubmit={() => toast.success("Agent créé")}
                >
                  <FormGrid>
                    <Field label="Nom" required>
                      <Input />
                    </Field>
                    <Field label="Post-nom" required>
                      <Input />
                    </Field>
                    <Field label="Prénom">
                      <Input />
                    </Field>
                    <Field label="Matricule" required>
                      <Input />
                    </Field>
                    <Field label="Téléphone">
                      <Input />
                    </Field>
                  </FormGrid>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Matricule</th>
                      <th className="px-3 py-2">Téléphone</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/comptes/$compteId"
                            params={{ compteId: a.id }}
                            className="text-accent hover:underline font-medium"
                          >
                            {a.fullName}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-2">{a.phone}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rapports de colisage soumis par les agents — données temps réel */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-accent" />
                    Rapports de colisage reçus
                  </h4>
                  <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                    {RAPPORTS_COLISAGE.length} rapport(s)
                  </Badge>
                </div>

                {RAPPORTS_COLISAGE.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-xl bg-muted/5">
                    <Package className="h-10 w-10 mb-2 opacity-10" />
                    Aucun rapport soumis pour l'instant
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                        <tr>
                          <th className="px-3 py-2">Référence dossier</th>
                          <th className="px-3 py-2">Importateur</th>
                          <th className="px-3 py-2">Date soumission</th>
                          <th className="px-3 py-2 text-center">Qté totale</th>
                          <th className="px-3 py-2 text-right">Poids total</th>
                          <th className="px-3 py-2 text-center">Statut</th>
                          <th className="px-3 py-2 text-right">Voir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RAPPORTS_COLISAGE.map((r) => (
                          <tr key={r.id} className="border-t border-border hover:bg-accent/5 transition-colors">
                            <td className="px-3 py-2 font-bold text-accent">{r.dossierRef}</td>
                            <td className="px-3 py-2 text-xs text-muted-foreground">{r.importateur}</td>
                            <td className="px-3 py-2 text-xs">{r.dateSoumission}</td>
                            <td className="px-3 py-2 text-center font-bold">{r.totalQuantite}</td>
                            <td className="px-3 py-2 text-right font-bold">{r.totalPoids.toLocaleString()} kg</td>
                            <td className="px-3 py-2 text-center">
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-warning/15 text-warning uppercase">
                                {r.statut}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-accent hover:bg-accent/10"
                                onClick={() => setRapportOuvert(r)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="entreposage" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Déchargement">
                <FormDialog
                  trigger={
                    <Button className="w-full">
                      <Package className="mr-1.5 h-4 w-4" />
                      Nouveau déchargement
                    </Button>
                  }
                  title="Enregistrer un déchargement"
                  onSubmit={() => toast.success("Déchargement enregistré")}
                >
                  <FormGrid>
                    <Field label="Véhicule">
                      <Input />
                    </Field>
                    <Field label="Réf. dossier">
                      <Input />
                    </Field>
                    <Field label="Date">
                      <Input type="date" />
                    </Field>
                    <Field label="Espace de stockage">
                      <Input />
                    </Field>
                    <Field label="Quantité">
                      <Input type="number" />
                    </Field>
                    <Field label="Poids">
                      <Input type="number" />
                    </Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
              <Panel title="Changement">
                <FormDialog
                  trigger={
                    <Button className="w-full" variant="outline">
                      <Package className="mr-1.5 h-4 w-4" />
                      Changement d'espace
                    </Button>
                  }
                  title="Changement d'espace de stockage"
                  onSubmit={() => toast.success("Changement enregistré")}
                >
                  <FormGrid>
                    <Field label="Espace source">
                      <Input />
                    </Field>
                    <Field label="Espace destination">
                      <Input />
                    </Field>
                    <Field label="Marchandise">
                      <Input />
                    </Field>
                    <Field label="Quantité">
                      <Input type="number" />
                    </Field>
                    <Field label="Date">
                      <Input type="date" />
                    </Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>

      {/* === MODAL DÉTAIL RAPPORT === */}
      {rapportOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-accent/20 bg-background shadow-2xl shadow-black/30">
            {/* En-tête modal */}
            <div className="flex items-center justify-between p-6 border-b border-accent/10 bg-accent/5 sticky top-0 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/10">
                  <ListChecks className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Rapport de Colisage</h2>
                  <p className="text-sm text-muted-foreground">
                    Dossier : <span className="font-bold text-accent">{rapportOuvert.dossierRef}</span>
                    {" · "}{rapportOuvert.importateur}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setRapportOuvert(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos dossier */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl border border-accent/10 bg-muted/20">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Agent</p>
                  <p className="font-semibold text-sm">{rapportOuvert.agentNom}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date soumission</p>
                  <p className="font-semibold text-sm">{rapportOuvert.dateSoumission}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type dossier</p>
                  <p className="font-semibold text-sm uppercase">{rapportOuvert.typeDossier}</p>
                </div>
              </div>

              {/* Tableau articles */}
              <div className="rounded-2xl border border-accent/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/5 border-b border-accent/10">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground w-10">N°</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-muted-foreground">Quantité</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids/colis</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/5">
                    {rapportOuvert.lignes.map((ligne, idx) => (
                      <tr key={ligne.id} className="hover:bg-accent/5">
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground font-bold">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{ligne.description}</td>
                        <td className="px-4 py-3 text-center font-bold text-lg">{ligne.quantite}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{ligne.poidsParColis} kg</td>
                        <td className="px-4 py-3 text-right font-bold text-accent">{ligne.poidsTotal.toLocaleString()} kg</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-accent text-white">
                      <td className="px-4 py-4" colSpan={2}>
                        <div className="flex items-center gap-2 font-bold">
                          <Scale className="h-4 w-4" />
                          TOTAL GÉNÉRAL
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-2xl">{rapportOuvert.totalQuantite}</td>
                      <td className="px-4 py-4 text-right opacity-60">—</td>
                      <td className="px-4 py-4 text-right font-black text-2xl">{rapportOuvert.totalPoids.toLocaleString()} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {rapportOuvert.notes && (
                <div className="p-4 rounded-2xl border border-accent/10 bg-muted/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{rapportOuvert.notes}</p>
                </div>
              )}

              {/* Actions validation */}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" className="rounded-xl gap-2" onClick={() => setRapportOuvert(null)}>
                  Fermer
                </Button>
                <Button
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={() => {
                    toast.success(`Rapport ${rapportOuvert.dossierRef} validé !`);
                    setRapportOuvert(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Valider le rapport
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
