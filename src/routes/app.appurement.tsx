import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { Search, Eye, CheckCircle2, XCircle, FileCheck, Filter } from "lucide-react";
import { DOSSIERS, APUREMENT_SUBMISSIONS } from "@/lib/mock";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/appurement")({
  component: ApurementPage,
});

const statusColor = (s: string) =>
  s === "validé" || s === "apure" ? "bg-success/15 text-success"
  : s === "rejeté" ? "bg-destructive/15 text-destructive"
  : "bg-warning/15 text-warning";

function ApurementPage() {
  const { user } = useAuth();
  const isInspecteur = user?.role === "inspecteur_chef";
  const isSecretaire = user?.role === "secretaire_inspecteur";

  const [filter, setFilter] = useState<"all" | "soumis" | "validé" | "rejeté">("all");
  const [searchRef, setSearchRef] = useState("");

  const submissions = APUREMENT_SUBMISSIONS.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (searchRef && !a.dossierRef.toLowerCase().includes(searchRef.toLowerCase())) return false;
    return true;
  });

  const soumisCount = APUREMENT_SUBMISSIONS.filter(a => a.status === "soumis").length;
  const valideCount = APUREMENT_SUBMISSIONS.filter(a => a.status === "validé").length;
  const rejeteCount = APUREMENT_SUBMISSIONS.filter(a => a.status === "rejeté").length;

  /* Apurement search (secrétaire) */
  const [secSearchRef, setSecSearchRef] = useState("");
  const [secSearchYear, setSecSearchYear] = useState("");
  const [foundDossier, setFoundDossier] = useState<typeof DOSSIERS[0] | null>(null);

  const handleSecSearch = () => {
    const found = DOSSIERS.find(d => d.reference.toLowerCase().includes(secSearchRef.toLowerCase()));
    if (!found) { toast.error("Aucun dossier trouvé."); setFoundDossier(null); return; }
    if (found.status === "attente_paiement" || found.status === "brouillon") {
      toast.error("Ce dossier doit être payé et vérifié avant apurement."); setFoundDossier(null); return;
    }
    setFoundDossier(found);
  };

  return (
    <div>
      <PageHeader
        title="Apurement"
        description={isInspecteur
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
              <Input placeholder="Recherche réf…" value={searchRef} onChange={e => setSearchRef(e.target.value)} className="w-48" />
              <div className="flex gap-1">
                {(["all", "soumis", "validé", "rejeté"] as const).map(f => (
                  <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
                    onClick={() => setFilter(f)} className="text-xs capitalize">
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
                {submissions.map(ap => (
                  <tr key={ap.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-mono text-xs font-medium">{ap.dossierRef}</td>
                    <td className="px-3 py-2">{ap.importateur}</td>
                    <td className="px-3 py-2 capitalize">{ap.type}</td>
                    <td className="px-3 py-2 font-mono text-xs">{ap.refDouane}</td>
                    <td className="px-3 py-2">{ap.secretaireNom}</td>
                    <td className="px-3 py-2 text-xs">{ap.dateSoumission}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(ap.status)}`}>{ap.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <Link to="/app/dossiers/$dossierId" params={{ dossierId: ap.dossierId }}>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        {ap.status === "soumis" && (
                          <>
                            <Button size="sm" className="h-7 gap-1 px-2 bg-success hover:bg-success/90 text-success-foreground"
                              onClick={() => toast.success(`Apurement ${ap.dossierRef} validé ✓`)}>
                              <CheckCircle2 className="h-3.5 w-3.5" />Valider
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 gap-1 px-2"
                              onClick={() => toast.error(`Apurement ${ap.dossierRef} rejeté`)}>
                              <XCircle className="h-3.5 w-3.5" />Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">Aucun apurement trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SECRÉTAIRE: Recherche + Soumission ── */}
      {isSecretaire && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2"><Search className="h-4 w-4 text-accent" />Recherche dossier</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-medium">Référence dossier</label>
                <Input placeholder="DSR/2025/…" value={secSearchRef} onChange={e => setSecSearchRef(e.target.value)} className="w-56" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Année</label>
                <Input placeholder="2025" value={secSearchYear} onChange={e => setSecSearchYear(e.target.value)} className="w-28" />
              </div>
              <Button onClick={handleSecSearch} className="gap-1.5"><Search className="h-4 w-4" />Rechercher</Button>
            </div>

            {foundDossier && (
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-4">
                <h4 className="font-medium mb-3">Dossier — {foundDossier.reference}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                  <div><span className="text-muted-foreground">Importateur:</span><br /><strong>{foundDossier.importateur}</strong></div>
                  <div><span className="text-muted-foreground">Type:</span><br /><strong className="capitalize">{foundDossier.type}</strong></div>
                  <div><span className="text-muted-foreground">Statut:</span><br /><strong className="capitalize">{foundDossier.status.replace("_", " ")}</strong></div>
                  <div><span className="text-muted-foreground">Date:</span><br /><strong>{foundDossier.date}</strong></div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <h5 className="text-sm font-medium mb-3">Formulaire d'apurement</h5>
                  <FormGrid>
                    <Field label="Réf. douane (E-XXX)" required><Input placeholder="E-001" /></Field>
                    <Field label="Date" required><Input type="date" /></Field>
                  </FormGrid>
                  <Button className="mt-3" onClick={() => {
                    toast.success("Apurement soumis. En attente de validation.");
                    setFoundDossier(null); setSecSearchRef("");
                  }}>Soumettre apurement</Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">⚠ Le dossier doit être payé et vérifié avant soumission.</p>
              </div>
            )}
          </div>

          {/* Historique */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Mes soumissions</h3></div>
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
                  {APUREMENT_SUBMISSIONS.map(ap => (
                    <tr key={ap.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{ap.dossierRef}</td>
                      <td className="px-3 py-2">{ap.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{ap.refDouane}</td>
                      <td className="px-3 py-2 text-xs">{ap.dateSoumission}</td>
                      <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${statusColor(ap.status)}`}>{ap.status}</span></td>
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
          <div className="border-b border-border p-4"><h2 className="font-medium">Dossiers apurés récemment</h2></div>
          <div className="p-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr><th className="px-3 py-2">Réf.</th><th className="px-3 py-2">Importateur</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Date</th></tr>
              </thead>
              <tbody>
                {DOSSIERS.filter(d => d.status === "apure").slice(0, 12).map(d => (
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
