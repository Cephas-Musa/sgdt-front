import { useState } from "react";
import { Truck, ArrowDownToLine, ArrowUpFromLine, Search, FileText, Calendar, CheckCircle } from "lucide-react";
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
import { EMPTY_MANIFESTS } from "@/lib/mock";
import { useApi, apiGetWarehouses } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BrigadierBarriereDash() {
  const [manifestSearch, setManifestSearch] = useState("");
  const [traversedManifests, setTraversedManifests] = useState<Set<string>>(new Set());

  const filteredManifests = EMPTY_MANIFESTS.filter(
    (m) => !manifestSearch || (m.reference || "").toLowerCase().includes(manifestSearch.toLowerCase()),
  );

  const handleTraverser = (id: string) => {
    if (traversedManifests.has(id)) return;
    
    // Simulating manifest verification
    const manifestExists = EMPTY_MANIFESTS.some(m => m.id === id);
    if (!manifestExists) {
      toast.error("Le manifeste n'existe pas.");
      return;
    }

    setTraversedManifests((prev) => new Set(prev).add(id));
    toast.success("Véhicule autorisé à traverser (Vérification effectuée < 4 min)");
  };

  return (
    <div>
      <DashHeader subtitle="Brigadier Barrière — véhicules entrée/sortie, vrac, empty manifest" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Entrées" value={18} />
        <StatCard icon={ArrowUpFromLine} label="Sorties" value={14} />
        <StatCard icon={Truck} label="VRAC" value={6} />
        <StatCard icon={FileText} label="Manifests" value={EMPTY_MANIFESTS.length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="vehicule">
          <TabsList>
            <TabsTrigger value="vehicule">Véhicule</TabsTrigger>
            <TabsTrigger value="vrac">VRAC</TabsTrigger>
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicule" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* ENTRÉE CHARGÉ */}
              <Panel
                title="Entrée — Véhicule chargé"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Entrée véhicule chargé"
                    onSubmit={() => toast.success("Enregistré")}
                  >
                    <FormGrid>
                      <Field label="Nom du déclarant" required>
                        <Input placeholder="Nom obligatoire" />
                      </Field>
                      <Field label="Nom importateur" required>
                        <Input />
                      </Field>
                      <Field label="Plaque véhicule" required>
                        <Input />
                      </Field>
                      <Field label="Numéro du châssis" required>
                        <Input />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Référence DRA (E-XXX)" required>
                          <Input placeholder="E-001" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input type="date" />
                        </Field>
                      </div>
                      <Field label="Nombre de titres" required>
                        <Input type="number" />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Du">
                          <Input type="date" />
                        </Field>
                        <Field label="Au">
                          <Input type="date" />
                        </Field>
                      </div>
                      <Field label="Bureau émission doc">
                        <Input />
                      </Field>
                      <Field label="Destination">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="radio" name="dest" value="direct" /> Passage direct
                          </label>
                          <div className="ml-6 space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Réf. douane (E-XXX)">
                                <Input placeholder="E-001" />
                              </Field>
                              <Field label="Date">
                                <Input type="date" />
                              </Field>
                            </div>
                            <Field label="Réf. DRA">
                              <Input />
                            </Field>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="radio" name="dest" value="entrepot" /> Entrepôt
                          </label>
                          <div className="ml-6">
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner entrepôt" />
                              </SelectTrigger>
                              <SelectContent>
                                {ENTREPOTS?.map((e) => (
                                  <SelectItem key={e.id} value={e.id}>
                                    {e.nom}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Field>
                      <Field label="Documents d'importation validés" required>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="docs_check" />
                          <label htmlFor="docs_check" className="text-sm">Vérifier la cohérence des données</label>
                        </div>
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Gestion des entrées chargées (Contrôle Superviseur)
                </div>
              </Panel>

              {/* SORTIE CHARGÉ */}
              <Panel
                title="Sortie — Véhicule chargé"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Sortie véhicule chargé"
                    onSubmit={() => toast.success("Enregistré")}
                  >
                    <FormGrid>
                      <Field label="Nom du déclarant" required>
                        <Input />
                      </Field>
                      <Field label="État de sortie" required>
                        <Select defaultValue="meaningful">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="empty">Empty (vide)</SelectItem>
                            <SelectItem value="meaningful">Meaningful (chargé)</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Importateur" required>
                        <Input />
                      </Field>
                      <Field label="Plaque véhicule" required>
                        <Input />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Référence DRA" required>
                          <Input placeholder="DRA-…" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input type="date" />
                        </Field>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. douane (E-XXX)" required>
                          <Input placeholder="E-001" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input type="date" />
                        </Field>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. bon de sortie" required>
                          <Input />
                        </Field>
                        <Field label="Sa date" required>
                          <Input type="date" />
                        </Field>
                      </div>
                      <Field label="Agent émetteur" required>
                        <Input />
                      </Field>
                      <Field label="Réf. dossier" required>
                        <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                          <span className="flex items-center px-3 border-r border-input bg-muted/50 font-bold text-muted-foreground select-none">RD-</span>
                          <input 
                            className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50 h-9"
                            placeholder="0001" 
                            inputMode="numeric"
                            onChange={(e) => { 
                              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 9);
                            }}
                          />
                        </div>
                      </Field>
                      <Field label="Lieu de déchargement">
                        <Input />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Gestion des sorties chargées (Contrôle Superviseur)
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="vrac" className="mt-4">
            <div className="grid gap-4">
              <Panel
                title="VRAC — Véhicule entrant"
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => window.print()}>Imprimer</Button>
                    <FormDialog
                      trigger={<Button size="sm">Nouveau</Button>}
                      title="Entrée véhicule automobile (VRAC)"
                      onSubmit={() => toast.success("Enregistré")}
                    >
                      <FormGrid>
                        <Field label="Nom du déclarant" required>
                          <Input />
                        </Field>
                        <Field label="Importateur" required>
                          <Input />
                        </Field>
                        <Field label="Numéro châssis" required>
                          <Input />
                        </Field>
                        <Field label="Nombre de titres" required>
                          <Input type="number" />
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
                          <Field label="T1" required>
                            <Input placeholder="T1-…" />
                          </Field>
                          <Field label="Sa date" required>
                            <Input type="date" />
                          </Field>
                        </div>
                        <Field label="Couleur véhicule">
                          <Input />
                        </Field>
                        <Field label="Entrepôt destination">
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {ENTREPOTS?.map((e) => (
                                <SelectItem key={e.id} value={e.id}>
                                  {e.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Marque véhicule">
                          <Input />
                        </Field>
                        <Field label="Année" required>
                          <Input type="number" placeholder="2025" />
                        </Field>
                      </FormGrid>
                    </FormDialog>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" /> Trier par intervalle :
                    </div>
                    <Input type="date" className="w-auto h-8 text-xs" />
                    <span className="text-muted-foreground">à</span>
                    <Input type="date" className="w-auto h-8 text-xs" />
                  </div>
                  <div className="py-3 text-center text-sm text-muted-foreground bg-muted/20 rounded-md">
                    Entrée véhicule automobile — Vérification sécurité et cohérence active
                  </div>
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Numéro manifest…"
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline">
                <Search className="mr-1 h-4 w-4" />
                Rechercher
              </Button>
            </div>
            <Panel title={`Résultats (${filteredManifests.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Manifeste Nº</th>
                      <th className="px-3 py-2">Immatriculation</th>
                      <th className="px-3 py-2">Marque</th>
                      <th className="px-3 py-2">Receveur</th>
                      <th className="px-3 py-2">Barrière Contrôle</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManifests.length > 0 ? (
                      filteredManifests.map((m, i) => {
                        const isTraversed = traversedManifests.has(m.id);
                        // Mocking statuses for Receveur and Controle
                        const isReceveurConfirmed = i % 2 === 0;
                        const isControleChecked = i % 3 === 0;
                        
                        return (
                          <tr key={m.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-2 font-mono font-medium">{m.reference}</td>
                            <td className="px-3 py-2">{m.vehicule}</td>
                            <td className="px-3 py-2">{m.marque}</td>
                            <td className="px-3 py-2">
                              {isReceveurConfirmed ? (
                                <span className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success border border-success/20">
                                  <CheckCircle className="h-2.5 w-2.5" /> CACHETÉ
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">En attente</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isControleChecked ? (
                                <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-500/20">
                                  <CheckCircle className="h-2.5 w-2.5" /> VÉRIFIÉ
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">En attente</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isTraversed ? (
                                <span className="text-success font-medium flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Traversé
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">En attente</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                size="sm"
                                variant={isTraversed ? "ghost" : "default"}
                                disabled={isTraversed}
                                onClick={() => handleTraverser(m.id)}
                                className={cn(
                                  "font-bold uppercase tracking-wider transition-all",
                                  !isTraversed && "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg scale-105"
                                )}
                              >
                                {isTraversed ? (
                                  <span className="flex items-center gap-1 text-success">
                                    <CheckCircle className="h-4 w-4" /> Confirmé
                                  </span>
                                ) : (
                                  "Traverser"
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground italic">
                          {manifestSearch ? "Le manifeste n'existe pas." : "Aucun manifeste disponible."}
                        </td>
                      </tr>
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
