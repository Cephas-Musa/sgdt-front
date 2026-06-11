import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, FileCheck, FolderKanban, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DashHeader, StatCard, Panel } from "@/dashboards/_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApi, apiGetDossiers, apiGetApurements, apiCreateApurement, apiUpdateApurementStatus } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";

export const Route = createFileRoute("/app/appurement")({
  component: AppurementPage,
});

function AppurementPage() {
  const { user } = useAuth();
  const { data: rawDossiers, reload: reloadDossiers } = useApi(apiGetDossiers as any);
  const { data: rawApurements, reload: reloadApurements } = useApi(apiGetApurements as any);

  const dossiers = (rawDossiers as any[]) || [];
  const apurements = (rawApurements as any[]) || [];

  const [searchRef, setSearchRef] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [foundDossier, setFoundDossier] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleSearch = () => {
    const q = searchRef.toUpperCase().trim();
    const found = dossiers.find(
      (d: any) =>
        d.reference?.toUpperCase() === q &&
        (!searchYear || d.date?.startsWith(searchYear))
    );
    setFoundDossier(found || null);
  };

  const handleValidate = async (id: string, status: string) => {
    try {
      await apiUpdateApurementStatus(id, status);
      toast.success(`Apurement ${status === "valide" ? "validé" : "rejeté"}`);
      reloadApurements();
    } catch (e: any) {
      const detail = e?.data?.error || e?.message || "Erreur";
      toast.error(detail, { duration: 8000 });
      console.error("Validation error:", e?.data || e);
    }
  };

  const filteredApurements = apurements.filter((a: any) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "soumis") return a.status === "soumis";
    if (filterStatus === "validé") return a.status === "valide";
    if (filterStatus === "rejeté") return a.status === "rejete";
    return true;
  });

  const enAttente = apurements.filter((a: any) => a.status === "soumis").length;
  const valides = apurements.filter((a: any) => a.status === "valide").length;
  const rejetes = apurements.filter((a: any) => a.status === "rejete").length;

  const canManage = user?.role === "inspecteur_chef" || user?.role === "secretaire_inspecteur";

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Appurement — Gestion et validation des apurements" />

      {canManage && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={Search} label="En attente" value={enAttente} hint="Soumissions en cours" />
            <StatCard icon={FileCheck} label="Validés" value={valides} />
            <StatCard icon={FolderKanban} label="Rejetés" value={rejetes} />
          </div>

          {/* Recherche dossier pour apurement direct */}
          <Panel title="Rechercher un dossier à apurer">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Référence dossier</label>
                <Input placeholder="RD-…" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="max-w-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Année</label>
                <Input placeholder="2025" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} className="max-w-[120px]" />
              </div>
              <Button onClick={handleSearch}><Search className="mr-1 h-4 w-4" />Chercher</Button>
            </div>
            {foundDossier && (
              <div className="mt-3 rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">{foundDossier.reference}</span> — {foundDossier.importateur}
                    <Badge variant="outline" className="ml-2">{foundDossier.status}</Badge>
                    {foundDossier.dra && <span className="ml-3 text-xs text-muted-foreground">DRA: <span className="font-mono">{foundDossier.dra}</span></span>}
                  </div>
                  <FormDialog
                    trigger={<Button size="sm"><FileText className="mr-1 h-3.5 w-3.5" />Apurer</Button>}
                    title={`Apurement direct — ${foundDossier.reference}`}
                    onSubmit={async (formData: any) => {
                      try {
                        await apiCreateApurement({
                          dossier_id: foundDossier.id,
                          ref_douane: formData.ref_douane || "",
                          date_reference_douane: formData.date_reference_douane || null,
                          dra: formData.dra || foundDossier.dra || "",
                          dra_date: formData.dra_date || null,
                          date_apurement: formData.date_apurement || "",
                          t1: formData.t1 || "",
                          t1_date: formData.t1_date || null,
                          plaque_avant: formData.plaque_avant || null,
                          plaque_arriere: formData.plaque_arriere || null,
                          observation: formData.observation || null,
                        });
                        toast.success("Apurement soumis avec succès");
                        setFoundDossier(null);
                        reloadDossiers();
                        reloadApurements();
                      } catch (e: any) {
                        toast.error(e?.message || "Erreur lors de la soumission");
                      }
                    }}
                  >
                    <div className="mb-3 rounded-md bg-accent/10 p-3 text-sm">
                      <span className="font-medium">Dossier:</span> {foundDossier.reference} — {foundDossier.importateur}<br />
                      {foundDossier.dra && <><span className="font-medium">DRA dossier:</span> <span className="font-mono">{foundDossier.dra}</span></>}
                    </div>
                    <FormGrid>
                      <Field label="Référence Douane" required>
                        <Input name="ref_douane" placeholder="E-…" required />
                      </Field>
                      <Field label="Date Réf. Douane">
                        <Input name="date_reference_douane" type="date" />
                      </Field>
                      <Field label="Référence DRA">
                        <Input name="dra" defaultValue={foundDossier.dra || ""} />
                      </Field>
                      <Field label="Date DRA">
                        <Input name="dra_date" type="date" />
                      </Field>
                      <Field label="Date Apurement" required>
                        <Input name="date_apurement" type="date" required />
                      </Field>
                      <Field label="Référence T1">
                        <Input name="t1" placeholder="N° T1" />
                      </Field>
                      <Field label="Date T1">
                        <Input name="t1_date" type="date" />
                      </Field>
                      <Field label="Plaque Avant">
                        <Input name="plaque_avant" placeholder="Immatriculation avant" />
                      </Field>
                      <Field label="Plaque Arrière">
                        <Input name="plaque_arriere" placeholder="Immatriculation arrière" />
                      </Field>
                      <Field label="Observation">
                        <Input name="observation" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                </div>
              </div>
            )}
          </Panel>

          {/* Filtres */}
          <div className="flex gap-2">
            {["all", "soumis", "validé", "rejeté"].map((f) => (
              <Button key={f} variant={filterStatus === f ? "default" : "outline"} size="sm" onClick={() => setFilterStatus(f)}>
                {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <Panel title="Soumissions">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-3 py-2">Réf. dossier</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Réf. douane</th>
                    <th className="px-3 py-2">DRA soumis</th>
                    <th className="px-3 py-2">Soumis par</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApurements.map((a: any) => {
                    const isRejectedVerif = a.status === "rejete" && a.type_appurement === "verification";
                    return (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: a.dossier_id }} className="text-accent hover:underline font-mono text-xs">
                            {a.dossier?.reference || a.dossier_id}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{a.dossier?.importateur || "—"}</td>
                        <td className="px-3 py-2 capitalize">{a.type_appurement || "administratif"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.ref_douane || "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.dra || "—"}</td>
                        <td className="px-3 py-2">{a.submitter?.full_name || a.secretaire?.full_name || "—"}</td>
                        <td className="px-3 py-2">{a.date_soumission ? new Date(a.date_soumission).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant={a.status === "valide" ? "default" : a.status === "rejete" ? "destructive" : "secondary"}>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 flex gap-1">
                          {a.status === "soumis" && (
                            <>
                              <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleValidate(a.id, "valide")}>
                                Valider
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleValidate(a.id, "rejete")}>
                                Rejeter
                              </Button>
                            </>
                          )}
                          {isRejectedVerif && (
                            <FormDialog
                              trigger={<Button size="sm" variant="outline" className="h-7 text-xs"><FileText className="mr-1 h-3 w-3" />Apurer</Button>}
                              title={`Apurer le dossier — ${a.dossier?.reference || a.dossier_id}`}
                              onSubmit={async (formData: any) => {
                                try {
                                  await apiCreateApurement({
                                    dossier_id: a.dossier_id,
                                    ref_douane: formData.ref_douane || "",
                                    date_reference_douane: formData.date_reference_douane || null,
                                    dra: formData.dra || a.dossier?.dra || "",
                                    dra_date: formData.dra_date || null,
                                    date_apurement: formData.date_apurement || "",
                                    t1: formData.t1 || "",
                                    t1_date: formData.t1_date || null,
                                    plaque_avant: formData.plaque_avant || null,
                                    plaque_arriere: formData.plaque_arriere || null,
                                    observation: formData.observation || null,
                                  });
                                  toast.success("Apurement soumis avec succès");
                                  reloadDossiers();
                                  reloadApurements();
                                } catch (e: any) {
                                  toast.error(e?.message || "Erreur lors de la soumission");
                                }
                              }}
                            >
                              <div className="mb-3 rounded-md bg-accent/10 p-3 text-sm">
                                <span className="font-medium">Dossier:</span> {a.dossier?.reference || a.dossier_id} — {a.dossier?.importateur}<br />
                                {a.dossier?.dra && <><span className="font-medium">DRA dossier:</span> <span className="font-mono">{a.dossier.dra}</span> — </>}
                                <span className="font-medium">DRA soumis:</span> <span className="font-mono">{a.dra || "—"}</span>
                              </div>
                              <FormGrid>
                                <Field label="Référence Douane" required>
                                  <Input name="ref_douane" placeholder="E-…" required />
                                </Field>
                                <Field label="Date Réf. Douane">
                                  <Input name="date_reference_douane" type="date" />
                                </Field>
                                <Field label="Référence DRA">
                                  <Input name="dra" defaultValue={a.dossier?.dra || ""} />
                                </Field>
                                <Field label="Date DRA">
                                  <Input name="dra_date" type="date" />
                                </Field>
                                <Field label="Date Apurement" required>
                                  <Input name="date_apurement" type="date" required />
                                </Field>
                                <Field label="Référence T1">
                                  <Input name="t1" placeholder="N° T1" />
                                </Field>
                                <Field label="Date T1">
                                  <Input name="t1_date" type="date" />
                                </Field>
                                <Field label="Plaque Avant">
                                  <Input name="plaque_avant" placeholder="Immatriculation avant" />
                                </Field>
                                <Field label="Plaque Arrière">
                                  <Input name="plaque_arriere" placeholder="Immatriculation arrière" />
                                </Field>
                                <Field label="Observation">
                                  <Input name="observation" />
                                </Field>
                              </FormGrid>
                            </FormDialog>
                          )}
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: a.dossier_id }}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">Voir</Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredApurements.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">Aucune soumission</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}

    </div>
  );
}
