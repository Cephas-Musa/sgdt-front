import { useState } from "react";
import { FolderKanban, FileCheck, Bell, Truck, Search } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, ALERTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function ChefEntrepotDouaneDash() {
  const [searchRef, setSearchRef] = useState("");
  const [searchApurRef, setSearchApurRef] = useState("");
  const [searchApurDate, setSearchApurDate] = useState("");

  const filtered = DOSSIERS.filter(d => {
    if (searchRef && !d.reference.toLowerCase().includes(searchRef.toLowerCase())) return false;
    return true;
  });

  const filteredApurement = DOSSIERS.filter(d => {
    if (searchApurRef && !d.reference.toLowerCase().includes(searchApurRef.toLowerCase())) return false;
    if (searchApurDate && d.date !== searchApurDate) return false;
    return true;
  });

  return (
    <div>
      <DashHeader subtitle="Chef Entrepôt Douane — dossiers, appurement, alertes, véhicules" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard icon={FileCheck} label="Apurés" value={DOSSIERS.filter(d => d.status === "apure").length} />
        <StatCard icon={Bell} label="Alertes" value={ALERTS.length} />
        <StatCard icon={Truck} label="Véhicules" value={21} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList>
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="appurement">Appurement</TabsTrigger>
            <TabsTrigger value="alertes">Alertes</TabsTrigger>
            <TabsTrigger value="vehicules">Véhicule</TabsTrigger>
          </TabsList>

          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Recherche par référence</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Rechercher par référence…"
                  value={searchRef}
                  onChange={e => setSearchRef(e.target.value)}
                  className="max-w-xs"
                />
                <Button variant="outline" onClick={() => setSearchRef("")}>Réinitialiser</Button>
              </div>
            </div>
            <Panel title={`Dossiers (${filtered.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Réf. DRA</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">T1</th>
                      <th className="px-3 py-2">Date T1</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 15).map((d, i) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline">{d.importateur}</Link>
                        </td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2">{d.date}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2">{d.date}</td>
                        <td className="px-3 py-2 capitalize">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "apure" ? "bg-success/15 text-success" : d.status === "rejete" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}>{d.status.replace("_", " ")}</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => toast.success("Dénombrement autorisé")}>Autoriser dénombrement</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="appurement" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Recherche dossier pour appurement</h3>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Référence RD-…"
                  value={searchApurRef}
                  onChange={e => setSearchApurRef(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  type="date"
                  value={searchApurDate}
                  onChange={e => setSearchApurDate(e.target.value)}
                  className="max-w-[180px]"
                />
                <Button variant="outline" onClick={() => { setSearchApurRef(""); setSearchApurDate(""); }}>Réinitialiser</Button>
              </div>
            </div>
            <Panel title={`Résultats (${filteredApurement.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Réf. DRA</th>
                      <th className="px-3 py-2">Réf. T1</th>
                      <th className="px-3 py-2">Réf. douane</th>
                      <th className="px-3 py-2">Réf. bon sortie</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApurement.slice(0, 15).map((d, i) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline">{d.importateur}</Link>
                        </td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2 font-mono text-xs">E-{d.id}</td>
                        <td className="px-3 py-2 font-mono text-xs">BS-{d.id}</td>
                        <td className="px-3 py-2 text-right">
                          <FormDialog
                            trigger={<Button size="sm" variant="outline"><FileCheck className="mr-1 h-3.5 w-3.5" />Appurer</Button>}
                            title={`Appurement — ${d.reference}`}
                            onSubmit={() => toast.success("Dossier appuré")}
                          >
                            <FormGrid>
                              <Field label="Référence douane" required><Input placeholder="E-…" /></Field>
                              <Field label="Date" required><Input type="date" /></Field>
                              <Field label="Référence bon de sortie" required><Input /></Field>
                              <Field label="Date bon de sortie"><Input type="date" /></Field>
                              <Field label="Matricule émetteur" required><Input /></Field>
                              <Field label="Informations case (18) DAU"><Input /></Field>
                              <Field label="Plaque sur le bon de sortie"><Input /></Field>
                              <Field label="Poids (kg)" required><Input type="number" /></Field>
                              <Field label="Quantité" required><Input type="number" /></Field>
                            </FormGrid>
                          </FormDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="alertes" className="mt-4">
            <Panel title="Alertes">
              <ul className="divide-y divide-border text-sm">
                {ALERTS.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3 px-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${a.level === "urgent" ? "bg-destructive/15 text-destructive" : a.level === "important" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"}`}>{a.level}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
}
