import { Truck, ArrowDownToLine, ArrowUpFromLine, Building2, Users, Package, Plus } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { BATIMENTS, ENTREPOTS, ACCOUNTS, COLISAGES } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function ChefEntrepotLogDash() {
  const agents = ACCOUNTS.filter(a => a.role === "agent_pointage");

  return (
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
                  <Link to="/app/entrepots" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🚚 Entrant — Chargé</Link>
                  <Link to="/app/entrepots" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🚛 Entrant — Vide</Link>
                </div>
              </Panel>
              <Panel title="Véhicules sortants">
                <div className="grid gap-2">
                  <Link to="/app/entrepots" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🚚 Sortant — Chargé</Link>
                  <Link to="/app/entrepots" className="rounded border border-border p-3 hover:bg-muted/40 transition-colors">🚛 Sortant — Vide</Link>
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="vrac" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Vrac entrant">
                <FormDialog
                  trigger={<Button className="w-full"><Plus className="mr-1.5 h-4 w-4" />Enregistrer vrac entrant</Button>}
                  title="Vrac entrant"
                  onSubmit={() => toast.success("Vrac entrant enregistré")}
                >
                  <FormGrid>
                    <Field label="Importateur"><Input /></Field>
                    <Field label="Châssis"><Input /></Field>
                    <Field label="Référence DRA"><Input /></Field>
                    <Field label="T1"><Input /></Field>
                    <Field label="Marque"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
              <Panel title="Vrac sortant">
                <FormDialog
                  trigger={<Button className="w-full" variant="outline"><Plus className="mr-1.5 h-4 w-4" />Enregistrer vrac sortant</Button>}
                  title="Vrac sortant"
                  onSubmit={() => toast.success("Vrac sortant enregistré")}
                >
                  <FormGrid>
                    <Field label="Châssis (recherche)"><Input /></Field>
                    <Field label="Réf. déclaration"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                    <Field label="Bon de sortie"><Input /></Field>
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
                  trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Nouveau bâtiment</Button>}
                  title="Créer un bâtiment"
                  onSubmit={() => toast.success("Bâtiment créé")}
                >
                  <FormGrid>
                    <Field label="Nom du bâtiment" required><Input placeholder="Bâtiment 4" /></Field>
                    <Field label="Entrepôt"><Input /></Field>
                    <Field label="Nombre d'espaces"><Input type="number" /></Field>
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
                            esp.status === "libre" ? "border-success/40 bg-success/5" :
                            esp.status === "plein" ? "border-destructive/40 bg-destructive/5" :
                            "border-warning/40 bg-warning/5"
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
                                  esp.status === "libre" ? "bg-success" :
                                  esp.status === "plein" ? "bg-destructive" :
                                  "bg-warning"
                                }`}
                                style={{ width: `${(esp.occupe / esp.capacite) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-1">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${
                              esp.status === "libre" ? "bg-success/15 text-success" :
                              esp.status === "plein" ? "bg-destructive/15 text-destructive" :
                              "bg-warning/15 text-warning"
                            }`}>{esp.status}</span>
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
                  trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Nouvel agent</Button>}
                  title="Créer un agent pointage"
                  onSubmit={() => toast.success("Agent créé")}
                >
                  <FormGrid>
                    <Field label="Nom" required><Input /></Field>
                    <Field label="Post-nom" required><Input /></Field>
                    <Field label="Prénom"><Input /></Field>
                    <Field label="Matricule" required><Input /></Field>
                    <Field label="Téléphone"><Input /></Field>
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
                      <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline font-medium">{a.fullName}</Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-2">{a.phone}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rapports de colisage des agents */}
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="mb-2 text-sm font-medium">Rapports de colisage récents</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                      <tr>
                        <th className="px-3 py-2">Réf.</th>
                        <th className="px-3 py-2">Dossier</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Colis</th>
                        <th className="px-3 py-2">Poids</th>
                        <th className="px-3 py-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COLISAGES.slice(0, 5).map((c) => (
                        <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-2 font-mono text-xs">{c.reference}</td>
                          <td className="px-3 py-2">
                            <Link to="/app/dossiers/$dossierId" params={{ dossierId: c.dossierId }} className="text-accent hover:underline text-xs">{c.dossierId}</Link>
                          </td>
                          <td className="px-3 py-2">{c.date}</td>
                          <td className="px-3 py-2">{c.nombreColis}</td>
                          <td className="px-3 py-2">{c.poidsTotal} kg</td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "validé" ? "bg-success/15 text-success" : c.status === "rejeté" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="entreposage" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Déchargement">
                <FormDialog
                  trigger={<Button className="w-full"><Package className="mr-1.5 h-4 w-4" />Nouveau déchargement</Button>}
                  title="Enregistrer un déchargement"
                  onSubmit={() => toast.success("Déchargement enregistré")}
                >
                  <FormGrid>
                    <Field label="Véhicule"><Input /></Field>
                    <Field label="Réf. dossier"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                    <Field label="Espace de stockage"><Input /></Field>
                    <Field label="Quantité"><Input type="number" /></Field>
                    <Field label="Poids"><Input type="number" /></Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
              <Panel title="Changement">
                <FormDialog
                  trigger={<Button className="w-full" variant="outline"><Package className="mr-1.5 h-4 w-4" />Changement d'espace</Button>}
                  title="Changement d'espace de stockage"
                  onSubmit={() => toast.success("Changement enregistré")}
                >
                  <FormGrid>
                    <Field label="Espace source"><Input /></Field>
                    <Field label="Espace destination"><Input /></Field>
                    <Field label="Marchandise"><Input /></Field>
                    <Field label="Quantité"><Input type="number" /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                  </FormGrid>
                </FormDialog>
              </Panel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
