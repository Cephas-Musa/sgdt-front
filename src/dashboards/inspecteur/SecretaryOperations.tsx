import { useState } from "react";
import { Search, FileCheck, Car, Trash2, Plus, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOSSIERS } from "@/lib/mock";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "../_shared";

interface Vehicle {
  id: string;
  vehicle: string;
  importateur: string;
  marchandises: string;
  draRef: string;
  draDate: string;
  titreRef: string;
  titreDate: string;
  containers: string[];
}

export function SecretaryOperations() {
  const [searchNum, setSearchNum] = useState("");
  const [searchYear, setSearchYear] = useState("2026");
  
  // For Lot vehicles
  const [lotVehicles, setLotVehicles] = useState<Vehicle[]>([{ 
    id: "1", vehicle: "", importateur: "", marchandises: "", draRef: "", draDate: "", titreRef: "", titreDate: "", containers: [] 
  }]);

  const addLotVehicle = () => {
    setLotVehicles([...lotVehicles, { 
      id: Math.random().toString(36).slice(2, 9), vehicle: "", importateur: "", marchandises: "", draRef: "", draDate: "", titreRef: "", titreDate: "", containers: [] 
    }]);
  };

  const removeLotVehicle = (id: string) => {
    if (lotVehicles.length > 1) setLotVehicles(lotVehicles.filter(v => v.id !== id));
  };

  const updateLotVehicle = (id: string, field: keyof Vehicle, value: any) => {
    setLotVehicles(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden animate-in fade-in duration-500">
      <Tabs defaultValue="dossiers" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 bg-muted/30 p-1.5 rounded-xl border border-border/50 shrink-0">
          <TabsList className="bg-transparent h-8 p-0 gap-1">
            <TabsTrigger 
              value="dossiers" 
              className="px-4 h-7 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Dossiers
            </TabsTrigger>
            <TabsTrigger 
              value="apurement" 
              className="px-4 h-7 text-[10px] font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Apurement
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-background border rounded-lg overflow-hidden h-7">
              <span className="px-2 text-[9px] font-black text-muted-foreground border-r bg-muted/20">RD-</span>
              <input 
                placeholder="Numéro" 
                className="w-20 px-2 text-[10px] font-bold outline-none bg-transparent" 
                value={searchNum}
                onChange={(e) => setSearchNum(e.target.value)}
              />
              <input 
                placeholder="Année" 
                className="w-16 px-2 text-[10px] font-bold border-l outline-none bg-transparent" 
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
              />
            </div>
            <Button size="sm" className="h-7 px-3 gap-2 text-[9px] font-black uppercase tracking-widest" onClick={() => toast.info("Recherche...")}>
              <Search className="h-3 w-3" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* --- DOSSIERS TAB --- */}
        <TabsContent value="dossiers" className="flex-1 mt-0 min-h-0">
          <Panel title="Suivi des Dossiers">
            <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-card border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-2">Nº</th>
                    <th className="py-2.5 px-2">Importateur</th>
                    <th className="py-2.5 px-2">Réf. Dossier</th>
                    <th className="py-2.5 px-2">Nb Titre</th>
                    <th className="py-2.5 px-2">Réf Titre</th>
                    <th className="py-2.5 px-2">Nb Décl.</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {DOSSIERS.slice(0, 20).map((d, index) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground">{index + 1}</td>
                      <td className="py-2.5 px-2 font-bold">{d.importateur}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-accent">{d.reference}</td>
                      <td className="py-2.5 px-2 font-medium">{d.nbTitres || 1}</td>
                      <td className="py-2.5 px-2 font-mono text-muted-foreground">{d.t1 || "—"}</td>
                      <td className="py-2.5 px-2 font-medium">{d.nbDeclarations || 1}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 bg-muted rounded-full text-[8px] font-black uppercase tracking-tighter">{d.type}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {d.type === 'lot' ? (
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 px-2 gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-500/10">
                                <Car className="h-3 w-3" />
                                Ajouter un véhicule
                              </Button>
                            }
                            title={`LOT ${d.reference} — Ajout Véhicule(s)`}
                            onSubmit={() => toast.success("Véhicule(s) ajouté(s)")}
                          >
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                              {lotVehicles.map((v, idx) => (
                                <div key={v.id} className="p-4 rounded-xl border border-border bg-muted/5 space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-accent">Nº {idx + 1}</span>
                                    {lotVehicles.length > 1 && (
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeLotVehicle(v.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <FormGrid>
                                    <Field label="Véhicule"><Input className="h-8 text-xs" value={v.vehicle} onChange={e => updateLotVehicle(v.id, 'vehicle', e.target.value)} /></Field>
                                    <Field label="Importateur"><Input className="h-8 text-xs" value={v.importateur} onChange={e => updateLotVehicle(v.id, 'importateur', e.target.value)} /></Field>
                                    <Field label="Marchandises"><Input className="h-8 text-xs" value={v.marchandises} onChange={e => updateLotVehicle(v.id, 'marchandises', e.target.value)} /></Field>
                                    <Field label="DRA Réf"><Input className="h-8 text-xs font-mono" value={v.draRef} onChange={e => updateLotVehicle(v.id, 'draRef', e.target.value)} /></Field>
                                    <Field label="Sa Date"><Input type="date" className="h-8 text-xs" value={v.draDate} onChange={e => updateLotVehicle(v.id, 'draDate', e.target.value)} /></Field>
                                    <Field label="Réf Titre"><Input className="h-8 text-xs font-mono" value={v.titreRef} onChange={e => updateLotVehicle(v.id, 'titreRef', e.target.value)} /></Field>
                                    <Field label="Sa Date"><Input type="date" className="h-8 text-xs" value={v.titreDate} onChange={e => updateLotVehicle(v.id, 'titreDate', e.target.value)} /></Field>
                                    <Field label="Conteneur" className="col-span-2">
                                      <div className="flex gap-4 p-2 rounded-lg border bg-background">
                                        {['1x40', '1x20', 'Conventionnel'].map(c => (
                                          <label key={c} className="flex items-center gap-2 text-[10px] font-bold uppercase cursor-pointer">
                                            <input type="checkbox" className="h-3 w-3 rounded border-border" />
                                            {c}
                                          </label>
                                        ))}
                                      </div>
                                    </Field>
                                  </FormGrid>
                                </div>
                              ))}
                              <Button variant="outline" className="w-full h-8 border-dashed gap-2 text-[9px] font-black uppercase" onClick={addLotVehicle}>
                                <Plus className="h-3 w-3" />
                                Ajouter une ligne
                              </Button>
                              <Button className="w-full h-10 font-black uppercase text-xs" onClick={() => toast.success("Ajouté")}>Ajouter</Button>
                            </div>
                          </FormDialog>
                        ) : (
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="ghost" className="h-7 px-2 gap-1.5 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">
                                <Info className="h-3 w-3" />
                                Ajouter informations
                              </Button>
                            }
                            title={`Complétion — ${d.reference}`}
                            onSubmit={() => toast.success("Enregistré")}
                          >
                             <div className="space-y-4">
                               <FormGrid>
                                 <Field label="Référence Titre"><Input className="h-8 text-xs" /></Field>
                                 <Field label="Sa Date"><Input type="date" className="h-8 text-xs" /></Field>
                                 <Field label="T1"><Input className="h-8 text-xs" /></Field>
                                 <Field label="Sa Date"><Input type="date" className="h-8 text-xs" /></Field>
                                 <Field label="Importateur" className="col-span-2"><Input className="h-8 text-xs" defaultValue={d.importateur} /></Field>
                               </FormGrid>
                               <Button className="w-full h-10 font-black uppercase text-xs">Ajouter</Button>
                             </div>
                          </FormDialog>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>

        {/* --- APUREMENT TAB --- */}
        <TabsContent value="apurement" className="flex-1 mt-0 min-h-0">
          <Panel title="Certification d'Apurement">
            <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-card border-b text-[9px] font-black uppercase tracking-widest text-success/70">
                  <tr>
                    <th className="py-2.5 px-2">Nº</th>
                    <th className="py-2.5 px-2">Importateur</th>
                    <th className="py-2.5 px-2">Nb Titre</th>
                    <th className="py-2.5 px-2">Nb Décl.</th>
                    <th className="py-2.5 px-2">Réf. Dossier</th>
                    <th className="py-2.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {DOSSIERS.slice(0, 20).map((d, index) => (
                    <tr key={d.id} className="hover:bg-success/[0.02] transition-colors">
                      <td className="py-2.5 px-2 text-muted-foreground">{index + 1}</td>
                      <td className="py-2.5 px-2 font-bold">{d.importateur}</td>
                      <td className="py-2.5 px-2 font-medium">{d.nbTitres || 1}</td>
                      <td className="py-2.5 px-2 font-medium">{d.nbDeclarations || 1}</td>
                      <td className="py-2.5 px-2 font-mono font-bold text-accent">{d.reference}</td>
                      <td className="py-2.5 px-2 text-right">
                        <FormDialog
                          trigger={
                            <Button size="sm" className="h-7 px-3 gap-1.5 text-[9px] font-black uppercase tracking-widest bg-success hover:bg-success/90 text-white rounded-lg">
                              <FileCheck className="h-3 w-3" />
                              Apurer dossier
                            </Button>
                          }
                          title={`Apurement — ${d.reference}`}
                          onSubmit={() => toast.success("Dossier apuré")}
                        >
                           <div className="space-y-6">
                              <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-4">
                                 <Field label="Référence Douane" required>
                                    <div className="flex border rounded-lg overflow-hidden h-10 bg-background">
                                       <span className="px-3 flex items-center bg-success/10 font-black text-success border-r">E -</span>
                                       <input className="flex-1 px-3 outline-none bg-transparent text-sm font-bold" placeholder="Numéro" />
                                    </div>
                                 </Field>
                                 <Field label="Date" required><Input type="date" className="h-10 text-sm font-bold" /></Field>
                              </div>
                              <Button className="w-full h-12 bg-success hover:bg-success/90 font-black uppercase tracking-widest text-xs">Ajouter</Button>
                           </div>
                        </FormDialog>
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
  );
}

