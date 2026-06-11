import { useState } from "react";
import { FileCheck, Search, FolderKanban, FileText, Eye } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers, apiGetApurements, apiCreateApurement, apiGetDossierAggregate, apiCreateApurementVerificateur } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function VerificateurDash() {
  const { data: rawDossiers, reload: reloadDossiers } = useApi(apiGetDossiers);
  const { data: rawApurements, reload: reloadApurements } = useApi(apiGetApurements);

  const activeDossiers = (rawDossiers as any[]) || [];
  const apurements = (rawApurements as any[]) || [];

  const [searchRef, setSearchRef] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchDRA, setSearchDRA] = useState("");

  const filtered = activeDossiers.filter((d) => {
    if (searchRef && !(d.reference || "").toLowerCase().includes(searchRef.toLowerCase())) return false;
    if (searchYear && !d.date?.startsWith(searchYear)) return false;
    return true;
  });

  const filteredRepr = activeDossiers.filter((d) => {
    if (searchDRA && !(d.dra || "").toLowerCase().includes(searchDRA.toLowerCase())) return false;
    if (dateDebut && d.date < dateDebut) return false;
    if (dateFin && d.date > dateFin) return false;
    return true;
  });

  const traites = apurements.filter((a: any) => a.type_appurement === 'verification');

  const handleApurementSubmit = async (d: any, formData: Record<string, string>) => {
    try {
      await apiCreateApurementVerificateur({
        dossier_id: d.id,
        ref_douane: formData.ref_douane || "",
        date_reference_douane: formData.date_reference_douane || null,
        dra: formData.dra || d.dra || "",
        dra_date: formData.dra_date || null,
        date_apurement: formData.date_apurement || "",
        t1: formData.t1 || "",
        plaque_avant: formData.plaque_avant || "",
        plaque_arriere: formData.plaque_arriere || "",
        quantite_totale: formData.quantite_totale || null,
        poids: formData.poids || null,
        information: formData.information || "",
        observation: formData.observation || "",
      });
      toast.success("Apurement vérificateur enregistré");
      reloadDossiers();
      reloadApurements();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div>
      <DashHeader subtitle="Vérificateur — recherche dossiers, appurement, rapports" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={activeDossiers.length} />
        <StatCard icon={FileCheck} label="Soumissions" value={traites.filter((a) => a.status === 'soumis').length} />
        <StatCard icon={FileCheck} label="Traités" value={traites.filter((a) => a.status === 'valide' || a.status === 'rejete').length} />
        <StatCard icon={Search} label="En vérification" value={activeDossiers.filter((d) => d.status === "en_cours" || d.status === "verifie").length} />
        <StatCard icon={FileText} label="Apurés" value={activeDossiers.filter((d) => d.status === "apure").length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList>
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="rapport">Rapport de présentation</TabsTrigger>
            <TabsTrigger value="traites">Dossiers traités</TabsTrigger>
          </TabsList>

          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 font-medium">Recherche de dossier</h3>
              <div className="flex flex-wrap gap-3">
                <Input placeholder="Référence du document…" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="max-w-xs" />
                <Input placeholder="Année (ex: 2025)" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} className="max-w-[150px]" />
                <Button variant="outline" onClick={() => { setSearchRef(""); setSearchYear(""); }}>Réinitialiser</Button>
              </div>
            </div>

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
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 20).map((d, i) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline font-mono text-xs">{d.reference}</Link>
                        </td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2">{d.nbTitres ?? "—"}</td>
                        <td className="px-3 py-2">{d.nbDeclarations ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <FormDialog
                            trigger={<Button size="sm" variant="outline"><FileCheck className="mr-1 h-3.5 w-3.5" />Appurement</Button>}
                            title={`Apurement vérificateur — ${d.reference}`}
                            onSubmit={(formData) => handleApurementSubmit(d, formData)}
                          >
                            <div className="mb-3 rounded-md bg-accent/10 p-3 text-sm">
                              <span className="font-medium">Dossier:</span> {d.reference} — {d.importateur}
                            </div>
                            <FormGrid>
                              <Field label="Référence douane" required>
                                <Input name="ref_douane" placeholder="E-…" required />
                              </Field>
                              <Field label="Date Réf. Douane">
                                <Input name="date_reference_douane" type="date" />
                              </Field>
                              <Field label="Référence DRA" required>
                                <Input name="dra" defaultValue={d.dra || ""} required />
                              </Field>
                              <Field label="Date DRA">
                                <Input name="dra_date" type="date" />
                              </Field>
                              <Field label="Date" required>
                                <Input name="date_apurement" type="date" required />
                              </Field>
                              <Field label="Référence T1">
                                <Input name="t1" placeholder="N° T1" />
                              </Field>
                              <Field label="Plaque Avant">
                                <Input name="plaque_avant" placeholder="Immatriculation avant" />
                              </Field>
                              <Field label="Plaque Arrière">
                                <Input name="plaque_arriere" placeholder="Immatriculation arrière" />
                              </Field>
                              <Field label="Quantité totale">
                                <Input name="quantite_totale" type="number" />
                              </Field>
                              <Field label="Poids (kg)">
                                <Input name="poids" type="number" />
                              </Field>
                              <Field label="Information">
                                <Input name="information" placeholder="Case 18 DAV / infos complémentaires" />
                              </Field>
                              <Field label="Observation">
                                <Input name="observation" />
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
                <Input placeholder="Recherche par réf. DRA…" value={searchDRA} onChange={(e) => setSearchDRA(e.target.value)} className="max-w-xs" />
                <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="max-w-[180px]" />
                <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="max-w-[180px]" />
                <Button variant="outline" onClick={() => { setSearchDRA(""); setDateDebut(""); setDateFin(""); }}>Réinitialiser</Button>
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
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRepr.slice(0, 20).map((d) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline font-mono text-xs">{d.reference}</Link>
                        </td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2">{d.date}</td>
                        <td className="px-3 py-2">{d.bureauRepr || d.bureau_id}</td>
                        <td className="px-3 py-2 capitalize">{d.status?.replace("_", " ")}</td>
                        <td className="px-3 py-2 text-right">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }}>
                            <Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </td>
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
                      <th className="px-3 py-2">Type apurement</th>
                      <th className="px-3 py-2">Réf. douane</th>
                      <th className="px-3 py-2">Date soumission</th>
                      <th className="px-3 py-2">Résultat</th>
                      <th className="px-3 py-2">Validé par</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {traites.map((a: any) => (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: a.dossier_id }} className="text-accent hover:underline font-mono text-xs">{a.dossier?.reference || a.dossier_id}</Link>
                        </td>
                        <td className="px-3 py-2">{a.dossier?.importateur || "—"}</td>
                        <td className="px-3 py-2 capitalize">{a.type_appurement || "administratif"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.ref_douane || "—"}</td>
                        <td className="px-3 py-2">{a.date_soumission ? new Date(a.date_soumission).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "valide" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">{a.validator?.full_name || "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: a.dossier_id }}>
                            <Button size="sm" variant="ghost"><Eye className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {traites.length === 0 && (
                      <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Aucun dossier traité</td></tr>
                    )}
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
