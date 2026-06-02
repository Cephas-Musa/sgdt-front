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
import { useApi, apiGetWarehouses, apiGetMouvements, apiGetEmptyManifests, apiCreateBarriereEntry, apiCreateMouvement } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BrigadierBarriereDash() {
  const [manifestSearch, setManifestSearch] = useState("");
  const [traversedManifests, setTraversedManifests] = useState<Set<string>>(new Set());
  const [ecTitres, setEcTitres] = useState(1);
  const [vracTitres, setVracTitres] = useState(1);

  const { data: rawMouvements } = useApi(() => apiGetMouvements({}));
  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  const { data: rawWarehouses } = useApi(apiGetWarehouses);
  const mouvements = (rawMouvements as any[]) || [];
  const manifests = (rawManifests as any[]) || [];
  const ENTREPOTS = (rawWarehouses as any[]) || [];

  const filteredManifests = manifests.filter(
    (m: any) => !manifestSearch || (m.reference || "").toLowerCase().includes(manifestSearch.toLowerCase()),
  );

  const handleTraverser = async (id: string) => {
    if (traversedManifests.has(id)) return;
    try {
      await apiCreateBarriereEntry({ empty_manifest_id: id });
      setTraversedManifests((prev) => new Set(prev).add(id));
      toast.success("Véhicule autorisé à traverser");
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors du passage");
    }
  };

  return (
    <div>
      <DashHeader subtitle="Brigadier Barrière — véhicules entrée/sortie, vrac, empty manifest" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Entrées" value={mouvements.filter((m: any) => m.operation_type === "entrant_charge").length} />
        <StatCard icon={ArrowUpFromLine} label="Sorties" value={mouvements.filter((m: any) => m.operation_type === "sortant_charge").length} />
        <StatCard icon={Truck} label="VRAC" value={mouvements.filter((m: any) => m.operation_type === "vrac_sortant").length} />
        <StatCard icon={FileText} label="Manifests" value={manifests.length} />
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
                    onSubmit={() => {
                      const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      const titresDetails = Array.from({ length: ecTitres }, (_, i) => ({
                        reference_t1: get(`ec-t1-${i}`),
                        date_t1: get(`ec-date-t1-${i}`),
                      }));
                      apiCreateMouvement({
                        operation_type: "entrant_charge",
                        plaque: get("ec-plaque"),
                        chauffeur: get("ec-chauffeur"),
                        importateur: get("ec-importateur"),
                        date_mouvement: new Date().toISOString().split("T")[0],
                        reference_dra: get("ec-dra") || undefined,
                        date_dra: get("ec-date-dra") || undefined,
                        reference_t1: titresDetails[0]?.reference_t1 || undefined,
                        date_t1: titresDetails[0]?.date_t1 || undefined,
                        custom_fields: {
                          chassis: get("ec-chassis"),
                          nb_titres: ecTitres,
                          titres_details: titresDetails,
                        },
                      }).then(() => toast.success("Entrée enregistrée")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Nom du déclarant" required>
                        <Input id="ec-declarant" placeholder="Nom obligatoire" />
                      </Field>
                      <Field label="Nom importateur" required>
                        <Input id="ec-importateur" />
                      </Field>
                      <Field label="Plaque véhicule" required>
                        <Input id="ec-plaque" />
                      </Field>
                      <Field label="Numéro du châssis" required>
                        <Input id="ec-chassis" />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. DRA (E-XXX)" required>
                          <Input id="ec-dra" placeholder="E-001" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input id="ec-date-dra" type="date" />
                        </Field>
                      </div>
                      <Field label="Nombre de titres" required>
                        <Input id="ec-titres" type="number" min={1} value={ecTitres} onChange={(e) => setEcTitres(Math.max(1, parseInt(e.target.value) || 1))} />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Du">
                          <Input id="ec-date-du" type="date" />
                        </Field>
                        <Field label="Au">
                          <Input id="ec-date-au" type="date" />
                        </Field>
                      </div>
                      <Field label="Bureau émission doc">
                        <Input id="ec-bureau" />
                      </Field>
                      <Field label="Destination">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="radio" name="dest" value="direct" /> Passage direct
                          </label>
                          <div className="ml-6 space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Réf. douane (E-XXX)">
                                <Input id="ec-ref-douane" placeholder="E-001" />
                              </Field>
                              <Field label="Date">
                                <Input id="ec-date-douane" type="date" />
                              </Field>
                            </div>
                            <Field label="Réf. DRA">
                              <Input id="ec-dra-passage" />
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
                                {ENTREPOTS?.map((e: any) => (
                                  <SelectItem key={e.id} value={e.id}>
                                    {e.nom}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Field>
                    </FormGrid>
                    <div className="space-y-4 mt-4 border-t pt-4">
                      {Array.from({ length: ecTitres }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                          <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                          <FormGrid>
                            <Field label="Réf. titre" required>
                              <Input id={`ec-t1-${i}`} placeholder="T1-..." />
                            </Field>
                            <Field label="Sa date" required>
                              <Input id={`ec-date-t1-${i}`} type="date" />
                            </Field>
                          </FormGrid>
                        </div>
                      ))}
                    </div>
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
                    onSubmit={() => {
                      const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateMouvement({
                        operation_type: "sortant_charge",
                        plaque: get("sc-plaque"),
                        importateur: get("sc-importateur"),
                        date_mouvement: new Date().toISOString().split("T")[0],
                        reference_dra: get("sc-dra") || undefined,
                        custom_fields: {
                          declarant: get("sc-declarant"),
                          etat_sortie: get("sc-etat"),
                          dra: get("sc-dra"),
                          date_dra: get("sc-date-dra"),
                          ref_douane: get("sc-ref-douane"),
                          date_douane: get("sc-date-douane"),
                          bon_sortie: get("sc-bon-sortie"),
                          date_bon: get("sc-date-bon"),
                          agent: get("sc-agent"),
                          lieu_dechargement: get("sc-lieu"),
                        },
                      }).then(() => toast.success("Sortie enregistrée")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Nom du déclarant" required>
                        <Input id="sc-declarant" />
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
                        <Input id="sc-importateur" />
                      </Field>
                      <Field label="Plaque véhicule" required>
                        <Input id="sc-plaque" />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Référence DRA" required>
                          <Input id="sc-dra" placeholder="DRA-…" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input id="sc-date-dra" type="date" />
                        </Field>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. douane (E-XXX)" required>
                          <Input id="sc-ref-douane" placeholder="E-001" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input id="sc-date-douane" type="date" />
                        </Field>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. bon de sortie" required>
                          <Input id="sc-bon-sortie" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input id="sc-date-bon" type="date" />
                        </Field>
                      </div>
                      <Field label="Agent émetteur" required>
                        <Input id="sc-agent" />
                      </Field>
                      <Field label="Lieu de déchargement">
                        <Input id="sc-lieu" />
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
                      onSubmit={() => {
                        const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                        const titresDetails = Array.from({ length: vracTitres }, (_, i) => ({
                          reference_t1: get(`vrac-t1-${i}`),
                          date_t1: get(`vrac-date-t1-${i}`),
                        }));
                        apiCreateMouvement({
                          operation_type: "vrac_sortant",
                          plaque: get("vrac-plaque"),
                          chauffeur: get("vrac-declarant"),
                          importateur: get("vrac-importateur"),
                          date_mouvement: new Date().toISOString().split("T")[0],
                          custom_fields: {
                            chassis: get("vrac-chassis"),
                            nb_titres: vracTitres,
                            titres_details: titresDetails,
                            couleur: get("vrac-couleur"),
                            marque: get("vrac-marque"),
                            annee: get("vrac-annee"),
                          },
                        }).then(() => toast.success("VRAC enregistré")).catch((e) => toast.error(e.message));
                      }}
                    >
                      <FormGrid>
                        <Field label="Nom du déclarant" required>
                          <Input id="vrac-declarant" />
                        </Field>
                        <Field label="Importateur" required>
                          <Input id="vrac-importateur" />
                        </Field>
                        <Field label="Numéro châssis" required>
                          <Input id="vrac-chassis" />
                        </Field>
                        <Field label="Nombre de titres" required>
                          <Input id="vrac-titres" type="number" min={1} value={vracTitres} onChange={(e) => setVracTitres(Math.max(1, parseInt(e.target.value) || 1))} />
                        </Field>
                        <Field label="Couleur véhicule">
                          <Input id="vrac-couleur" />
                        </Field>
                        <Field label="Entrepôt destination">
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {ENTREPOTS?.map((e: any) => (
                                <SelectItem key={e.id} value={e.id}>
                                  {e.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Marque véhicule">
                          <Input id="vrac-marque" />
                        </Field>
                        <Field label="Année" required>
                          <Input id="vrac-annee" type="number" placeholder="2025" />
                        </Field>
                      </FormGrid>
                      <div className="space-y-4 mt-4 border-t pt-4">
                        {Array.from({ length: vracTitres }).map((_, i) => (
                          <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                            <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                            <FormGrid>
                              <Field label="Réf. titre" required>
                                <Input id={`vrac-t1-${i}`} placeholder="T1-..." />
                              </Field>
                              <Field label="Sa date" required>
                                <Input id={`vrac-date-t1-${i}`} type="date" />
                              </Field>
                            </FormGrid>
                          </div>
                        ))}
                      </div>
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
