import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { 
  Plus, 
  Globe, 
  Coins, 
  MapPin, 
  Search, 
  Edit2, 
  FolderKanban, 
  Bell, 
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { 
  apiGetLocodes, apiCreateLocode, apiUpdateLocode, apiDeleteLocode,
  apiGetCountries, apiCreateCountry, apiUpdateCountry, apiDeleteCountry,
  apiGetCurrencies, apiCreateCurrency, apiUpdateCurrency, apiDeleteCurrency,
  apiGetDossiers
} from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/dashboards/_shared";

export const Route = createFileRoute("/app/representation")({
  component: ReprPage,
});

function ReprPage() {

  const { user } = useAuth();
  const isChefRepr = user?.role === "chef_bureau_repr";

  const [locodes, setLocodes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [dossiers, setDossiers] = useState<any[]>([]);
  
  const reloadData = async () => {
    try {
      const [loc, cty, cur, dos] = await Promise.all([
        apiGetLocodes(), apiGetCountries(), apiGetCurrencies(), apiGetDossiers()
      ]);
      setLocodes(loc); setCountries(cty); setCurrencies(cur); setDossiers(dos as any[]);
    } catch (e) {}
  };
  
  useEffect(() => { reloadData(); }, []);

  // Search & Filter States

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Reference Data States
  const [newLocode, setNewLocode] = useState({ code: "", designation: "", codePays: "", denomination: "" });
  const [newDevise, setNewDevise] = useState({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" });
  const [editingItem, setEditingItem] = useState<any>(null);

  // Auto-fill logic for country codes
  useEffect(() => {
    if (newLocode.codePays) {
      const found = countries.find(p => p.code.toUpperCase() === newLocode.codePays.toUpperCase());
      setNewLocode(prev => ({ ...prev, denomination: found?.designation || "" }));
    }
  }, [newLocode.codePays]);

  useEffect(() => {
    if (newDevise.codePays) {
      const found = countries.find(p => p.code.toUpperCase() === newDevise.codePays.toUpperCase());
      setNewDevise(prev => ({ ...prev, denominationPays: found?.designation || "" }));
    }
  }, [newDevise.codePays]);

  // Le backend filtre déjà les dossiers
  const representationDossiers = dossiers;

  const filteredDossiers = representationDossiers.filter(d => {
    const draRef = d.representationEntry?.dra_reference || d.dra || "";
    const matchesRef = draRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = (!dateRange.start || d.date >= dateRange.start) && (!dateRange.end || d.date <= dateRange.end);
    return matchesRef && matchesDate;
  });

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full text-foreground">
      <PageHeader 
        title="Bureau de Représentation" 
        description="Gestion opérationnelle et supervision des dossiers de référence" 
      />
      
      <Tabs defaultValue="dossiers" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-muted/50 p-1 shrink-0">
          <TabsTrigger value="dossiers" className="gap-2 text-[10px] font-black uppercase tracking-widest">
            <FolderKanban className="h-4 w-4" />
            Dossiers
          </TabsTrigger>
          <TabsTrigger value="locode" className="gap-2 text-[10px] font-black uppercase tracking-widest">
            <MapPin className="h-4 w-4" />
            Locodes
          </TabsTrigger>
          <TabsTrigger value="pays" className="gap-2 text-[10px] font-black uppercase tracking-widest">
            <Globe className="h-4 w-4" />
            Pays
          </TabsTrigger>
          <TabsTrigger value="devise" className="gap-2 text-[10px] font-black uppercase tracking-widest">
            <Coins className="h-4 w-4" />
            Devises
          </TabsTrigger>
        </TabsList>

        {/* --- TAB: DOSSIERS --- */}
        <TabsContent value="dossiers" className="flex-1 mt-4 min-h-0">
          <div className="flex flex-col h-full gap-4">
            <div className="flex flex-wrap gap-3 items-end bg-card/50 p-4 rounded-xl border shrink-0">
              <div className="w-56">
                <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1 block">Réf. DRA</label>
                <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring h-9">
                  <span className="flex items-center px-3 h-full border-r border-input bg-muted/50 font-bold text-muted-foreground select-none">E-</span>
                  <input 
                    className="flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground/50 h-full" 
                    placeholder="0001" 
                    inputMode="numeric"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                      setSearchTerm(val);
                    }}
                  />
                </div>
              </div>
              <div className="w-40">
                <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1 block">Du</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              </div>
              <div className="w-40">
                <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground mb-1 block">Au</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>
              <Button size="sm" className="h-9 px-4 font-black uppercase tracking-widest text-[9px]" onClick={() => toast.success("Données filtrées")}>Filtrer</Button>
            </div>

            <Panel title="Suivi des Dossiers" className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto scrollbar-hide">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-card border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="py-3 px-2">N°</th>
                      <th className="py-3 px-2">Importateur</th>
                      <th className="py-3 px-2">DRA Réf</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">T1 Réf</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2">Véhicule</th>
                      <th className="py-3 px-2">Action</th>
                      <th className="py-3 px-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredDossiers.map((d, i) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-2 font-bold">{d.importateur}</td>
                        <td className="py-3 px-2 font-mono font-bold text-accent">{d.dra || "E-0000"}</td>
                        <td className="py-3 px-2 font-mono text-[10px]">{d.date}</td>
                        <td className="py-3 px-2 font-mono">{d.t1 || "—"}</td>
                        <td className="py-3 px-2 font-mono text-[10px]">{d.date}</td>
                        <td className="py-3 px-2 text-muted-foreground">{d.vehicule}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <FormDialog
                              trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase text-accent">Afficher</Button>}
                              title={`Consultation Dossier — ${d.representationEntry?.dra_reference || d.dra || "E-0000"}`}
                            >
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 grid grid-cols-2 gap-4 mb-4">
                                   <div><p className="text-[10px] uppercase font-black opacity-50">DRA</p><p className="font-bold">{d.representationEntry?.dra_reference || "-"}</p></div>
                                   <div><p className="text-[10px] uppercase font-black opacity-50">T1</p><p className="font-bold">{d.representationEntry?.t1_reference || "-"}</p></div>
                                </div>
                                <table className="w-full text-[11px]">
                                  <thead>
                                    <tr className="border-b text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                                      <th className="py-2 text-left">Article</th>
                                      <th className="py-2 text-left">Position Tarifaire</th>
                                      <th className="py-2 text-right">Qté</th>
                                      <th className="py-2 text-right">Poids (kg)</th>
                                      <th className="py-2 text-right">FOB ($)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {(() => {
                                      const allArticles = [
                                        ...(d.articles || []),
                                        ...(d.representation_entry?.articles || d.representationEntry?.articles || [])
                                      ];
                                      if (allArticles.length === 0) {
                                        return (
                                          <tr>
                                            <td colSpan={5} className="py-4 text-center italic text-muted-foreground">Aucun article enregistré.</td>
                                          </tr>
                                        );
                                      }
                                      return allArticles.map((art: any, i: number) => (
                                        <tr key={art.id || i}>
                                          <td className="py-2 font-bold uppercase">{art.designation || "-"}</td>
                                          <td className="py-2 font-mono text-accent">{art.position_tarifaire || art.position || "-"}</td>
                                          <td className="py-2 text-right">{art.quantite || "-"}</td>
                                          <td className="py-2 text-right font-mono">{art.poids || "-"}</td>
                                          <td className="py-2 text-right font-black text-success">{art.fob ? Number(art.fob).toLocaleString() : "-"}</td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </FormDialog>
                            <FormDialog
                              trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase text-destructive">Alerter</Button>}
                              title="Déclencher une Alerte"
                              onSubmit={() => toast.success("Alerte de sécurité activée")}
                            >
                              <div className="space-y-4">
                                <Field label="Description de l'alerte" required>
                                  <textarea className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-xs outline-none" placeholder="Motif détaillé..." />
                                </Field>
                                <Button className="w-full h-11 bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-[10px]">Activer Alerte</Button>
                              </div>
                            </FormDialog>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                           <Badge variant={i % 5 === 0 ? "destructive" : "outline"} className="text-[8px] font-black uppercase py-0 px-2">
                             {i % 5 === 0 ? "Alerte" : "Normal"}
                           </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* --- TAB: LOCODE --- */}
        <TabsContent value="locode" className="flex-1 mt-4 min-h-0">
          <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
              <div className="relative w-64">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Chercher Locode..." className="pl-9 h-9 text-xs" />
              </div>
              <FormDialog
                trigger={<Button size="sm" className="gap-2 bg-accent text-[10px] font-black uppercase h-9 px-4" onClick={() => { setEditingItem(null); setNewLocode({ code: "", designation: "", codePays: "", denomination: "" }); }}><Plus className="h-4 w-4" />Nouveau Locode</Button>}
                title={editingItem ? "Editer Locode" : "Ajouter Locode"}
                onSubmit={async () => {
                  try {
                    if (editingItem) {
                      await apiUpdateLocode(editingItem.id, newLocode);
                      toast.success("Locode mis à jour");
                    } else {
                      await apiCreateLocode(newLocode);
                      toast.success("Locode ajouté");
                    }
                    reloadData();
                  } catch (e: any) {
                    toast.error(e?.message || "Erreur lors de l'enregistrement");
                  }
                }}
              >
                <FormGrid>
                  <Field label="Code Locode"><Input placeholder="UGKLA" value={newLocode.code} onChange={e => setNewLocode({...newLocode, code: e.target.value.toUpperCase()})} /></Field>
                  <Field label="Désignation"><Input value={newLocode.designation} onChange={e => setNewLocode({...newLocode, designation: e.target.value})} /></Field>
                  <Field label="Code Pays (ISO)"><Input placeholder="UG" value={newLocode.codePays} onChange={e => setNewLocode({...newLocode, codePays: e.target.value.toUpperCase()})} /></Field>
                  <Field label="Dénomination Pays"><Input disabled className="bg-muted font-bold" value={newLocode.denomination} /></Field>
                </FormGrid>
                <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
              </FormDialog>
            </div>
            <Panel title="Liste des Locodes" className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto">
                <DataTable
                  data={locodes}
                  columns={[
                    { key: "code", header: "Code", render: (r) => <span className="font-mono font-bold text-accent">{r.code}</span> },
                    { key: "designation", header: "Désignation" },
                    { key: "denomination", header: "Pays", render: (r) => <span className="font-bold">{r.denomination}</span> },
                    { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingItem(r); setNewLocode(r); }}><Edit2 className="h-3.5 w-3.5" /></Button> }
                  ]}
                />
              </div>
            </Panel>
          </div>
        </TabsContent>

        {/* --- TAB: PAYS --- */}
        <TabsContent value="pays" className="flex-1 mt-4 min-h-0">
          <div className="flex flex-col h-full gap-4">
             <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                <div className="relative w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Filtrer pays..." className="pl-9 h-9 text-xs" />
                </div>
                <FormDialog
                  trigger={<Button size="sm" className="gap-2 h-9 text-[10px] font-black uppercase" onClick={() => setEditingItem(null)}><Plus className="h-4 w-4" />Nouveau Pays</Button>}
                  title={editingItem ? "Editer Pays" : "Enregistrer un pays"}
                  onSubmit={async (fd?: Record<string, string>) => {
                    try {
                      const payload = {
                        code: (fd?.code || editingItem?.code || "").toUpperCase(),
                        designation: fd?.designation || editingItem?.designation || ""
                      };
                      if (editingItem) {
                        await apiUpdateCountry(editingItem.id, payload);
                        toast.success("Pays mis à jour");
                      } else {
                        await apiCreateCountry(payload);
                        toast.success("Pays ajouté");
                      }
                      reloadData();
                    } catch (e: any) {
                      toast.error(e?.message || "Erreur");
                    }
                  }}
                >
                   <FormGrid>
                     <Field label="Code ISO 2"><Input name="code" placeholder="UG" defaultValue={editingItem?.code} /></Field>
                     <Field label="Désignation"><Input name="designation" placeholder="OUGANDA" defaultValue={editingItem?.designation} /></Field>
                   </FormGrid>
                   <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                </FormDialog>
             </div>
             <Panel title="Liste des Pays" className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto">
                  <DataTable
                    data={countries}
                    columns={[
                      { key: "code", header: "ISO", render: (r) => <Badge variant="secondary" className="font-mono">{r.code}</Badge> },
                      { key: "designation", header: "Dénomination", render: (r) => <span className="font-bold">{r.designation}</span> },
                      { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingItem(r)}><Edit2 className="h-3.5 w-3.5" /></Button> }
                    ]}
                  />
                </div>
             </Panel>
          </div>
        </TabsContent>

        {/* --- TAB: DEVISES --- */}
        <TabsContent value="devise" className="flex-1 mt-4 min-h-0">
          <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                <div className="relative w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Chercher devise..." className="pl-9 h-9 text-xs" />
                </div>
                <FormDialog
                  trigger={<Button size="sm" className="gap-2 h-9 text-[10px] font-black uppercase" onClick={() => { setEditingItem(null); setNewDevise({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" }); }}><Plus className="h-4 w-4" />Nouvelle Devise</Button>}
                  title={editingItem ? "Editer Devise" : "Ajouter Devise"}
                  onSubmit={async () => {
                    try {
                      const payload = {
                        codePays: newDevise.codePays,
                        codeDevise: newDevise.codeDevise,
                        denomination: newDevise.denominationDevise
                      };
                      if (editingItem) {
                        await apiUpdateCurrency(editingItem.id, payload);
                        toast.success("Devise mise à jour");
                      } else {
                        await apiCreateCurrency(payload);
                        toast.success("Devise ajoutée");
                      }
                      reloadData();
                    } catch (e: any) {
                      toast.error(e?.message || "Erreur");
                    }
                  }}
                >
                  <FormGrid>
                    <Field label="Code Pays"><Input placeholder="UG" value={newDevise.codePays} onChange={e => setNewDevise({...newDevise, codePays: e.target.value.toUpperCase()})} /></Field>
                    <Field label="Dénomination Pays"><Input disabled className="bg-muted font-bold" value={newDevise.denominationPays} /></Field>
                    <Field label="Code Devise"><Input placeholder="UGX" value={newDevise.codeDevise} onChange={e => setNewDevise({...newDevise, codeDevise: e.target.value.toUpperCase()})} /></Field>
                    <Field label="Désignation Devise"><Input placeholder="Shilling Ougandais" value={newDevise.denominationDevise} onChange={e => setNewDevise({...newDevise, denominationDevise: e.target.value})} /></Field>
                  </FormGrid>
                  <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                </FormDialog>
            </div>
            <Panel title="Gestion des Devises" className="flex-1 min-h-0">
              <div className="h-full overflow-y-auto">
                <DataTable
                  data={currencies}
                  columns={[
                    { key: "codePays", header: "Pays", render: (r) => <Badge variant="outline">{r.codePays}</Badge> },
                    { key: "codeDevise", header: "Devise", render: (r) => <Badge className="bg-success/10 text-success border-success/30 font-black">{r.codeDevise}</Badge> },
                    { key: "denomination", header: "Dénomination", render: (r) => <span className="font-bold">{r.denomination}</span> },
                    { key: "actions", header: "", render: (r) => <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingItem(r); setNewDevise({ codePays: r.codePays, codeDevise: r.codeDevise, denominationPays: "", denominationDevise: r.denomination }); }}><Edit2 className="h-3.5 w-3.5" /></Button> }
                  ]}
                />
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
