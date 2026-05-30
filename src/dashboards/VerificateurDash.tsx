import { useState } from "react";
import { FileCheck, Search, FolderKanban, FileText } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers } from "@/lib/api";
import { DOSSIERS_TRAITES } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function VerificateurDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];

  const [searchRef, setSearchRef] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchDRA, setSearchDRA] = useState("");

  const filtered = activeDossiers.filter((d) => {
    if (searchRef && !(d.reference || "").toLowerCase().includes(searchRef.toLowerCase())) return false;
    if (searchYear && !d.date.startsWith(searchYear)) return false;
    return true;
  });

  const filteredRepr = activeDossiers.filter((d) => {
    if (searchDRA && !(d.dra || "").toLowerCase().includes(searchDRA.toLowerCase())) return false;
    if (dateDebut && d.date < dateDebut) return false;
    if (dateFin && d.date > dateFin) return false;
    return true;
  });

  const traites = DOSSIERS_TRAITES;

  return (
    <div>
      <DashHeader subtitle="Vérificateur — recherche dossiers, appurement, rapports" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={activeDossiers.length} />
        <StatCard icon={FileCheck} label="Dossiers traités" value={traites.length} />
        <StatCard
          icon={Search}
          label="En vérification"
          value={activeDossiers.filter((d) => d.status === "en_cours").length}
        />
        <StatCard
          icon={FileText}
          label="Apurés"
          value={activeDossiers.filter((d) => d.status === "apure").length}
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList>
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="rapport">Rapport de présentation</TabsTrigger>
            <TabsTrigger value="traites">Dossiers traités</TabsTrigger>
          </TabsList>

          <TabsContent value="dossiers" className="mt-4 space-y-4">
            {/* Recherche */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Recherche de dossier</h3>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Référence du document…"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  placeholder="Année (ex: 2025)"
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
                  className="max-w-[150px]"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchRef("");
                    setSearchYear("");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* Résultats */}
            <Panel title={`Résultats (${filtered.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Réf. dossier</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Nb titres</th>
                      <th className="px-3 py-2">Nb déclarations</th>
                      <th className="px-3 py-2">Mode déclaration</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 20).map((d, i) => (
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            to="/app/dossiers/$dossierId"
                            params={{ dossierId: d.id }}
                            className="text-accent hover:underline font-mono text-xs"
                          >
                            {d.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2">{d.nbTitres ?? "—"}</td>
                        <td className="px-3 py-2">{d.nbDeclarations ?? "—"}</td>
                        <td className="px-3 py-2">{d.modeDeclaration ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="outline">
                                <FileCheck className="mr-1 h-3.5 w-3.5" />
                                Appurement
                              </Button>
                            }
                            title={`Appurement dossier ${d.reference}`}
                            onSubmit={() => toast.success("Appurement enregistré")}
                          >
                            <div className="mb-3 rounded-md bg-accent/10 p-3 text-sm">
                              <span className="font-medium">Dossier:</span> {d.reference} —{" "}
                              {d.importateur}
                            </div>
                            <FormGrid>
                              <Field label="Référence douane" required>
                                <Input placeholder="E-…" />
                              </Field>
                              <Field label="Référence DRA" required>
                                <Input value={d.dra} />
                              </Field>
                              <Field label="Date" required>
                                <Input type="date" />
                              </Field>
                              <Field label="Référence T1" required>
                                <Input value={d.t1} />
                              </Field>
                              <Field label="Date T1">
                                <Input type="date" />
                              </Field>
                              <Field label="Information page info">
                                <Input />
                              </Field>
                              <Field label="Quantité totale" required>
                                <Input type="number" />
                              </Field>
                              <Field label="Information">
                                <Input />
                              </Field>
                              <Field label="Poids (kg)" required>
                                <Input type="number" />
                              </Field>
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

          <TabsContent value="rapport" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Données de représentation</h3>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Recherche par réf. DRA…"
                  value={searchDRA}
                  onChange={(e) => setSearchDRA(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="max-w-[180px]"
                />
                <Input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="max-w-[180px]"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchDRA("");
                    setDateDebut("");
                    setDateFin("");
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
            <Panel title={`Rapport de présentation (${filteredRepr.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Réf. dossier</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Réf. DRA</th>
                      <th className="px-3 py-2">T1</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Bureau repr.</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRepr.slice(0, 20).map((d) => (
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/dossiers/$dossierId"
                            params={{ dossierId: d.id }}
                            className="text-accent hover:underline font-mono text-xs"
                          >
                            {d.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2">{d.date}</td>
                        <td className="px-3 py-2">{d.bureauRepr}</td>
                        <td className="px-3 py-2 capitalize">{d.status.replace("_", " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="traites" className="mt-4">
            <Panel title="Dossiers traités">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Réf. dossier</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Date traitement</th>
                      <th className="px-3 py-2">Agent</th>
                      <th className="px-3 py-2">Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traites.map((d) => (
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/dossiers/$dossierId"
                            params={{ dossierId: d.dossierId }}
                            className="text-accent hover:underline font-mono text-xs"
                          >
                            {d.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2">{d.dateTraitement}</td>
                        <td className="px-3 py-2">{d.agent}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${d.resultat === "conforme" ? "bg-success/15 text-success" : d.resultat === "non_conforme" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                          >
                            {d.resultat.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
