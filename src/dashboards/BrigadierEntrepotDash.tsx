import { useState } from "react";
import { Truck, ArrowDownToLine, ArrowUpFromLine, Package, Search } from "lucide-react";
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
import { useApi, apiGetMouvements, apiCreateMouvement, apiGetVracs, apiCreateVrac, apiCreateStockageMouvement } from "@/lib/api";
import { toast } from "sonner";

export default function BrigadierEntrepotDash() {
  const [searchChassis, setSearchChassis] = useState("");
  const [ecEntPotTitres, setEcEntPotTitres] = useState(1);

  const { data: rawMouvements } = useApi(() => apiGetMouvements({}));
  const { data: rawVracs } = useApi(() => apiGetVracs({}));
  const mouvements = (rawMouvements as any[]) || [];
  const vracs = (rawVracs as any[]) || [];
  const entrants = mouvements.filter((m: any) => m.operation_type?.startsWith("entrant"));
  const sortants = mouvements.filter((m: any) => m.operation_type?.startsWith("sortant"));

  return (
    <div>
      <DashHeader subtitle="Brigadier Entrepôt — véhicules, vracs, colis (entrant & sortant)" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Entrants" value={entrants.length} />
        <StatCard icon={ArrowUpFromLine} label="Sortants" value={sortants.length} />
        <StatCard icon={Truck} label="VRAC" value={vracs.length} />
        <StatCard icon={Package} label="Colis" value={0} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="vehicules">
          <TabsList>
            <TabsTrigger value="vehicules">Véhicules</TabsTrigger>
            <TabsTrigger value="vracs">Vracs</TabsTrigger>
            <TabsTrigger value="colis">Colis</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicules" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* ENTRANT CHARGÉ */}
              <Panel
                title="Entrant — Chargé"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Véhicule entrant chargé"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      const titresDetails = Array.from({ length: ecEntPotTitres }, (_, i) => ({
                        reference_t1: g(`ec-ent-pot-t1-${i}`),
                        date_t1: g(`ec-ent-pot-date-t1-${i}`),
                      }));
                      apiCreateMouvement({
                        operation_type: "entrant_charge",
                        plaque: g("ec-ent-pot-plaque"),
                        chauffeur: g("ec-ent-pot-declarant"),
                        importateur: g("ec-ent-pot-importateur"),
                        date_mouvement: g("ec-ent-pot-date"),
                        reference_dra: g("ec-ent-pot-dra") || undefined,
                        date_dra: g("ec-ent-pot-date-dra") || undefined,
                        reference_t1: titresDetails[0]?.reference_t1 || undefined,
                        date_t1: titresDetails[0]?.date_t1 || undefined,
                        custom_fields: {
                          nb_titres: ecEntPotTitres,
                          titres_details: titresDetails,
                        },
                      }).then(() => toast.success("Enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Nom" required>
                        <Input id="ec-ent-pot-nom" />
                      </Field>
                      <Field label="Plaque" required>
                        <Input id="ec-ent-pot-plaque" />
                      </Field>
                      <Field label="Véhicule">
                        <Input id="ec-ent-pot-vehicule" />
                      </Field>
                      <Field label="Provenance" required>
                        <Input id="ec-ent-pot-provenance" />
                      </Field>
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Field label="Réf. DRA (E-XXX)" required>
                          <Input id="ec-ent-pot-dra" placeholder="E-001" />
                        </Field>
                        <Field label="Sa date" required>
                          <Input id="ec-ent-pot-date-dra" type="date" />
                        </Field>
                      </div>
                      <Field label="Nombre de titres" required>
                        <Input id="ec-ent-pot-titres" type="number" min={1} value={ecEntPotTitres} onChange={(e) => setEcEntPotTitres(Math.max(1, parseInt(e.target.value) || 1))} />
                      </Field>
                      <Field label="Date d'entrée" required>
                        <Input id="ec-ent-pot-date" type="date" />
                      </Field>
                      <Field label="Nom déclarant" required>
                        <Input id="ec-ent-pot-declarant" />
                      </Field>
                    </FormGrid>
                    <div className="space-y-4 mt-4 border-t pt-4">
                      {Array.from({ length: ecEntPotTitres }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                          <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                          <FormGrid>
                            <Field label="Réf. titre" required>
                              <Input id={`ec-ent-pot-t1-${i}`} placeholder="T1-..." />
                            </Field>
                            <Field label="Sa date" required>
                              <Input id={`ec-ent-pot-date-t1-${i}`} type="date" />
                            </Field>
                          </FormGrid>
                        </div>
                      ))}
                    </div>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Véhicule entrant chargé
                </div>
              </Panel>

              {/* ENTRANT VIDE */}
              <Panel
                title="Entrant — Vide"
                actions={
                  <FormDialog
                    trigger={
                      <Button size="sm" variant="outline">
                        Nouveau
                      </Button>
                    }
                    title="Véhicule entrant vide"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateMouvement({
                        operation_type: "entrant_vide",
                        plaque: g("ev-plaque"),
                        chauffeur: g("ev-chauffeur"),
                        date_mouvement: new Date().toISOString().split("T")[0],
                      }).then(() => toast.success("Enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Plaque" required>
                        <Input id="ev-plaque" />
                      </Field>
                      <Field label="Nom chauffeur" required>
                        <Input id="ev-chauffeur" />
                      </Field>
                      <Field label="Activité attendue">
                        <Input id="ev-activite" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Véhicule entrant vide
                </div>
              </Panel>

              {/* SORTANT VIDE */}
              <Panel
                title="Sortant — Vide"
                actions={
                  <FormDialog
                    trigger={
                      <Button size="sm" variant="outline">
                        Nouveau
                      </Button>
                    }
                    title="Véhicule sortant vide"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateMouvement({
                        operation_type: "sortant_vide",
                        plaque: g("sv-plaque"),
                        date_mouvement: g("sv-date") || new Date().toISOString().split("T")[0],
                        reference_dra: g("sv-dossier") || undefined,
                      }).then(() => toast.success("Enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Plaque" required>
                        <Input id="sv-plaque" />
                      </Field>
                      <Field label="Véhicule">
                        <Input id="sv-vehicule" />
                      </Field>
                      <Field label="Opération effectuée">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dechargement">Déchargement</SelectItem>
                            <SelectItem value="transbordement">Transbordement</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Réf. déchargement">
                        <Input id="sv-ref-dechargement" />
                      </Field>
                      <Field label="Empty manifest">
                        <Input id="sv-empty-manifest" />
                      </Field>
                      <Field label="Date">
                        <Input id="sv-date" type="date" />
                      </Field>
                      <Field label="Réf. DRA (E-XXX)">
                        <Input id="sv-dossier" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Véhicule sortant vide
                </div>
              </Panel>

              {/* SORTANT CHARGÉ */}
              <Panel
                title="Sortant — Chargé"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Véhicule sortant chargé"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateMouvement({
                        operation_type: "sortant_charge",
                        plaque: g("sc-ent-pot-plaque"),
                        importateur: g("sc-ent-pot-importateur"),
                        date_mouvement: g("sc-ent-pot-date") || new Date().toISOString().split("T")[0],
                        reference_dra: g("sc-ent-pot-ref-douane") || undefined,
                      }).then(() => toast.success("Enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Importateur" required>
                        <Input id="sc-ent-pot-importateur" />
                      </Field>
                      <Field label="Plaque" required>
                        <Input id="sc-ent-pot-plaque" />
                      </Field>
                      <Field label="Véhicule">
                        <Input id="sc-ent-pot-vehicule" />
                      </Field>
                      <Field label="Réf. douane" required>
                        <Input id="sc-ent-pot-ref-douane" />
                      </Field>
                      <Field label="Date" required>
                        <Input id="sc-ent-pot-date" type="date" />
                      </Field>
                      <Field label="Réf. bon de sortie" required>
                        <Input id="sc-ent-pot-bon-sortie" />
                      </Field>
                      <Field label="Date bon" required>
                        <Input id="sc-ent-pot-date-bon" type="date" />
                      </Field>
                      <Field label="Agent émetteur" required>
                        <Input id="sc-ent-pot-agent" />
                      </Field>
                      <Field label="Réf. dossier farde">
                        <Input id="sc-ent-pot-dossier" />
                      </Field>
                      <Field label="Lieu de déchargement">
                        <Input id="sc-ent-pot-lieu" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Véhicule sortant chargé
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="vracs" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* VRAC ENTRANT */}
              <Panel
                title="Vrac — Entrant"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Vrac entrant"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateVrac({
                        reference: `VRAC-${Date.now()}`,
                        type: "direct",
                        importateur: g("vrac-ent-importateur"),
                        plaque: g("vrac-ent-chassis"),
                        quantite: parseInt(g("vrac-ent-titres") || "1"),
                        poids: 0,
                      }).then(() => toast.success("VRAC entrant enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Importateur" required>
                        <Input id="vrac-ent-importateur" />
                      </Field>
                      <Field label="Numéro châssis" required>
                        <Input id="vrac-ent-chassis" />
                      </Field>
                      <Field label="Nombre titres">
                        <Input id="vrac-ent-titres" type="number" />
                      </Field>
                      <Field label="Référence DRA" required>
                        <Input id="vrac-ent-dra" />
                      </Field>
                      <Field label="T1" required>
                        <Input id="vrac-ent-t1" />
                      </Field>
                      <Field label="Marque" required>
                        <Input id="vrac-ent-marque" />
                      </Field>
                      <Field label="Couleur">
                        <Input id="vrac-ent-couleur" />
                      </Field>
                      <Field label="Année" required>
                        <Input id="vrac-ent-annee" type="number" />
                      </Field>
                      <Field label="Nº moteur">
                        <Input id="vrac-ent-moteur" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">Vrac entrant</div>
              </Panel>

              {/* VRAC SORTANT */}
              <Panel
                title="Vrac — Sortant"
                actions={
                  <FormDialog
                    trigger={
                      <Button size="sm" variant="outline">
                        Nouveau
                      </Button>
                    }
                    title="Vrac sortant"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateVrac({
                        reference: `VRAC-${Date.now()}`,
                        type: "direct",
                        importateur: g("vrac-sort-importateur"),
                        plaque: g("vrac-sort-chassis"),
                        quantite: 1,
                        poids: 0,
                        status: "sorti",
                      }).then(() => toast.success("VRAC sortant enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Numéro châssis" required>
                        <Input id="vrac-sort-chassis" />
                      </Field>
                      <Field label="Réf. déclaration">
                        <Input id="vrac-sort-ref" />
                      </Field>
                      <Field label="Date">
                        <Input id="vrac-sort-date" type="date" />
                      </Field>
                      <Field label="Bon de sortie">
                        <Input id="vrac-sort-bon" />
                      </Field>
                      <Field label="Date bon">
                        <Input id="vrac-sort-date-bon" type="date" />
                      </Field>
                      <Field label="Matricule">
                        <Input id="vrac-sort-matricule" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Recherche par châssis…"
                      value={searchChassis}
                      onChange={(e) => setSearchChassis(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button variant="outline">
                      <Search className="mr-1 h-4 w-4" />
                      Rechercher
                    </Button>
                  </div>
                  <div className="py-3 text-center text-sm text-muted-foreground">
                    Recherchez un véhicule par châssis ou ajoutez manuellement.
                  </div>
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="colis" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel
                title="Colis — Entrant"
                actions={
                  <FormDialog
                    trigger={<Button size="sm">Nouveau</Button>}
                    title="Colis entrant"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateStockageMouvement({
                        type_mouvement: "entree",
                        entrepot_id: "default",
                        quantite: parseInt(g("colis-ent-qte") || "0"),
                        poids: 0,
                      }).then(() => toast.success("Colis entrant enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Nom" required>
                        <Input id="colis-ent-nom" />
                      </Field>
                      <Field label="Plaque" required>
                        <Input id="colis-ent-plaque" />
                      </Field>
                      <Field label="Provenance" required>
                        <Input id="colis-ent-prov" />
                      </Field>
                      <Field label="Référence DRA">
                        <Input id="colis-ent-dra" />
                      </Field>
                      <Field label="T1">
                        <Input id="colis-ent-t1" />
                      </Field>
                      <Field label="Date d'entrée">
                        <Input id="colis-ent-date" type="date" />
                      </Field>
                      <Field label="Nombre colis">
                        <Input id="colis-ent-qte" type="number" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">Colis entrant</div>
              </Panel>

              <Panel
                title="Colis — Sortant"
                actions={
                  <FormDialog
                    trigger={
                      <Button size="sm" variant="outline">
                        Nouveau
                      </Button>
                    }
                    title="Colis sortant"
                    onSubmit={() => {
                      const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                      apiCreateStockageMouvement({
                        type_mouvement: "sortie",
                        entrepot_id: "default",
                        quantite: parseInt(g("colis-sort-qte") || "0"),
                        poids: 0,
                        dossier_id: g("colis-sort-dossier") || undefined,
                      }).then(() => toast.success("Colis sortant enregistré")).catch((e) => toast.error(e.message));
                    }}
                  >
                    <FormGrid>
                      <Field label="Plaque" required>
                        <Input id="colis-sort-plaque" />
                      </Field>
                      <Field label="Réf. dossier">
                        <Input id="colis-sort-dossier" />
                      </Field>
                      <Field label="Bon de sortie">
                        <Input id="colis-sort-bon" />
                      </Field>
                      <Field label="Date">
                        <Input id="colis-sort-date" type="date" />
                      </Field>
                      <Field label="Nombre colis">
                        <Input id="colis-sort-qte" type="number" />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="py-3 text-center text-sm text-muted-foreground">Colis sortant</div>
              </Panel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
