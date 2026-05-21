import { useState, useEffect } from "react";
import { FolderKanban, Globe, DollarSign, Bell, Plus, Search, Edit2 } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, LOCODES, PAYS, DEVISES, NOTIFICATIONS, BUREAUX_REPR } from "@/lib/mock";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

export default function OperateurSaisieDash() {
  const [searchRef, setSearchRef] = useState("");
  const [searchDra, setSearchDra] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [nombreArticles, setNombreArticles] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // States for Locode, Pays, Devises
  const [newLocode, setNewLocode] = useState({ code: "", designation: "", codePays: "", denomination: "" });
  const [newDevise, setNewDevise] = useState({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" });
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    if (newLocode.codePays) {
      const found = PAYS.find(p => p.code.toUpperCase() === newLocode.codePays.toUpperCase());
      setNewLocode(prev => ({ ...prev, denomination: found?.designation || "" }));
    }
  }, [newLocode.codePays]);

  useEffect(() => {
    if (newDevise.codePays) {
      const found = PAYS.find(p => p.code.toUpperCase() === newDevise.codePays.toUpperCase());
      setNewDevise(prev => ({ ...prev, denominationPays: found?.designation || "" }));
    }
  }, [newDevise.codePays]);

  const filtered = DOSSIERS.filter((d) => {
    const matchRef = !searchRef || d.reference.toLowerCase().includes(searchRef.toLowerCase());
    const matchDra = !searchDra || d.dra.toLowerCase().includes(searchDra.toLowerCase());
    const matchDate = (!dateStart || d.date >= dateStart) && (!dateEnd || d.date <= dateEnd);
    return matchRef && matchDra && matchDate;
  });

  return (
    <div>
      <DashHeader subtitle="Opérateur Saisie — dossiers, locode, pays, devises, alertes" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard icon={Globe} label="Locodes" value={LOCODES.length} />
        <StatCard icon={DollarSign} label="Devises" value={DEVISES.length} />
        <StatCard
          icon={Bell}
          label="Alertes actives"
          value={3} // Simulate active alerts
        />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="nouveau">Nouveau dossier</TabsTrigger>
            <TabsTrigger value="locode">Locode</TabsTrigger>
            <TabsTrigger value="pays">Pays</TabsTrigger>
            <TabsTrigger value="devises">Devises</TabsTrigger>
          </TabsList>

          {/* DOSSIERS TAB */}
          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-3 items-end bg-card/50 p-4 rounded-xl border shrink-0">
              <div className="w-48">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Réf. Dossier</label>
                <Input placeholder="Recherche par référence…" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="w-48">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Réf. DRA</label>
                <Input placeholder="Recherche par DRA…" value={searchDra} onChange={(e) => setSearchDra(e.target.value)} className="h-9 text-xs" />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Début</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateStart} onChange={e => setDateStart(e.target.value)} />
              </div>
              <div className="w-36">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Fin</label>
                <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
              </div>
              <Button size="sm" className="h-9 px-4 font-black uppercase tracking-widest text-[10px]" onClick={() => { setHasSearched(true); toast.success("Filtres appliqués"); }}>Rechercher</Button>
              {hasSearched && <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px]" onClick={() => { setSearchRef(""); setSearchDra(""); setDateStart(""); setDateEnd(""); setHasSearched(false); }}>Reset</Button>}
            </div>

            <Panel title={`Liste des dossiers (${filtered.length})`}>
              <div className="space-y-3">
                {filtered.slice(0, 15).map((d, index) => (
                  <div
                    key={d.id}
                    className="border border-border rounded-lg overflow-hidden hover:bg-muted/30 transition"
                  >
                    {/* Dossier Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-muted/20 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">N°</span>
                        <p className="font-mono font-semibold text-accent">{index + 1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Bureau</span>
                        <p className="font-semibold">{d.bureauRepr}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Importateur</span>
                        <p className="font-semibold">{d.importateur}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">DRA</span>
                        <p className="font-semibold text-accent font-mono">{d.dra}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">T1</span>
                        <p className="font-semibold font-mono">{d.t1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Date</span>
                        <p className="font-semibold">{d.date}</p>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-3 text-sm border-t border-border items-center">
                      <div>
                        <span className="text-xs text-muted-foreground">Véhicule</span>
                        <p className="font-semibold">{d.vehicule}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Devise</span>
                        <p className="font-semibold">{d.devise}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Marchandise</span>
                        <p className="font-semibold">{d.typeMarchandises}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Contenaire</span>
                        <p className="font-semibold">
                          {d.colis}x{d.poids > 500 ? "40" : "20"}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <FormDialog
                          trigger={
                            <Button size="sm" className="w-full bg-accent text-white hover:bg-accent/90">
                              Afficher
                            </Button>
                          }
                          title={`Articles du Dossier — ${d.reference}`}
                        >
                          <div className="space-y-4">
                            <table className="w-full text-xs">
                              <thead className="bg-muted/50 text-left text-muted-foreground uppercase font-bold text-[10px]">
                                <tr>
                                  <th className="px-2 py-2">Article</th>
                                  <th className="px-2 py-2 text-right">Poids (kg)</th>
                                  <th className="px-2 py-2 text-right">Qté</th>
                                  <th className="px-2 py-2 text-right">FOB</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                <tr>
                                  <td className="px-2 py-2 font-semibold">Marchandises Diverses</td>
                                  <td className="px-2 py-2 text-right font-mono">14,200</td>
                                  <td className="px-2 py-2 text-right">1</td>
                                  <td className="px-2 py-2 text-right font-bold text-success">52,300.00</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </FormDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          {/* NOUVEAU DOSSIER */}
          <TabsContent value="nouveau" className="mt-4">
            <Panel title="Segment général — Nouveau dossier">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Dossier enregistré");
                }}
                className="space-y-4"
              >
                <FormGrid>
                  <Field label="Importateur" required>
                    <Input placeholder="Nom de l'importateur" />
                  </Field>
                  <Field label="NIF">
                    <Input placeholder="NIF de l'importateur (Facultatif)" />
                  </Field>
                  <Field label="Code bureau étranger" required>
                    <div className="flex gap-2">
                      <Input placeholder="Code (ex: UGMPO)" className="max-w-[120px]" />
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence DRA (E-XXX)" required>
                      <Input placeholder="E-001" />
                    </Field>
                    <Field label="Sa date" required>
                      <Input type="date" />
                    </Field>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence T1" required>
                      <Input placeholder="T1-…" />
                    </Field>
                    <Field label="Sa date" required>
                      <Input type="date" />
                    </Field>
                  </div>
                  <Field label="Immatriculation avant" required>
                    <Input placeholder="AA 0000 XY" />
                  </Field>
                  <Field label="Immatriculation arrière">
                    <Input placeholder="BB 0000 ZA" />
                  </Field>
                  <Field label="Devise" required>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEVISES?.map((d) => (
                          <SelectItem key={d.id} value={d.codeDevise}>
                            {d.codeDevise} — {d.denomination}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pays de provenance" required>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="max-w-[100px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYS?.map((p) => (
                            <SelectItem key={p.id} value={p.code}>
                              {p.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <Field label="Numéro centenaire">
                    <Input />
                  </Field>
                  <Field label="Conteneur">
                    <div className="flex flex-wrap gap-4 items-center h-9">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input" /> 1x40
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input" /> 1x20
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input" /> Conventionnel
                      </label>
                    </div>
                  </Field>
                  <Field label="Incoterm">
                    <Input placeholder="FOB, CIF, etc." />
                  </Field>
                  <Field label="Bureau de sortie" required>
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="max-w-[120px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUREAUX_REPR?.filter((b) => b.type === "sortie").map((b) => (
                            <SelectItem key={b.id} value={b.code}>
                              {b.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <Field label="Nombre d'articles" required>
                    <Input 
                      type="number" 
                      min={1} 
                      value={nombreArticles} 
                      onChange={(e) => setNombreArticles(Math.max(1, parseInt(e.target.value) || 1))} 
                    />
                  </Field>
                </FormGrid>

                {/* GESTION AUTOMATIQUE DES ARTICLES */}
                <div className="mt-6 pt-4 border-t space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Détails des Articles ({nombreArticles})</h3>
                  {Array.from({ length: nombreArticles }).map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                      <h4 className="text-xs font-bold text-accent uppercase">Article {i + 1}</h4>
                      <FormGrid>
                        <Field label="Désignation" required><Input /></Field>
                        <Field label="Position tarifaire" required><Input /></Field>
                        <Field label="Quantité" required><Input type="number" /></Field>
                        <Field label="Poids (kg)" required><Input type="number" /></Field>
                        <Field label="FOB" required><Input type="number" /></Field>
                      </FormGrid>
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full h-11 font-bold uppercase tracking-wider">Enregistrer le Dossier</Button>
              </form>
            </Panel>
          </TabsContent>

          {/* LOCODE */}
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
                  onSubmit={() => toast.success("Enregistré")}
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
                    data={LOCODES}
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

          {/* PAYS */}
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
                  >
                     <FormGrid>
                       <Field label="Code ISO 2"><Input placeholder="UG" defaultValue={editingItem?.code} /></Field>
                       <Field label="Désignation"><Input placeholder="OUGANDA" defaultValue={editingItem?.designation} /></Field>
                     </FormGrid>
                     <Button className="w-full h-11 mt-4 font-black uppercase text-[10px]">{editingItem ? "Mettre à jour" : "Ajouter"}</Button>
                  </FormDialog>
               </div>
               <Panel title="Liste des Pays" className="flex-1 min-h-0">
                  <div className="h-full overflow-y-auto">
                    <DataTable
                      data={PAYS}
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

          {/* DEVISES */}
          <TabsContent value="devises" className="flex-1 mt-4 min-h-0">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-center bg-card/50 p-4 rounded-xl border shrink-0">
                  <div className="relative w-64">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Chercher devise..." className="pl-9 h-9 text-xs" />
                  </div>
                  <FormDialog
                    trigger={<Button size="sm" className="gap-2 h-9 text-[10px] font-black uppercase" onClick={() => { setEditingItem(null); setNewDevise({ codePays: "", codeDevise: "", denominationPays: "", denominationDevise: "" }); }}><Plus className="h-4 w-4" />Nouvelle Devise</Button>}
                    title={editingItem ? "Editer Devise" : "Ajouter Devise"}
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
                    data={DEVISES}
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

          {/* ALERTES / NOTIFICATIONS REMOVED - NOW IN SIDEBAR */}
        </Tabs>
      </div>
    </div>
  );
}
