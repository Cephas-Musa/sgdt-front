import { useState } from "react";
import { DollarSign, FolderKanban, TrendingUp, Calendar, Building2, ChevronDown, ChevronRight } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { PARTENAIRES, PARTENAIRE_TRANSACTIONS, TYPES_DOSSIERS, BUREAUX_DOUANIERS, calcPartenaireStats } from "@/lib/mock";
import type { PartenaireTransaction } from "@/lib/mock";

// Simule le partenaire connecté (premier partenaire actif pour la démo)
const CURRENT_PARTNER_ID = "p1";

export default function PartenaireDash() {
  const partenaire = PARTENAIRES.find(p => p.id === CURRENT_PARTNER_ID);
  const stats = calcPartenaireStats(CURRENT_PARTNER_ID);
  const transactions = PARTENAIRE_TRANSACTIONS.filter(t => t.partenaireId === CURRENT_PARTNER_ID);
  const [expandedBureaux, setExpandedBureaux] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  if (!partenaire) return <div className="p-8 text-center text-muted-foreground">Partenaire non trouvé.</div>;

  const toggleBureau = (id: string) => {
    setExpandedBureaux(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const getBureauName = (id: string) => BUREAUX_DOUANIERS.find(b => b.id === id)?.denomination ?? id;
  const getTypeName = (id: string) => TYPES_DOSSIERS.find(t => t.id === id)?.libelle ?? id;
  const getTypeTarif = (id: string) => TYPES_DOSSIERS.find(t => t.id === id)?.tarif ?? 0;

  // Pagination
  const sortedTx = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const totalPages = Math.ceil(sortedTx.length / pageSize);
  const pageTx = sortedTx.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <DashHeader subtitle="Espace Partenaire — Consultez votre solde, vos commissions et l'historique de vos dossiers." />

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Solde total" value={`$${stats.solde.toLocaleString()}`} hint="Basé sur vos commissions" />
        <StatCard icon={FolderKanban} label="Dossiers traités" value={stats.dossiersTraites} hint="Total cumulé" />
        <StatCard icon={TrendingUp} label="Commission moyenne" value={`$${stats.commissionMoyenne}`} hint="Par dossier" />
        <StatCard icon={Calendar} label="Dernier dossier" value={stats.dernierDossier} hint="Date du dernier traitement" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Commissions par bureau */}
        <Panel title="Mes commissions par bureau">
          <div className="space-y-2">
            {partenaire.bureaux.map(pb => {
              const isExpanded = expandedBureaux.includes(pb.bureauId);
              return (
                <div key={pb.bureauId} className="rounded-lg border border-border overflow-hidden transition-all">
                  <button
                    onClick={() => toggleBureau(pb.bureauId)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/40 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-accent shrink-0" />
                    <span className="flex-1">{getBureauName(pb.bureauId)}</span>
                    <span className="text-xs text-muted-foreground mr-2">{pb.commissions.length} type{pb.commissions.length > 1 ? "s" : ""}</span>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/10 px-4 py-3">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-left text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="pb-2 pr-4">Type de dossier</th>
                              <th className="pb-2 pr-4">Prix global</th>
                              <th className="pb-2 pr-4">Ma part</th>
                              <th className="pb-2">Part système</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pb.commissions.map(c => {
                              const tarif = getTypeTarif(c.typeDossierId);
                              const partVal = c.typeCommission === "pourcentage"
                                ? Math.round(tarif * c.valeurCommission / 100 * 100) / 100
                                : c.valeurCommission;
                              const partSys = tarif - partVal;
                              return (
                                <tr key={c.typeDossierId} className="border-t border-border/50">
                                  <td className="py-2 pr-4 font-medium">{getTypeName(c.typeDossierId)}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">${tarif}</td>
                                  <td className="py-2 pr-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                                      ${partVal}
                                      <span className="text-[10px] font-normal opacity-75">
                                        ({c.typeCommission === "pourcentage" ? `${c.valeurCommission}%` : "fixe"})
                                      </span>
                                    </span>
                                  </td>
                                  <td className="py-2 text-muted-foreground">${partSys}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Répartition visuelle */}
        <Panel title="Répartition des revenus">
          <div className="space-y-4 py-2">
            {(() => {
              const totalPartner = transactions.reduce((s, t) => s + t.partPartenaire, 0);
              const totalSys = transactions.reduce((s, t) => s + t.partSysteme, 0);
              const total = totalPartner + totalSys;
              const pctPartner = total > 0 ? Math.round(totalPartner / total * 100) : 0;
              const pctSys = total > 0 ? 100 - pctPartner : 0;
              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">Mes revenus</span>
                        <span className="text-sm font-semibold text-success">${Math.round(totalPartner)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-success/80 to-success transition-all duration-700" style={{ width: `${pctPartner}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{pctPartner}% du total</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">Part système</span>
                        <span className="text-sm font-semibold text-accent">${Math.round(totalSys)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-accent/80 to-accent transition-all duration-700" style={{ width: `${pctSys}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{pctSys}% du total</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-muted/30 p-3 text-center">
                    <span className="text-xs text-muted-foreground">Total traité</span>
                    <div className="text-xl font-bold mt-1">${Math.round(total)}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </Panel>
      </div>

      {/* Historique des transactions */}
      <div className="mt-6">
        <Panel title={`Historique des transactions (${transactions.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Référence</th>
                  <th className="px-3 py-2">Bureau</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Prix global</th>
                  <th className="px-3 py-2 text-right">Ma part</th>
                  <th className="px-3 py-2 text-right">Part système</th>
                </tr>
              </thead>
              <tbody>
                {pageTx.map((tx: PartenaireTransaction) => (
                  <tr key={tx.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-2 font-mono text-xs">{tx.dossierRef}</td>
                    <td className="px-3 py-2">{getBureauName(tx.bureauId)}</td>
                    <td className="px-3 py-2">{getTypeName(tx.typeDossierId)}</td>
                    <td className="px-3 py-2 text-right">${tx.prixGlobal}</td>
                    <td className="px-3 py-2 text-right font-semibold text-success">${tx.partPartenaire}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">${tx.partSysteme}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold bg-muted/30">
                  <td className="px-3 py-2" colSpan={4}>Total affiché</td>
                  <td className="px-3 py-2 text-right">${pageTx.reduce((s, t) => s + t.prixGlobal, 0)}</td>
                  <td className="px-3 py-2 text-right text-success">${pageTx.reduce((s, t) => s + t.partPartenaire, 0)}</td>
                  <td className="px-3 py-2 text-right">${pageTx.reduce((s, t) => s + t.partSysteme, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-3 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${currentPage === i + 1 ? "bg-accent text-accent-foreground" : "border border-border hover:bg-muted"}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
