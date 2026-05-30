import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { Search, Eye, CheckCircle2, XCircle, FileCheck, Filter } from "lucide-react";
import { useApi, apiGetDossiers, apiGetApurements } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/appurement")({
  component: ApurementPage,
});

const statusColor = (s: string) =>
  s === "validé" || s === "apure"
    ? "bg-success/15 text-success"
    : s === "rejeté"
      ? "bg-destructive/15 text-destructive"
      : "bg-warning/15 text-warning";

function ApurementPage() {
  const { user } = useAuth();
  const isInspecteur = user?.role === "inspecteur_chef";
  const isSecretaire = user?.role === "secretaire_inspecteur";

  const [filter, setFilter] = useState<"all" | "soumis" | "validé" | "rejeté">("all");
  const [searchRef, setSearchRef] = useState("");

  const { data: rawApurements } = useApi(apiGetApurements);
  const { data: rawDossiers } = useApi(apiGetDossiers);
  type Apurement = { id: number|string; dossierRef?: string; dossier_ref?: string; importateur?: string; type?: string; refDouane?: string; ref_douane?: string; secretaireNom?: string; dateSoumission?: string; created_at?: string; status: string; dossierId?: number|string; dossier_id?: number|string };
  type Dossier = { id: number|string; reference: string; importateur?: string; type?: string; date?: string; status: string; refDouane?: string };

  const allApurements = (rawApurements as Apurement[] ?? []);
  const allDossiers = (rawDossiers as Dossier[] ?? []);

  const submissions = allApurements.filter((a) => {
    const ref = a.dossierRef ?? a.dossier_ref ?? "";
    if (filter !== "all" && a.status !== filter) return false;
    if (searchRef && !ref.toLowerCase().includes(searchRef.toLowerCase())) return false;
    return true;
  });

  const soumisCount = allApurements.filter((a) => a.status === "soumis").length;
  const valideCount = allApurements.filter((a) => a.status === "validé").length;
  const rejeteCount = allApurements.filter((a) => a.status === "rejeté").length;

  /* Apurement search (secrétaire) */
  const [secSearchRef, setSecSearchRef] = useState("");
  const [secSearchYear, setSecSearchYear] = useState("");
  const [foundDossier, setFoundDossier] = useState<Dossier | null>(null);
  const [showApurForm, setShowApurForm] = useState(false);
  const [apurE, setApurE] = useState("");
  const [apurNumero, setApurNumero] = useState("");
  const [apurDate, setApurDate] = useState("");

  const handleSecSearch = () => {
    const found = allDossiers.find((d) =>
      (d.reference || "").toLowerCase().includes(secSearchRef.toLowerCase()),
    );
    if (!found) {
      toast.error("Aucun dossier trouvé.");
      setFoundDossier(null);
      return;
    }
    if (found.status === "attente_paiement" || found.status === "brouillon") {
      toast.error("Ce dossier doit être payé et vérifié avant apurement.");
      setFoundDossier(null);
      return;
    }
    setFoundDossier(found);
  };

  return (
    <div>
      <PageHeader
        title="Apurement"
        description={
          isInspecteur
            ? "Supervision des apurements soumis par vos secrétaires"
            : "Recherche et soumission d'apurements"
        }
      />

      {/* Stats */}
      <div className="mb-6 grid gap-3 grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-warning">{soumisCount}</div>
          <div className="text-xs text-muted-foreground mt-1">En attente</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-success">{valideCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Validés</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{rejeteCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Rejetés</div>
        </div>
      </div>

      {/* ── INSPECTEUR: Supervision ── */}
      {isInspecteur && (
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <h2 className="font-medium flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-accent" />
              Apurements soumis ({submissions.length})
            </h2>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Recherche réf…"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-48"
              />
              <div className="flex gap-1">
                {(["all", "soumis", "validé", "rejeté"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f)}
                    className="text-xs capitalize"
                  >
                    {f === "all" ? "Tous" : f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Réf. dossier</th>
                  <th className="px-3 py-2">Importateur</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Réf. douane</th>
                  <th className="px-3 py-2">Secrétaire</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((ap) => (
                  <tr
                    key={ap.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs font-medium">{ap.dossierRef ?? ap.dossier_ref}</td>
                    <td className="px-3 py-2">{ap.importateur}</td>
                    <td className="px-3 py-2 capitalize">{ap.type}</td>
                    <td className="px-3 py-2 font-mono text-xs">{ap.refDouane ?? ap.ref_douane}</td>
                    <td className="px-3 py-2">{ap.secretaireNom}</td>
                    <td className="px-3 py-2 text-xs">{ap.dateSoumission ?? ap.created_at?.split("T")[0]}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${statusColor(ap.status)}`}
                      >
                        {ap.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Link to="/app/dossiers/$dossierId" params={{ dossierId: ap.dossierId }}>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {ap.status === "soumis" && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 gap-1 px-2 bg-success hover:bg-success/90 text-success-foreground"
                              onClick={() => toast.success(`Apurement ${ap.dossierRef} validé ✓`)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Valider
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 gap-1 px-2"
                              onClick={() => toast.error(`Apurement ${ap.dossierRef} rejeté`)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      Aucun apurement trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECRÉTAIRE: Recherche + Apurement ── */}
      {isSecretaire && (
        <div className="space-y-4">
          {/* Recherche dossier pour apurement */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-accent" />
              Recherche dossier pour apurement
            </h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium">Référence dossier (RD)</label>
                <Input
                  placeholder="DSR/2025/…"
                  value={secSearchRef}
                  onChange={(e) => setSecSearchRef(e.target.value)}
                  className="w-56"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Année</label>
                <Input
                  placeholder="2026"
                  value={secSearchYear}
                  onChange={(e) => setSecSearchYear(e.target.value)}
                  className="w-28"
                />
              </div>
              <Button onClick={handleSecSearch} className="gap-1.5">
                <Search className="h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </div>

          {/* Tableau résultats apurement */}
          {foundDossier && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-4 py-3 bg-muted/30">
                  <h4 className="font-medium text-sm">Résultats — {foundDossier.reference}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 w-10">N°</th>
                        <th className="px-3 py-2">Importateur</th>
                        <th className="px-3 py-2">Référence dossier</th>
                        <th className="px-3 py-2">Référence RD (Douane)</th>
                        <th className="px-3 py-2">Apurer dossier</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">1</span>
                        </td>
                        <td className="px-3 py-2 font-medium text-xs">{foundDossier.importateur}</td>
                        <td className="px-3 py-2 font-mono text-xs font-bold text-accent">{foundDossier.reference}</td>
                        <td className="px-3 py-2 font-mono text-xs">{foundDossier.refDouane || "E-0000"}</td>
                        <td className="px-3 py-2">
                          <Button
                            size="sm"
                            className="h-7 gap-1.5 text-xs bg-accent hover:bg-accent/90 text-white"
                            onClick={() => setShowApurForm(true)}
                          >
                            <FileCheck className="h-3.5 w-3.5" />
                            Apurer dossier
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Formulaire d'apurement */}
              {showApurForm && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 animate-in fade-in duration-200">
                  <h5 className="font-medium mb-3 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-accent" />
                    Formulaire d'apurement — {foundDossier.reference}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">E</label>
                      <Input
                        placeholder="E-001"
                        value={apurE}
                        onChange={(e) => setApurE(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Numéro</label>
                      <Input
                        type="number"
                        placeholder="4345"
                        value={apurNumero}
                        onChange={(e) => setApurNumero(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Date</label>
                      <Input
                        type="date"
                        value={apurDate}
                        onChange={(e) => setApurDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        toast.success("Apurement ajouté avec succès ✓");
                        setFoundDossier(null);
                        setSecSearchRef("");
                        setShowApurForm(false);
                        setApurE("");
                        setApurNumero("");
                        setApurDate("");
                      }}
                      className="gap-1.5"
                    >
                      <FileCheck className="h-4 w-4" />
                      Ajouter
                    </Button>
                    <Button variant="outline" onClick={() => setShowApurForm(false)}>Annuler</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historique soumissions */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Mes soumissions</h3>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-3 py-2">Réf.</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Réf. douane</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {allApurements.map((ap) => (
                    <tr key={ap.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{ap.dossierRef ?? ap.dossier_ref}</td>
                      <td className="px-3 py-2">{ap.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{ap.refDouane ?? ap.ref_douane}</td>
                      <td className="px-3 py-2 text-xs">{ap.dateSoumission ?? ap.created_at?.split("T")[0]}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${statusColor(ap.status)}`}
                        >
                          {ap.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Autres rôles: vue basique ── */}
      {!isInspecteur && !isSecretaire && (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-medium">Dossiers apurés récemment</h2>
          </div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Réf.</th>
                  <th className="px-3 py-2">Importateur</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {allDossiers.filter((d) => d.status === "apure")
                  .slice(0, 12)
                  .map((d) => (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{d.reference}</td>
                      <td className="px-3 py-2">{d.importateur}</td>
                      <td className="px-3 py-2 capitalize">{d.type}</td>
                      <td className="px-3 py-2 text-xs">{d.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
