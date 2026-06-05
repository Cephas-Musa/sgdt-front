import { useState, useMemo, useRef } from "react";
import { FolderKanban, Package, History, Loader2, UserCheck } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useApi, apiGetDossiers, apiGetColisageRapports, apiGetColisageAffectations, apiStoreColisageRapport } from "@/lib/api";

import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function AgentPointageDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { data: rawAffectations } = useApi(apiGetColisageAffectations);
  const { data: rawRapports, reload: refetchRapports } = useApi(apiGetColisageRapports);
  const allDossiers = (rawDossiers as any[]) || [];
  const affectations = (rawAffectations as any[]) || [];
  const rapports = (rawRapports as any[]) || [];

  // Only show dossiers assigned to this agent
  const assignedIds = new Set(affectations.map((a: any) => a.dossier_id));
  const activeDossiers = useMemo(() => allDossiers.filter((d) => assignedIds.has(d.id)), [allDossiers, affectations]);

  const getType = (d: any) => (d.type || "").toLowerCase();

  const [colisageOpen, setColisageOpen] = useState(false);
  const [colisageTarget, setColisageTarget] = useState<{ id: string; ref: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nbColisRef = useRef<HTMLInputElement>(null);
  const poidsRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <DashHeader subtitle="Agent de Pointage — dossiers, colisage et historique" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserCheck} label="Affectations" value={affectations.length} hint="dossiers assignés" />
        <StatCard icon={FolderKanban} label="Dossiers à traiter" value={activeDossiers.length} />
        <StatCard icon={Package} label="Colisages soumis" value={rapports.length} />
        <StatCard
          icon={History}
          label="Validés"
          value={rapports.filter((c: any) => c.statut === "valide").length}
          hint="par le chef"
        />
      </div>

      <div className="mt-6">
        {affectations.length === 0 ? (
          <div className="rounded-2xl border border-accent/10 bg-background p-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg mb-1">Aucune affectation</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Vous n&apos;avez pas encore reçu d&apos;affectation. Le Chef Entrepôt Douane vous assignera des dossiers dès que nécessaire.
            </p>
          </div>
        ) : (
          <Panel title="Liste des dossiers">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-3 py-2">Nº</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Réf. dossier</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Véhicule</th>
                    <th className="px-3 py-2">DRA</th>
                    <th className="px-3 py-2">T1</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeDossiers.slice(0, 50).map((d, i) => (
                    <tr
                      key={d.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">
                        <Link
                          to="/app/dossiers/$dossierId"
                          params={{ dossierId: d.id }}
                          className="text-accent hover:underline font-medium"
                        >
                          {d.importateur}
                        </Link>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{d.reference}</td>
                      <td className="px-3 py-2 text-xs uppercase text-muted-foreground">{getType(d)}</td>
                      <td className="px-3 py-2">{d.vehicule}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => { setColisageTarget({ id: d.id, ref: d.reference }); setColisageOpen(true); }}>
  <Package className="mr-1 h-3.5 w-3.5" />
  Colisage
</Button>
                      </td>
                    </tr>
                  ))}
                  {activeDossiers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                        Aucune affectation reçue. En attente d'un dossier...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>

      {/* Historique des colisages */}
      <div className="mt-6">
        <Panel
          title="Historique des colisages soumis"
          actions={
            <span className="text-xs text-muted-foreground">{rapports.length} colisages</span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Réf. colisage</th>
                  <th className="px-3 py-2">Dossier</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Colis</th>
                  <th className="px-3 py-2">Poids (kg)</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((c: any) => {
                  const premiereLigne = c.lignes?.[0];
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                      <td className="px-3 py-2">
                        <Link
                          to="/app/dossiers/$dossierId"
                          params={{ dossierId: c.dossier_id }}
                          className="text-accent hover:underline font-mono text-xs"
                        >
                          {c.dossier?.reference || c.dossier_id}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {c.date_soumission ? new Date(c.date_soumission).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-3 py-2">{c.total_quantite}</td>
                      <td className="px-3 py-2">{c.total_poids?.toLocaleString()}</td>
                      <td className="px-3 py-2 truncate max-w-[200px]">{premiereLigne?.description || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${c.statut === "valide" ? "bg-success/15 text-success" : c.statut === "rejete" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                        >
                          {c.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <Dialog open={colisageOpen} onOpenChange={setColisageOpen}>
        <DialogContent key={colisageTarget?.id || "new"} className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapport de colisage</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Référence dossier</label>
                <Input value={colisageTarget?.ref || ""} readOnly />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Nombre de colis <span className="text-destructive"> *</span></label>
                <Input ref={nbColisRef} type="number" min="1" defaultValue="1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Poids total (kg) <span className="text-destructive"> *</span></label>
                <Input ref={poidsRef} type="number" min="0" step="0.1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description marchandise <span className="text-destructive"> *</span></label>
                <Input ref={descRef} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColisageOpen(false)}>Annuler</Button>
            <Button onClick={async () => {
              if (!colisageTarget) return;
              const nombreColis = parseInt(nbColisRef.current?.value || "1") || 1;
              const poidsTotal = parseFloat(poidsRef.current?.value || "0") || 0;
              const description = descRef.current?.value || "";
              if (!description.trim()) { toast.error("Veuillez saisir une description."); return; }
              if (poidsTotal <= 0) { toast.error("Veuillez saisir un poids valide (> 0)."); return; }
              setSubmitting(true);
              try {
                await apiStoreColisageRapport({
                  dossier_id: colisageTarget.id,
                  lignes: [{ description, quantite: nombreColis, poidsParColis: poidsTotal, poidsTotal }],
                  total_quantite: nombreColis,
                  total_poids: poidsTotal,
                  notes: "",
                });
                toast.success("Colisage soumis avec succès");
                setColisageOpen(false);
                refetchRapports();
              } catch (e: any) {
                toast.error(e?.message || "Erreur lors de la soumission du colisage");
              } finally {
                setSubmitting(false);
              }
            }} disabled={submitting}>
              {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Package className="mr-1 h-4 w-4" />}
              {submitting ? "Envoi..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


