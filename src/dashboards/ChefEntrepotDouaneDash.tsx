import { useState, useMemo } from "react";
import { Search, UserCheck, ListChecks, X, Plus, Minus, Trash2, Scale, CheckCircle2, AlertTriangle, Loader2, FileText, FolderKanban, Users, ArrowRight, ThumbsUp, ThumbsDown, History } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useApi, apiGetUsers, apiGetColisageAffectations, apiGetColisageRapports, apiSearchDossier, apiStoreColisageAffectation, apiGetColisageRapportByDossier, apiUpdateColisageRapportStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export default function ChefEntrepotDouaneDash() {
  const { user } = useAuth();
  const { data: rawUsers } = useApi(apiGetUsers);
  const { data: rawAffectations, reload: reloadAffectations } = useApi(apiGetColisageAffectations);
  const { data: rawRapports, reload: reloadRapports } = useApi(apiGetColisageRapports);

  const agents = useMemo(() => {
    const allAgents = (rawUsers as any[] || []).filter((u: any) => u.role === "agent_pointage");

    // Filtrer par hiérarchie: agents créés ou gérés par ce chef
    const filtered = allAgents.filter((u: any) =>
      u.parent_id === user?.id ||  // Agent créé par ce chef
      u.chef_entrepot_id === user?.id ||  // Agent assigné à ce chef
      u.created_by === user?.id  // Agent créé en compte par ce chef
    );

    return filtered.length > 0 ? filtered : allAgents;
  }, [rawUsers, user]);

  const affectations = (rawAffectations as any[]) || [];
  const rapports = (rawRapports as any[]) || [];

  const [searchRef, setSearchRef] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [foundDossier, setFoundDossier] = useState<any>(null);

  const [affectDossier, setAffectDossier] = useState<any>(null);
  const [agentChoisi, setAgentChoisi] = useState("");

  const [rapportOuvert, setRapportOuvert] = useState<any>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [rejetMotif, setRejetMotif] = useState("");

  const [showHistorique, setShowHistorique] = useState(false);

  const buildReference = (raw: string) => {
    const s = raw.trim().toUpperCase().replace(/^RD-?/i, "");
    return s ? `RD-${s}` : "";
  };

  const handleSearch = async () => {
    const ref = buildReference(searchRef);
    if (!ref) return;
    setSearchLoading(true);
    setSearchError("");
    setFoundDossier(null);
    try {
      const dossier = await apiSearchDossier(ref);
      setFoundDossier(dossier);
    } catch {
      setSearchError("Dossier introuvable. Vérifiez la référence.");
    } finally {
      setSearchLoading(false);
    }
  };

  const getAffectationFor = (dossierId: string) => affectations.find((a: any) => a.dossier_id === dossierId);
  const getRapportFor = (dossierId: string) => rapports.find((r: any) => r.dossier_id === dossierId);

  const handleAffectation = async () => {
    if (!affectDossier || !agentChoisi) { toast.error("Choisissez un agent."); return; }
    try {
      await apiStoreColisageAffectation({
        dossier_id: String(affectDossier.id),
        agent_id: parseInt(agentChoisi, 10)
      });
      toast.success("Agent affecté avec succès.");
      setAffectDossier(null);
      setAgentChoisi("");
      reloadAffectations();
    } catch (error: any) {
      console.error("Erreur affectation:", error);
      toast.error(error?.message || "Erreur lors de l'affectation.");
    }
  };

  const ouvrirRapport = async (dossierId: string) => {
    try {
      const rapport = await apiGetColisageRapportByDossier(dossierId);
      setRapportOuvert(rapport);
      setRejetMotif("");
    } catch {
      toast.warning("Aucun rapport soumis pour ce dossier.");
    }
  };

  const handleValidation = async (statut: "valide" | "rejete") => {
    if (!rapportOuvert) return;
    if (statut === "rejete" && !rejetMotif.trim()) { toast.error("Veuillez saisir le motif du rejet."); return; }
    setValidationLoading(true);
    try {
      await apiUpdateColisageRapportStatus(rapportOuvert.id, {
        statut,
        motif_rejet: statut === "rejete" ? rejetMotif : undefined,
        notes_chef: rapportOuvert.notes_chef || null,
        lignes_chef: rapportOuvert.lignes_chef || null,
      });
      toast.success(`Rapport ${statut === "valide" ? "validé" : "rejeté"}.`);
      setRapportOuvert(null);
      reloadRapports();
    } catch {
      toast.error("Erreur lors de la validation.");
    } finally {
      setValidationLoading(false);
    }
  };

  const recentAffectations = affectations.slice(0, 10);

  return (
    <div>
      <DashHeader subtitle="Chef Entrepôt Douane — recherche, affectation, validation colisage" />

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard icon={FolderKanban} label="Affectations" value={affectations.length} />
        <StatCard icon={Users} label="Agents pointage" value={agents.length} />
        <StatCard icon={ListChecks} label="Rapports soumis" value={rapports.filter((r: any) => r.statut === "soumis").length} />
        <StatCard icon={CheckCircle2} label="Rapports validés" value={rapports.filter((r: any) => r.statut === "valide").length} />
      </div>

      <div className="mt-6 space-y-6">
        {/* ─── RECHERCHE PAR RÉFÉRENCE ─── */}
        <Panel title="Rechercher un dossier">
          <div className="flex gap-3 items-end">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <div className="flex items-center">
                <span className="pl-9 pr-1 text-sm font-bold font-mono text-accent pointer-events-none z-10 select-none">RD-</span>
                <Input
                  className="pl-1 rounded-xl border-accent/20 font-mono font-bold tracking-wider"
                  placeholder="0000"
                  value={searchRef}
                  onChange={e => setSearchRef(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Button className="rounded-xl gap-2" onClick={handleSearch} disabled={searchLoading}>
              {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </Button>
          </div>
          {searchError && <p className="text-xs text-destructive mt-2">{searchError}</p>}

          {foundDossier && (
            <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.02] p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{foundDossier.reference}</h3>
                  <p className="text-sm text-muted-foreground">{foundDossier.importateur} · {foundDossier.type}</p>
                </div>
                {user?.role !== "chef_entrepot_douane" && (
                  <Link to="/app/dossiers/$dossierId" params={{ dossierId: foundDossier.id }}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                      <FileText className="h-3.5 w-3.5" />Détail
                    </Button>
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted-foreground">DRA :</span> <strong className="font-mono">{foundDossier.dra || "—"}</strong></div>
                <div><span className="text-muted-foreground">T1 :</span> <strong className="font-mono">{foundDossier.t1 || "—"}</strong></div>
                <div><span className="text-muted-foreground">Véhicule :</span> <strong>{foundDossier.vehicule || "—"}</strong></div>
                <div><span className="text-muted-foreground">Statut :</span> <Badge variant="outline" className="text-[10px] capitalize">{foundDossier.status}</Badge></div>
              </div>

              {(() => {
                const affect = getAffectationFor(foundDossier.id);
                const rapport = getRapportFor(foundDossier.id);
                return (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-accent/10">
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => { setAffectDossier(foundDossier); setAgentChoisi(affect?.agent_id || ""); }}>
                      <UserCheck className="h-3.5 w-3.5" />
                      {affect ? "Réaffecter" : "Affecter un agent"}
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl gap-1.5" onClick={() => ouvrirRapport(foundDossier.id)}>
                      <ListChecks className="h-3.5 w-3.5" />Voir rapport
                    </Button>
                    {affect && (
                      <span className="flex items-center text-xs text-emerald-600 gap-1">
                        <UserCheck className="h-3 w-3" /> Affecté à {affect.agent?.full_name || "—"}
                      </span>
                    )}
                    {rapport && rapport.statut === "soumis" && (
                      <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">Rapport en attente de validation</Badge>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </Panel>

        {/* ─── AFFECTATIONS RÉCENTES ─── */}
        <Panel title="Affectations récentes">
          {recentAffectations.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucune affectation pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {recentAffectations.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-accent/10">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-accent shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{a.dossier?.reference || a.dossier_id}</p>
                      <p className="text-xs text-muted-foreground">Agent: {a.agent?.full_name || "—"}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {new Date(a.date_affectation).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ─── RAPPORTS EN ATTENTE ─── */}
        <Panel title="Rapports en attente de validation">
          {rapports.filter((r: any) => r.statut === "soumis").length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Aucun rapport en attente.</p>
          ) : (
            <div className="space-y-2">
              {rapports.filter((r: any) => r.statut === "soumis").map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-amber-500/20">
                  <div>
                    <p className="text-sm font-medium">{r.dossier?.reference || r.dossier_id}</p>
                    <p className="text-xs text-muted-foreground">Agent: {r.agent?.full_name || "—"} · Soumis le {new Date(r.date_soumission).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs gap-1" onClick={() => ouvrirRapport(r.dossier_id)}>
                      <Eye className="h-3 w-3" />Consulter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* === MODAL AFFECTATION AGENT === */}
      {affectDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-accent/20 bg-background shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-accent/10 bg-accent/5 rounded-t-3xl">
              <div>
                <h2 className="font-bold text-lg">Affecter un agent</h2>
                <p className="text-sm text-muted-foreground">{affectDossier.reference} — {affectDossier.importateur}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setAffectDossier(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-accent/10 text-xs space-y-1">
                <div><span className="text-muted-foreground">Véhicule :</span> <strong>{affectDossier.vehicule || "—"}</strong></div>
                <div><span className="text-muted-foreground">Type :</span> <strong className="capitalize">{affectDossier.type}</strong></div>
                <div><span className="text-muted-foreground">DRA :</span> <strong className="font-mono">{affectDossier.dra || "—"}</strong></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sélectionner un agent de pointage</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun agent disponible.</p>}
                  {agents.map((ag: any) => (
                    <label key={ag.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${agentChoisi === String(ag.id) ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}>
                      <input type="radio" name="agent" value={String(ag.id)} checked={agentChoisi === String(ag.id)} onChange={() => setAgentChoisi(String(ag.id))} className="accent-accent" />
                      <div>
                        <div className="font-semibold text-sm">{ag.full_name}</div>
                        <div className="text-xs text-muted-foreground">{ag.matricule}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setAffectDossier(null)}>Annuler</Button>
                <Button className="rounded-xl bg-accent hover:bg-accent/90 gap-2" onClick={handleAffectation}>
                  <UserCheck className="h-4 w-4" />Confirmer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL RAPPORT COLISAGE + VALIDATION === */}
      {rapportOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-accent/20 bg-background shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-accent/10 bg-background/95 backdrop-blur-md rounded-t-3xl">
              <div>
                <h2 className="font-bold text-lg">Rapport de Colisage — {rapportOuvert.dossier?.reference || rapportOuvert.dossier_id}</h2>
                <p className="text-sm text-muted-foreground">
                  Agent: {rapportOuvert.agent?.full_name || "—"} · Soumis le {rapportOuvert.date_soumission ? new Date(rapportOuvert.date_soumission).toLocaleDateString("fr-FR") : "—"}
                  {rapportOuvert.statut && <Badge className={`ml-2 text-[10px] ${rapportOuvert.statut === "valide" ? "bg-emerald-500/10 text-emerald-600" : rapportOuvert.statut === "rejete" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}`}>{rapportOuvert.statut}</Badge>}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setRapportOuvert(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-accent/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/5 border-b border-accent/10">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground w-8">N°</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-muted-foreground w-24">Quantité</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids/colis</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/5">
                    {(rapportOuvert.lignes || []).map((l: any, idx: number) => (
                      <tr key={idx} className="hover:bg-accent/5">
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{l.description}</td>
                        <td className="px-4 py-3 text-center font-bold text-lg">{l.quantite}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{l.poidsParColis} kg</td>
                        <td className="px-4 py-3 text-right font-bold text-accent">{l.poidsTotal?.toLocaleString()} kg</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-accent text-white">
                      <td className="px-4 py-4" colSpan={2}><div className="flex items-center gap-2 font-bold"><Scale className="h-4 w-4" />TOTAL</div></td>
                      <td className="px-4 py-4 text-center font-black text-2xl">{rapportOuvert.total_quantite || 0}</td>
                      <td className="px-4 py-4 text-right opacity-60">—</td>
                      <td className="px-4 py-4 text-right font-black text-2xl">{(rapportOuvert.total_poids || 0).toLocaleString()} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {rapportOuvert.notes && (
                <div className="p-4 rounded-xl border border-accent/10 bg-muted/20">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Notes agent</p>
                  <p className="text-sm">{rapportOuvert.notes}</p>
                </div>
              )}

              {rapportOuvert.motif_rejet && (
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <p className="text-xs font-bold uppercase text-destructive mb-1">Motif du rejet</p>
                  <p className="text-sm">{rapportOuvert.motif_rejet}</p>
                </div>
              )}

              {rapportOuvert.statut === "soumis" && (
                <div className="space-y-3 pt-2 border-t border-accent/10">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Motif de rejet (si rejet)</label>
                    <textarea
                      className="w-full h-20 rounded-xl border border-accent/20 bg-background p-3 text-sm focus:border-accent outline-none resize-none"
                      placeholder="Saisir le motif du rejet..."
                      value={rejetMotif}
                      onChange={e => setRejetMotif(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" className="rounded-xl gap-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => handleValidation("rejete")} disabled={validationLoading}>
                      {validationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
                      Rejeter
                    </Button>
                    <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => handleValidation("valide")} disabled={validationLoading}>
                      {validationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                      Approuver
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
