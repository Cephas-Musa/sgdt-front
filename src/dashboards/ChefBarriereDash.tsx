import { useState } from "react";
import { FileText, Users, DollarSign, Plus, KeyRound, Search, Printer, Calendar, Package } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers } from "@/lib/api";
import { EMPTY_MANIFESTS, ACCOUNTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { apiGetTypingDocStats } from "@/lib/api";

export default function ChefBarriereDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("docs");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [docType, setDocType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawStats } = useApi(apiGetTypingDocStats);
  const stats = (rawStats as any) || {};

  const typingOps = ACCOUNTS.filter((a) => a.role === "typing_operator");
  
  // Filtering logic for Docs
  const filteredDocs = activeDossiers.filter(d => {
    const matchesSearch = (d.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (d.importateur || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docType === "all" || (d.type || "").toLowerCase() === docType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const totalGainsDocs = filteredDocs.reduce((s, d) => s + d.montant, 0);

  // Filtering logic for Empty Manifest
  const filteredManifests = EMPTY_MANIFESTS.filter(m => {
    return (m.reference || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (m.vehicule || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalGainsManifests = filteredManifests.reduce((s, m) => s + m.montant, 0);

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Chef Barrière Étranger — gestion des documents, manifestes vides et opérateurs" />
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Docs Saisis (Aujourd'hui)" value={(stats?.direct_today || 0) + (stats?.tranship_today || 0)} />
        <StatCard icon={Package} label="Docs En Attente" value={stats?.pending_docs || 0} />
        <StatCard
          icon={DollarSign}
          label="Gains Totaux (Période)"
          value={`$${totalGainsDocs + totalGainsManifests}`}
          hint="Cumul dossiers + manifestes"
        />
        <StatCard icon={Users} label="Typing operators" value={typingOps.length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="docs" onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="docs">Docs (Dossiers)</TabsTrigger>
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
            <TabsTrigger value="users">Typing Operators</TabsTrigger>
          </TabsList>

          {/* --- TAB: DOCS --- */}
          <TabsContent value="docs" className="mt-4 space-y-4">
            <Panel 
              title="Liste des dossiers"
              actions={
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher..." 
                        className="pl-8 h-8 w-40 text-xs" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => toast.info("Impression en cours...")}>
                      <Printer className="h-3.5 w-3.5" />
                      Imprimer
                   </Button>
                </div>
              }
            >
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Intervalle de date</label>
                    <div className="flex items-center gap-2">
                       <Input type="date" className="h-8 w-36 text-xs" />
                       <Input type="date" className="h-8 w-36 text-xs" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Type de dossier</label>
                    <select 
                      className="h-8 w-40 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                    >
                       <option value="all">Tous les types</option>
                       <option value="transhipment">Transhipment</option>
                       <option value="it">IT</option>
                       <option value="direct">Direct</option>
                    </select>
                 </div>
                 <div className="ml-auto flex items-end gap-4 px-4 border-l">
                    <div className="text-right">
                       <div className="text-[10px] text-muted-foreground uppercase font-bold">Nombre total</div>
                       <div className="text-lg font-bold">{filteredDocs.length}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-muted-foreground uppercase font-bold">Gain total</div>
                       <div className="text-lg font-bold text-success">${totalGainsDocs}</div>
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">N°</th>
                      <th className="px-3 py-3">Consignée</th>
                      <th className="px-3 py-3">Entry Reference</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Doc Type</th>
                      <th className="px-3 py-3">Gains</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDocs.map((d, i) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs">{i+1}</td>
                        <td className="px-3 py-3 font-medium">{d.importateur}</td>
                        <td className="px-3 py-3 font-mono text-xs text-accent">
                          <Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="hover:underline">
                            {d.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-xs">{d.date}</td>
                        <td className="px-3 py-3 capitalize">
                           <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                        </td>
                        <td className="px-3 py-3 font-bold text-success">${d.montant}</td>
                        <td className="px-3 py-3">
                           <Badge variant={d.status === 'paye' ? 'success' : 'warning'} className="text-[9px] uppercase">
                              {d.status}
                           </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* --- TAB: EMPTY MANIFEST --- */}
          <TabsContent value="manifest" className="mt-4 space-y-4">
            <Panel 
              title="Manifestes vides"
              actions={
                <div className="flex gap-2">
                   <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher..." 
                        className="pl-8 h-8 w-40 text-xs" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <Button size="sm" variant="outline" className="h-8 gap-2" onClick={() => window.print()}>
                      <Printer className="h-3.5 w-3.5" />
                      Imprimer
                   </Button>
                </div>
              }
            >
              <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Trier par date / intervalle</label>
                    <div className="flex items-center gap-2">
                       <Input type="date" className="h-8 w-36 text-xs" />
                       <Input type="date" className="h-8 w-36 text-xs" />
                    </div>
                 </div>
                 <div className="ml-auto flex items-end gap-4 px-4 border-l">
                    <div className="text-right">
                       <div className="text-[10px] text-muted-foreground uppercase font-bold">Nombre manifests</div>
                       <div className="text-lg font-bold">{filteredManifests.length}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] text-muted-foreground uppercase font-bold">Gain total</div>
                       <div className="text-lg font-bold text-success">${totalGainsManifests}</div>
                    </div>
                 </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">Manifest Ref</th>
                      <th className="px-3 py-3">Véhicule</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredManifests.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs text-accent">
                          <Link to="/app/manifest/$manifestId" params={{ manifestId: m.id }} className="hover:underline">
                            {m.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-3 font-bold">{m.vehicule}</td>
                        <td className="px-3 py-3 text-xs">{m.date}</td>
                        <td className="px-3 py-3 font-bold text-success">${m.montant}</td>
                        <td className="px-3 py-3">
                           <Badge variant={m.status === 'payé' ? 'success' : 'warning'} className="text-[9px] uppercase">
                              {m.status}
                           </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* --- TAB: USERS --- */}
          <TabsContent value="users" className="mt-4">
            <Panel title="Liste des Typing Operators">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">N°</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Number (Matricule)</th>
                      <th className="px-3 py-3">Account Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {typingOps.map((a, i) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs">{i+1}</td>
                        <td className="px-3 py-3 font-medium">{a.fullName}</td>
                        <td className="px-3 py-3 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-3">
                           <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 text-[10px] font-bold uppercase">
                              Typing Operator
                           </Badge>
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

