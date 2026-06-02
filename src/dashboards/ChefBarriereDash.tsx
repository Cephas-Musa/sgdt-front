import { useState } from "react";
import { FileText, Users, DollarSign, Plus, Search, Printer, Package, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi, apiGetDossiers, apiGetEmptyManifests, apiGetUsers, apiGetTypingDocStats, apiGetCommissionStats, apiGetCommissions, apiGetBarrieres } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ChefBarriereDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];

  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  const allManifests = rawManifests as any[] || [];

  const { data: rawUsers } = useApi(apiGetUsers);
  const allUsers = rawUsers as any[] || [];

  const { data: rawBarrieres } = useApi(apiGetBarrieres);
  const barrieres = rawBarrieres as any[] || [];

  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [docType, setDocType] = useState("all");

  const { data: rawStats } = useApi(apiGetTypingDocStats);
  const stats = (rawStats as any) || {};

  const { data: rawCommStats } = useApi(apiGetCommissionStats);
  const commStats = (rawCommStats as any) || {};

  const { data: rawCommissions } = useApi(apiGetCommissions);
  const commissions = (rawCommissions as any)?.data || [];

  const typingOps = allUsers.filter((a: any) => a.role === "typing_operator");

  const filteredDocs = activeDossiers.filter((d: any) => {
    const matchesSearch = (d.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.importateur || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docType === "all" || (d.type || "").toLowerCase() === docType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const filteredManifests = allManifests.filter((m: any) =>
    (m.manifest_number || m.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.plaque || m.vehicule || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Chef Barrière Étranger — gestion des documents, manifestes vides, commissions et opérateurs" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={FileText} label="Docs Aujourd'hui" value={(stats?.direct_today || 0) + (stats?.tranship_today || 0)} />
        <StatCard icon={Package} label="Docs En Attente" value={stats?.pending_docs || 0} />
        <StatCard icon={DollarSign} label="Com. Payées" value={`$${commStats?.total_commission_payee || 0}`} />
        <StatCard icon={TrendingUp} label="Com. En Attente" value={`$${commStats?.total_commission_en_attente || 0}`} />
        <StatCard icon={Users} label="Typing operators" value={typingOps.length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="docs">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="docs">Docs (Dossiers)</TabsTrigger>
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="barrieres">Barrières</TabsTrigger>
            <TabsTrigger value="users">Typing Operators</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="mt-4 space-y-4">
            <Panel
              title="Liste des dossiers"
              actions={
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Rechercher..." className="pl-8 h-8 w-40 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => toast.info("Impression...")}>
                    <Printer className="h-3.5 w-3.5" /> Imprimer
                  </Button>
                </div>
              }
            >
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Type de dossier</label>
                  <select className="h-8 w-40 rounded-md border border-input bg-background px-3 py-1 text-xs" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="all">Tous les types</option>
                    <option value="transhipment">Transhipment</option>
                    <option value="it">IT</option>
                    <option value="direct">Direct</option>
                  </select>
                </div>
                <div className="ml-auto flex items-end gap-4 px-4 border-l">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase font-bold">Total</div>
                    <div className="text-lg font-bold">{filteredDocs.length}</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">N°</th>
                      <th className="px-3 py-3">Importateur</th>
                      <th className="px-3 py-3">Référence</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDocs.map((d: any, i: number) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs">{i + 1}</td>
                        <td className="px-3 py-3 font-medium">{d.importateur || "—"}</td>
                        <td className="px-3 py-3 font-mono text-xs text-accent">{d.reference}</td>
                        <td className="px-3 py-3 capitalize">
                          <Badge variant="outline" className="text-[10px]">{d.type || "N/A"}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={d.status === "paye" || d.status === "valide" ? "success" : "warning"} className="text-[9px] uppercase">{d.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredDocs.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun dossier trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4 space-y-4">
            <Panel title="Manifestes vides">
              <div className="flex gap-3 mb-4">
                <Input placeholder="Rechercher..." className="max-w-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">Manifest Ref</th>
                      <th className="px-3 py-3">Véhicule</th>
                      <th className="px-3 py-3">Chauffeur</th>
                      <th className="px-3 py-3">Statut</th>
                      <th className="px-3 py-3">Facture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredManifests.map((m: any) => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs">{m.manifest_number}</td>
                        <td className="px-3 py-3 font-bold">{m.plaque}</td>
                        <td className="px-3 py-3">{m.chauffeur}</td>
                        <td className="px-3 py-3">
                          <Badge variant={m.status === "paye" || m.status === "valide" ? "success" : "warning"} className="text-[9px] uppercase">{m.status}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={m.facture_statut === "paye" ? "success" : "outline"} className="text-[9px] uppercase">{m.facture_statut || "non_paye"}</Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredManifests.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun manifeste trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="commissions" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase">Total Payé</p>
                <p className="text-2xl font-bold text-success">${commStats?.total_commission_payee || 0}</p>
              </div>
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase">En Attente</p>
                <p className="text-2xl font-bold text-warning">${commStats?.total_commission_en_attente || 0}</p>
              </div>
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase">Payées</p>
                <p className="text-2xl font-bold">{commStats?.total_payees || 0} / {commStats?.total_approuvees || 0}</p>
              </div>
            </div>

            <Panel title="Historique des Commissions">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">Document</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Montant</th>
                      <th className="px-3 py-3">Commission</th>
                      <th className="px-3 py-3">Opérateur</th>
                      <th className="px-3 py-3">Statut</th>
                      <th className="px-3 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {commissions.map((c: any) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="px-3 py-3 font-mono text-xs">{c.reference_document}</td>
                        <td className="px-3 py-3 capitalize">{c.document_type}</td>
                        <td className="px-3 py-3">${c.montant_base}</td>
                        <td className="px-3 py-3 font-bold text-success">${c.commission}</td>
                        <td className="px-3 py-3">{c.typing_operator?.full_name || "—"}</td>
                        <td className="px-3 py-3">
                          <Badge variant={
                            c.statut === "payee" ? "success" :
                            c.statut === "approuvee" ? "default" :
                            c.statut === "calculee" ? "warning" : "destructive"
                          } className="text-[9px] uppercase">{c.statut}</Badge>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {commissions.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-6 text-center text-xs text-muted-foreground">Aucune commission calculée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="barrieres" className="mt-4">
            <Panel title="Barrières Étrangères">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barrieres.map((b: any) => (
                  <div key={b.id} className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{b.nom}</h3>
                      <Badge variant={b.status === "actif" ? "success" : "secondary"} className="text-[9px]">{b.status}</Badge>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Code: <span className="font-mono">{b.code}</span></p>
                      <p>Localisation: {b.localisation}</p>
                      <p>Province: {b.province}</p>
                      <p>Commission: {b.commission_taux}% ({b.commission_type})</p>
                    </div>
                  </div>
                ))}
                {barrieres.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground">Aucune barrière configurée</div>
                )}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Panel title="Liste des Typing Operators">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">N°</th>
                      <th className="px-3 py-3">Nom</th>
                      <th className="px-3 py-3">Matricule</th>
                      <th className="px-3 py-3">Téléphone</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {typingOps.map((a: any, i: number) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs">{i + 1}</td>
                        <td className="px-3 py-3 font-medium">{a.full_name}</td>
                        <td className="px-3 py-3 font-mono text-xs">{a.matricule || "—"}</td>
                        <td className="px-3 py-3 text-xs">{a.phone_number}</td>
                        <td className="px-3 py-3">
                          <Badge variant={a.status === "actif" ? "success" : "destructive"} className="text-[9px]">{a.status || "actif"}</Badge>
                        </td>
                      </tr>
                    ))}
                    {typingOps.length === 0 && (
                      <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun opérateur trouvé</td></tr>
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
