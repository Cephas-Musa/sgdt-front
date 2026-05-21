import { useState, useMemo } from "react";
import { FolderKanban, FileCheck, Bell, Truck, Search, UserCheck, ListChecks, Eye, X, Plus, Minus, Trash2, Scale, Users, CheckCircle2 } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, ALERTS, ACCOUNTS, type Dossier } from "@/lib/mock";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  RAPPORTS_COLISAGE, AFFECTATIONS, affecterAgent,
  type RapportColisage, type ColisageLigne, getAffectationDossier, getRapportDossier
} from "@/lib/colisage-store";

const agents = ACCOUNTS.filter((a) => a.role === "agent_pointage");

const TYPES = ["lot", "vehicule", "direct", "transbordement", "colis", "export", "trafic"];

export default function ChefEntrepotDouaneDash() {
  const [search, setSearch] = useState("");
  const [typeActif, setTypeActif] = useState("tous");
  const [rapportOuvert, setRapportOuvert] = useState<RapportColisage | null>(null);
  const [editionChef, setEditionChef] = useState(false);
  const [lignesChef, setLignesChef] = useState<ColisageLigne[]>([]);
  const [notesChef, setNotesChef] = useState("");

  const [affectDossier, setAffectDossier] = useState<Dossier | null>(null);
  const [agentChoisi, setAgentChoisi] = useState("");
  const [dossierLotOuvert, setDossierLotOuvert] = useState<Dossier | null>(null);

  const filtered = useMemo(() => {
    return DOSSIERS.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        d.reference.toLowerCase().includes(q) ||
        d.importateur.toLowerCase().includes(q) ||
        d.dra.toLowerCase().includes(q);
      const matchType = typeActif === "tous" || d.type === typeActif;
      return matchSearch && matchType;
    });
  }, [search, typeActif]);

  const dossiersByType = useMemo(() => {
    const map: Record<string, typeof DOSSIERS> = { tous: DOSSIERS };
    for (const t of TYPES) {
      map[t] = DOSSIERS.filter((d) => d.type === t);
    }
    return map;
  }, []);

  const ouvrirRapport = (d: Dossier) => {
    const rapport = getRapportDossier(d.id);
    if (!rapport) { toast.warning("Aucun rapport soumis pour ce dossier."); return; }
    setRapportOuvert(rapport);
    setLignesChef(rapport.lignesChef ?? rapport.lignes.map(l => ({ ...l })));
    setNotesChef(rapport.notesChef ?? rapport.notes);
    setEditionChef(false);
  };

  const sauvegarderChef = () => {
    if (!rapportOuvert) return;
    rapportOuvert.lignesChef = lignesChef;
    rapportOuvert.notesChef = notesChef;
    toast.success("Version chef enregistrée (visible uniquement du côté chef).");
    setEditionChef(false);
  };

  const changerQteChef = (id: string, delta: number) => {
    setLignesChef(prev => prev.map(l =>
      l.id === id ? { ...l, quantite: Math.max(1, l.quantite + delta), poidsTotal: Math.max(1, l.quantite + delta) * l.poidsParColis } : l
    ));
  };

  const supprimerLigneChef = (id: string) => setLignesChef(prev => prev.filter(l => l.id !== id));

  const totalChef = useMemo(() => lignesChef.reduce((a, l) => ({ q: a.q + l.quantite, p: a.p + l.poidsTotal }), { q: 0, p: 0 }), [lignesChef]);

  const doAffectation = () => {
    if (!affectDossier || !agentChoisi) { toast.error("Choisissez un agent."); return; }
    const agent = agents.find(a => a.id === agentChoisi);
    if (!agent) return;
    affecterAgent({
      dossierId: affectDossier.id,
      dossierRef: affectDossier.reference,
      vehicule: affectDossier.vehicule,
      agentId: agent.id,
      agentNom: agent.fullName,
    });
    toast.success(`Agent ${agent.fullName} affecté au dossier ${affectDossier.reference}`);
    setAffectDossier(null);
    setAgentChoisi("");
  };

  return (
    <div>
      <DashHeader subtitle="Chef Entrepôt Douane — dossiers, affectation agents, colisage" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard icon={FileCheck} label="Apurés" value={DOSSIERS.filter(d => d.status === "apure").length} />
        <StatCard icon={Users} label="Agents affectés" value={AFFECTATIONS.length} />
        <StatCard icon={ListChecks} label="Colisages reçus" value={RAPPORTS_COLISAGE.length} />
      </div>

      <div className="mt-6 space-y-4">
        {/* Barre de recherche + filtre type */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 rounded-xl border-accent/20"
              placeholder="Rechercher par référence, importateur, DRA..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTypeActif("tous")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${typeActif === "tous" ? "bg-accent text-white border-accent" : "border-accent/20 text-muted-foreground hover:border-accent/40"}`}
            >Tous ({DOSSIERS.length})</button>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeActif(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all capitalize ${typeActif === t ? "bg-accent text-white border-accent" : "border-accent/20 text-muted-foreground hover:border-accent/40"}`}
              >{t} ({(dossiersByType[t] ?? []).length})</button>
            ))}
          </div>
        </div>

        {/* Tableau principal */}
        <div className="rounded-2xl border border-accent/10 bg-background overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/5 border-b border-accent/10">
                  {["N°","Importateur","Type","Réf. DRA","Date","Réf. T1","Salle","Véhicule","Agent affecté","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/5">
                {filtered.slice(0, 20).map((d, i) => {
                  const affectation = getAffectationDossier(d.id);
                  const rapport = getRapportDossier(d.id);
                  return (
                    <tr key={d.id} className="hover:bg-accent/[0.03] transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground text-sm">{d.reference}</div>
                        <div className="text-xs text-muted-foreground">{d.importateur}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] border-accent/30 text-accent capitalize">{d.type}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{d.dra}</td>
                      <td className="px-4 py-3 text-xs">{d.date}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.t1}</td>
                      <td className="px-4 py-3 text-xs">{d.bureauRepr || "Salle A"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.vehicule}</td>
                      <td className="px-4 py-3">
                        {affectation ? (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <UserCheck className="h-3 w-3" />{affectation.agentNom}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Bouton Colisage — visible seulement si rapport soumis */}
                          {rapport ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg border-accent/30 text-accent gap-1 hover:bg-accent/10" onClick={() => ouvrirRapport(d)}>
                              <ListChecks className="h-3 w-3" />Colisage
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Pas soumis</span>
                          )}
                          {/* Bouton Affecter */}
                          <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg gap-1 hover:bg-accent/10" onClick={() => { setAffectDossier(d); setAgentChoisi(affectation?.agentId ?? ""); }}>
                            <UserCheck className="h-3 w-3" />
                            {affectation ? "Réaffecter" : "Affecter"}
                          </Button>
                          {/* Autoriser dénombrement (dossiers LOT) */}
                          {d.type === "lot" && (
                            <Button size="sm" className="h-7 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white gap-1" onClick={() => setDossierLotOuvert(d)}>
                              Dénombrement
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-accent/10 bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} dossier(s) · {AFFECTATIONS.length} agent(s) affecté(s) · {RAPPORTS_COLISAGE.length} colisage(s) reçu(s)
          </div>
        </div>

        {/* Alertes */}
        <Panel title={`Alertes (${ALERTS.length})`}>
          <ul className="divide-y divide-border text-sm">
            {ALERTS.slice(0, 5).map(a => (
              <li key={a.id} className="flex items-start gap-3 py-3 px-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${a.level === "urgent" ? "bg-destructive/15 text-destructive" : a.level === "important" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"}`}>{a.level}</span>
              </li>
            ))}
          </ul>
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
                <div><span className="text-muted-foreground">Véhicule :</span> <strong>{affectDossier.vehicule}</strong></div>
                <div><span className="text-muted-foreground">Type :</span> <strong className="capitalize">{affectDossier.type}</strong></div>
                <div><span className="text-muted-foreground">DRA :</span> <strong className="font-mono">{affectDossier.dra}</strong></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sélectionner un agent de pointage</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agents.length === 0 && <p className="text-sm text-muted-foreground italic">Aucun agent disponible.</p>}
                  {agents.map(ag => (
                    <label key={ag.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${agentChoisi === ag.id ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}>
                      <input type="radio" name="agent" value={ag.id} checked={agentChoisi === ag.id} onChange={() => setAgentChoisi(ag.id)} className="accent-accent" />
                      <div>
                        <div className="font-semibold text-sm">{ag.fullName}</div>
                        <div className="text-xs text-muted-foreground">{ag.matricule}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setAffectDossier(null)}>Annuler</Button>
                <Button className="rounded-xl bg-accent hover:bg-accent/90 gap-2" onClick={doAffectation}>
                  <UserCheck className="h-4 w-4" />Confirmer l'affectation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL RAPPORT COLISAGE (lecture + édition chef) === */}
      {rapportOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-accent/20 bg-background shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-accent/10 bg-background/95 backdrop-blur-md rounded-t-3xl">
              <div>
                <h2 className="font-bold text-lg">Rapport de Colisage — {rapportOuvert.dossierRef}</h2>
                <p className="text-sm text-muted-foreground">{rapportOuvert.importateur} · Agent : {rapportOuvert.agentNom} · {rapportOuvert.dateSoumission}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editionChef ? (
                  <Button size="sm" variant="outline" className="rounded-xl gap-1.5 text-accent border-accent/30" onClick={() => setEditionChef(true)}>
                    <Eye className="h-4 w-4" />Modifier (version chef)
                  </Button>
                ) : (
                  <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={sauvegarderChef}>
                    <FileCheck className="h-4 w-4" />Sauvegarder version chef
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setRapportOuvert(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {editionChef && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 font-medium">
                  ⚠️ Mode édition chef activé. Les modifications ne seront visibles que du côté Chef Entrepôt.
                </div>
              )}

              <div className="rounded-2xl border border-accent/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/5 border-b border-accent/10">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground w-8">N°</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase text-muted-foreground w-36">Quantité</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids/colis</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids total</th>
                      {editionChef && <th className="px-4 py-3 w-8"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/5">
                    {lignesChef.map((l, idx) => (
                      <tr key={l.id} className="hover:bg-accent/5 group">
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{l.description}</td>
                        <td className="px-4 py-3">
                          {editionChef ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button size="icon" variant="outline" className="h-6 w-6 rounded" onClick={() => changerQteChef(l.id, -1)}><Minus className="h-3 w-3" /></Button>
                              <span className="w-8 text-center font-bold">{l.quantite}</span>
                              <Button size="icon" variant="outline" className="h-6 w-6 rounded" onClick={() => changerQteChef(l.id, 1)}><Plus className="h-3 w-3" /></Button>
                            </div>
                          ) : (
                            <div className="text-center font-bold text-lg">{l.quantite}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{l.poidsParColis} kg</td>
                        <td className="px-4 py-3 text-right font-bold text-accent">{l.poidsTotal.toLocaleString()} kg</td>
                        {editionChef && (
                          <td className="px-4 py-3">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => supprimerLigneChef(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-accent text-white">
                      <td className="px-4 py-4" colSpan={2}>
                        <div className="flex items-center gap-2 font-bold"><Scale className="h-4 w-4" />TOTAL {editionChef ? "(version chef)" : "(version agent)"}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-black text-2xl">{totalChef.q}</td>
                      <td className="px-4 py-4 text-right opacity-60">—</td>
                      <td className="px-4 py-4 text-right font-black text-2xl">{totalChef.p.toLocaleString()} kg</td>
                      {editionChef && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {editionChef && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Notes chef (version modifiée)</label>
                  <textarea className="w-full h-24 rounded-xl border border-accent/20 bg-background p-3 text-sm focus:border-accent outline-none resize-none" value={notesChef} onChange={e => setNotesChef(e.target.value)} />
                </div>
              )}

              {!editionChef && rapportOuvert.notes && (
                <div className="p-4 rounded-xl border border-accent/10 bg-muted/20">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Notes agent</p>
                  <p className="text-sm">{rapportOuvert.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DOSSIER LOT (Page 2) === */}
      {dossierLotOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-accent/20 bg-background shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-accent/10 bg-accent/5 rounded-t-3xl">
              <div>
                <h2 className="font-bold text-lg">Dénombrement Dossier LOT</h2>
                <p className="text-sm text-muted-foreground">{dossierLotOuvert.reference} — {dossierLotOuvert.importateur}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setDossierLotOuvert(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl border border-accent/10 bg-muted/20">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Réf. Documentaire</p>
                  <p className="font-semibold text-sm font-mono">{dossierLotOuvert.referenceDouane || "RD-En attente"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">N° Titre</p>
                  <p className="font-semibold text-sm font-mono">{dossierLotOuvert.t1}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Déclarant</p>
                  <p className="font-semibold text-sm">{dossierLotOuvert.declarant}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Plaques</p>
                  <p className="font-semibold text-sm">3 véhicules attendus</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Véhicules associés au lot</h3>
                <div className="rounded-xl border border-accent/10 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-accent/5">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">Plaque</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-muted-foreground">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/5">
                      <tr>
                        <td className="px-4 py-3 font-mono">{dossierLotOuvert.vehicule}</td>
                        <td className="px-4 py-3">Camion</td>
                        <td className="px-4 py-3"><Badge className="bg-emerald-500/10 text-emerald-600">Arrivé</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono">BC 1030 XY</td>
                        <td className="px-4 py-3">Semi-remorque</td>
                        <td className="px-4 py-3"><Badge className="bg-blue-500/10 text-blue-600">En transit</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono">AB 1019 XY</td>
                        <td className="px-4 py-3">Camion</td>
                        <td className="px-4 py-3"><Badge className="bg-muted text-muted-foreground">En attente</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-accent/10">
              <Button className="rounded-xl bg-accent hover:bg-accent/90" onClick={() => {
                toast.success("Dénombrement autorisé pour le lot complet");
                setDossierLotOuvert(null);
              }}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Valider l'autorisation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
