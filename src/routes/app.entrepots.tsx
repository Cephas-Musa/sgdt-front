import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DataTable } from "@/components/DataTable";
import { useApi, apiGetWarehouses, apiCreateWarehouse, apiUpdateWarehouse, apiDeleteWarehouse, apiGetMouvements, apiGetVracs, apiGetMouvementsStockage, apiCreateMouvement, apiCreateVrac, apiCreateStockageMouvement, apiGetBureauxDouaniers } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Container,
  Package,
  Truck,
  Plus,
  RotateCcw,
  CheckCircle2,
  Clock,
  BarChart3,
  Search
} from "lucide-react";

export const Route = createFileRoute("/app/entrepots")({
  component: EntrepotsPage,
});

/* Composant de recherche pour les véhicules */
const VehicleSearchBar = () => (
  <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-4 items-center">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">Réf:</span>
      <Input placeholder="Dossier ou Document..." className="h-7 text-xs w-48" />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">Période:</span>
      <input type="date" className="h-7 text-xs border rounded bg-background px-1" />
      <span className="text-muted-foreground">-</span>
      <input type="date" className="h-7 text-xs border rounded bg-background px-1" />
    </div>
    <Button size="sm" variant="outline" className="h-7 gap-1">
      <Search className="h-3.5 w-3.5" /> Chercher
    </Button>
  </div>
);

/* Données entrepôt simulées — supprimées, remplacées par API */

function BrigadierEntrepotForms() {
  const [nombreTitres, setNombreTitres] = useState(1);
  const [operationEntrantVide, setOperationEntrantVide] = useState("");
  const [operationSortantVide, setOperationSortantVide] = useState("");

  return (
    <FormDialog
      trigger={
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Mouvement entrepôt
        </Button>
      }
      title="Mouvement entrepôt"
      onSubmit={() => {
        const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
        const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])')?.getAttribute("aria-label") || "ec";
        if (activeTab === "ec") {
          const titresDetails = Array.from({ length: nombreTitres }, (_, i) => ({
            reference_t1: g(`aef-ec-t1-${i}`),
            date_t1: g(`aef-ec-date-titre-${i}`),
          }));
          apiCreateMouvement({
            operation_type: "entrant_charge",
            plaque: g("aef-ec-plaque"),
            importateur: g("aef-ec-nom"),
            date_mouvement: g("aef-ec-date") || new Date().toISOString().split("T")[0],
            reference_dra: g("aef-ec-dra") || undefined,
            date_dra: g("aef-ec-date-dra") || undefined,
            reference_t1: titresDetails[0]?.reference_t1 || undefined,
            date_t1: titresDetails[0]?.date_t1 || undefined,
            custom_fields: {
              nb_titres: nombreTitres,
              titres_details: titresDetails,
            },
          }).then(() => toast.success("Entrant chargé enregistré")).catch((e) => toast.error(e.message));
        } else if (activeTab === "ev") {
          apiCreateMouvement({
            operation_type: "entrant_vide",
            plaque: g("aef-ev-plaque"),
            chauffeur: g("aef-ev-chauffeur"),
            date_mouvement: g("aef-ev-date") || new Date().toISOString().split("T")[0],
          }).then(() => toast.success("Entrant vide enregistré")).catch((e) => toast.error(e.message));
        } else if (activeTab === "sc") {
          apiCreateMouvement({
            operation_type: "sortant_charge",
            plaque: g("aef-sc-plaque"),
            importateur: g("aef-sc-importateur"),
            date_mouvement: g("aef-sc-date") || new Date().toISOString().split("T")[0],
          }).then(() => toast.success("Sortant chargé enregistré")).catch((e) => toast.error(e.message));
        } else if (activeTab === "sv") {
          apiCreateMouvement({
            operation_type: "sortant_vide",
            plaque: g("aef-sv-plaque"),
            date_mouvement: g("aef-sv-date") || new Date().toISOString().split("T")[0],
          }).then(() => toast.success("Sortant vide enregistré")).catch((e) => toast.error(e.message));
        } else if (activeTab === "vrac") {
          apiCreateVrac({
            reference: `VRAC-${Date.now()}`,
            type: "direct",
            importateur: g("aef-vrac-importateur"),
            plaque: g("aef-vrac-moteur"),
            quantite: 1,
            poids: 0,
          }).then(() => toast.success("VRAC sortant enregistré")).catch((e) => toast.error(e.message));
        }
      }}
    >
      <Tabs defaultValue="ec">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="ec">Entrant chargé</TabsTrigger>
          <TabsTrigger value="ev">Entrant vide</TabsTrigger>
          <TabsTrigger value="sc">Sortant chargé</TabsTrigger>
          <TabsTrigger value="sv">Sortant vide</TabsTrigger>
          <TabsTrigger value="vrac">VRAC sortant</TabsTrigger>
        </TabsList>
        <TabsContent value="ec" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Nom">
              <Input id="aef-ec-nom" />
            </Field>
            <Field label="Plaque véhicule">
              <Input id="aef-ec-plaque" />
            </Field>
            <Field label="Provenance">
              <Input id="aef-ec-provenance" />
            </Field>
            <Field label="Date d'entrée">
              <Input id="aef-ec-date" type="date" />
            </Field>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Field label="Réf. DRA (E-XXX)">
                <Input id="aef-ec-dra" placeholder="E-001" />
              </Field>
              <Field label="Sa date">
                <Input id="aef-ec-date-dra" type="date" />
              </Field>
            </div>
            <Field label="Nombre de titres">
              <Input id="aef-ec-titres"
                type="number" 
                min={1} 
                value={nombreTitres} 
                onChange={(e) => setNombreTitres(Math.max(1, parseInt(e.target.value) || 1))} 
              />
            </Field>
            <Field label="Nom déclarant">
              <Input id="aef-ec-declarant" />
            </Field>
          </FormGrid>
          
          <div className="space-y-4 mt-4 border-t pt-4">
            {Array.from({ length: nombreTitres }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                <FormGrid>
                  <Field label="Réf. titre">
                    <Input id={`aef-ec-t1-${i}`} />
                  </Field>
                  <Field label="Sa date">
                    <Input id={`aef-ec-date-titre-${i}`} type="date" />
                  </Field>
                </FormGrid>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ev" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque">
              <Input id="aef-ev-plaque" />
            </Field>
            <Field label="Date d'entrée">
              <Input id="aef-ev-date" type="date" />
            </Field>
            <Field label="Nom chauffeur">
              <Input id="aef-ev-chauffeur" />
            </Field>
            <Field label="Type d'opération">
              <select 
                value={operationEntrantVide}
                onChange={(e) => setOperationEntrantVide(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionner</option>
                <option value="Chargement">Chargement</option>
                <option value="Transbordement">Transbordement</option>
                <option value="Autre">Autre</option>
              </select>
            </Field>
            {operationEntrantVide === "Autre" && (
              <Field label="Spécifier l'opération">
                <Input id="aef-ev-autre" placeholder="Saisir le type d'opération" />
              </Field>
            )}
          </FormGrid>
        </TabsContent>
        <TabsContent value="sc" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input id="aef-sc-importateur" />
            </Field>
            <Field label="Plaque">
              <Input id="aef-sc-plaque" />
            </Field>
            <Field label="Réf. douane">
              <Input id="aef-sc-ref-douane" />
            </Field>
            <Field label="Date Réf. douane">
              <Input id="aef-sc-date-douane" type="date" />
            </Field>
            <Field label="Bon de sortie">
              <Input id="aef-sc-bon-sortie" />
            </Field>
            <Field label="Date Bon de sortie">
              <Input id="aef-sc-date-bon" type="date" />
            </Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="sv" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque">
              <Input id="aef-sv-plaque" />
            </Field>
            <Field label="Opération effectuée">
              <select 
                value={operationSortantVide}
                onChange={(e) => setOperationSortantVide(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Sélectionner</option>
                <option value="Déchargement">Déchargement</option>
                <option value="Transbordement">Transbordement</option>
              </select>
            </Field>
            <Field label="Empty manifest">
              <Input id="aef-sv-emp" />
            </Field>
            <Field label="Date Empty manifest">
              <Input id="aef-sv-date-emp" type="date" />
            </Field>
          </FormGrid>

          {operationSortantVide === "Déchargement" && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/10 space-y-3">
              <h4 className="text-sm font-semibold text-accent">Détails Déchargement</h4>
              <FormGrid>
                <Field label="Bâtiment">
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Sélectionner bâtiment</option>
                    {[]/* entrepots removed for brevity */}
                  </select>
                </Field>
                <Field label="Zone / espace spécifique">
                  <Input id="aef-sv-zone" />
                </Field>
              </FormGrid>
            </div>
          )}

          {operationSortantVide === "Transbordement" && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/10 space-y-3">
              <h4 className="text-sm font-semibold text-accent">Détails Transbordement</h4>
              <FormGrid>
                <Field label="Plaque avant du véhicule">
                  <Input id="aef-sv-plaque-avant" />
                </Field>
                <Field label="Plaque arrière du véhicule">
                  <Input id="aef-sv-plaque-arriere" />
                </Field>
              </FormGrid>
            </div>
          )}
        </TabsContent>
        <TabsContent value="vrac" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input id="aef-vrac-importateur" />
            </Field>
            <Field label="Marque véhicule">
              <Input id="aef-vrac-marque" />
            </Field>
            <Field label="Couleur">
              <Input id="aef-vrac-couleur" />
            </Field>
            <Field label="Année">
              <Input id="aef-vrac-annee" type="number" />
            </Field>
            <Field label="Numéro moteur">
              <Input id="aef-vrac-moteur" />
            </Field>
            <Field label="Liquidateur">
              <Input id="aef-vrac-liquidateur" />
            </Field>
            <Field label="Date liquidation">
              <Input id="aef-vrac-date-liq" type="date" />
            </Field>
            <Field label="Matricule Agent BS">
              <Input id="aef-vrac-matricule" />
            </Field>
          </FormGrid>
        </TabsContent>
      </Tabs>
    </FormDialog>
  );
}

function EntrepotsPage() {
  const { user } = useAuth();
  const { data: rawWarehouses, reload } = useApi(apiGetWarehouses);
  const { data: rawBureaux } = useApi(apiGetBureauxDouaniers);
  const bureaux = (rawBureaux as any[] || []);
  const entrepots = (rawWarehouses as any[]) || [];
  const { data: rawMouvements } = useApi(() => apiGetMouvements({}));
  const { data: rawVracs } = useApi(() => apiGetVracs({}));
  const { data: rawStockage } = useApi(() => apiGetMouvementsStockage({}));
  const mouvements = (rawMouvements as any[]) || [];
  const vracs = (rawVracs as any[]) || [];
  const stockageMouvements = (rawStockage as any[]) || [];

  const entrantCharge = mouvements.filter((m: any) => m.operation_type === "entrant_charge");
  const entrantVide = mouvements.filter((m: any) => m.operation_type === "entrant_vide");
  const sortantCharge = mouvements.filter((m: any) => m.operation_type === "sortant_charge");
  const sortantVide = mouvements.filter((m: any) => m.operation_type === "sortant_vide");
  const transbordements = stockageMouvements.filter((m: any) => m.type_mouvement === "transbordement");
  const vracSortant = vracs;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [formData, setFormData] = useState({ nom: "", code: "", bureau: "", ville: "", capacite: 0 });
  const [loading, setLoading] = useState(false);

  const getUserBureau = () => {
    if (user?.bureau) return user.bureau;
    if (user?.bureau_id && bureaux.length > 0) {
      const b = bureaux.find((x: any) => x.id === user?.bureau_id);
      if (b) return b.denomination;
    }
    if (user?.province && bureaux.length > 0) {
      const b = bureaux.find((x: any) => x.province === user?.province);
      if (b) return b.denomination;
    }
    return "";
  };

  const openCreate = () => {
    setEditingId("");
    setFormData({ nom: "", code: "", bureau: getUserBureau(), ville: "", capacite: 0 });
    setIsDialogOpen(true);
  };

  const openEdit = (e: any) => {
    setEditingId(e.id);
    setFormData({ nom: e.nom, code: e.code, bureau: e.bureau, ville: e.ville || "", capacite: e.capacite });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await apiUpdateWarehouse(editingId, formData);
        toast.success("Entrepôt modifié");
      } else {
        await apiCreateWarehouse(formData);
        toast.success("Entrepôt créé");
      }
      setIsDialogOpen(false);
      reload();
    } catch (e: any) {
      toast.error("Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet entrepôt ?")) {
      try {
        await apiDeleteWarehouse(id);
        toast.success("Entrepôt supprimé");
        reload();
      } catch (e) {
        toast.error("Erreur suppression");
      }
    }
  };

  const navigate = useNavigate();
  const isInspecteur = user?.role === "inspecteur_chef";
  const isBrigadier = user?.role === "brigadier_entrepot";
  const isDP = user?.role === "directeur_provincial";

  return (
    <div>
      <PageHeader
        title="Entrepôt"
        description="Flux entrants/sortants, transbordement, dénombrement & parking"
        actions={isBrigadier ? <BrigadierEntrepotForms /> : undefined}
      />

      {/* ── Résumé flux ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition-all">
          <ArrowDownRight className="mx-auto h-6 w-6 text-success mb-1" />
          <div className="text-sm font-medium">Entrant chargé</div>
          <div className="text-2xl font-bold mt-1">{entrantCharge.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition-all">
          <ArrowDownRight className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
          <div className="text-sm font-medium">Entrant vide</div>
          <div className="text-2xl font-bold mt-1">{entrantVide.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition-all">
          <ArrowUpRight className="mx-auto h-6 w-6 text-accent mb-1" />
          <div className="text-sm font-medium">Sortant chargé</div>
          <div className="text-2xl font-bold mt-1">{sortantCharge.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-md transition-all">
          <ArrowUpRight className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
          <div className="text-sm font-medium">Sortant vide</div>
          <div className="text-2xl font-bold mt-1">{sortantVide.length}</div>
        </div>
      </div>

      {/* ── Onglets détaillés ── */}
      <Tabs defaultValue="entrant_charge">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50">
          <TabsTrigger value="entrant_charge">Entrant chargé</TabsTrigger>
          <TabsTrigger value="entrant_vide">Entrant vide</TabsTrigger>
          <TabsTrigger value="sortant_charge">Sortant chargé</TabsTrigger>
          <TabsTrigger value="sortant_vide">Sortant vide</TabsTrigger>
          <TabsTrigger value="vrac_sortant">VRAC sortant</TabsTrigger>
          <TabsTrigger value="transbordement">Transbordement</TabsTrigger>
          <TabsTrigger value="denombrement">Dénombrement</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
        </TabsList>

        <TabsContent value="entrant_charge" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Véhicules entrants chargés ({entrantCharge.length})</h3>
            </div>
            <VehicleSearchBar />
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">DRA</th>
                    <th className="px-3 py-2">T1</th>
                    <th className="px-3 py-2">Titres</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entrantCharge.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.custom_fields?.dra || v.dra || "-"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.custom_fields?.t1 || v.t1 || "-"}</td>
                      <td className="px-3 py-2">{v.custom_fields?.titres || v.titres || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : v.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entrant_vide" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Véhicules entrants vides ({entrantVide.length})</h3>
            </div>
            <VehicleSearchBar />
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Chauffeur</th>
                    <th className="px-3 py-2">Activité</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entrantVide.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.chauffeur || "-"}</td>
                      <td className="px-3 py-2">{v.sub_type_operation || v.custom_fields?.activite || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : v.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sortant_charge" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-medium">Véhicules sortants chargés ({sortantCharge.length})</h3>
              {isDP && (
                <div className="flex gap-2">
                   <Button size="sm" variant="outline" className="h-8 gap-2">
                      <Search className="h-3.5 w-3.5" />
                      Rechercher
                   </Button>
                   <Button size="sm" className="h-8 font-bold uppercase">Imprimer</Button>
                </div>
              )}
            </div>
            <VehicleSearchBar />
            {isDP && (
              <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-4 items-center">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Bureau:</span>
                    <select className="h-7 text-xs border rounded bg-background px-2">
                       <option>Tous les bureaux</option>
                       <option>BOMA</option>
                       <option>MATADI</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Période:</span>
                    <input type="date" className="h-7 text-xs border rounded bg-background px-1" />
                    <span className="text-muted-foreground">-</span>
                    <input type="date" className="h-7 text-xs border rounded bg-background px-1" />
                 </div>
              </div>
            )}
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Réf. douane</th>
                    {isDP && <th className="px-3 py-2 text-accent">Date Réf Douane</th>}
                    <th className="px-3 py-2">Bon sortie</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortantCharge.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.custom_fields?.ref_douane || v.refDouane || "-"}</td>
                      {isDP && <td className="px-3 py-2 text-xs font-bold text-accent">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : "-"}</td>}
                      <td className="px-3 py-2 font-mono text-xs">{v.custom_fields?.bon_sortie || v.bonSortie || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : v.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sortant_vide" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Véhicules sortants vides ({sortantVide.length})</h3>
            </div>
            <VehicleSearchBar />
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Opération</th>
                    <th className="px-3 py-2">Empty manifest</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sortantVide.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.sub_type_operation || v.custom_fields?.operation || "-"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.empty_manifest || v.custom_fields?.empty_manifest || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : v.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vrac_sortant" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">VRAC Sortant ({vracSortant.length})</h3>
            </div>
            <VehicleSearchBar />
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Marque</th>
                    <th className="px-3 py-2">Couleur</th>
                    <th className="px-3 py-2">Année</th>
                    <th className="px-3 py-2">Numéro Moteur</th>
                    <th className="px-3 py-2">Liquidateur</th>
                    <th className="px-3 py-2">Date Liq.</th>
                    <th className="px-3 py-2">Matricule Agent BS</th>
                  </tr>
                </thead>
                <tbody>
                  {vracSortant.map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2">{v.importateur || "-"}</td>
                      <td className="px-3 py-2">{v.marque || "-"}</td>
                      <td className="px-3 py-2">{v.couleur || "-"}</td>
                      <td className="px-3 py-2">{v.annee || "-"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.moteur || v.plaque || "-"}</td>
                      <td className="px-3 py-2">{v.liquidateur || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.dateLiquidation || (v.created_at ? new Date(v.created_at).toLocaleDateString() : "-")}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.matriculeAgent || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transbordement" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Transbordements ({transbordements.length})</h3>
            </div>
            <div className="p-3">
              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-success mb-1" />
                  <div className="text-2xl font-bold">
                    {transbordements.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Transbordements</div>
                </div>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 text-center">
                  <Clock className="mx-auto h-6 w-6 text-warning mb-1" />
                  <div className="text-2xl font-bold">
                    {stockageMouvements.length}
                  </div>
                  <div className="text-xs text-muted-foreground">En cours</div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Réf.</th>
                    <th className="px-3 py-2">De</th>
                    <th className="px-3 py-2">Vers</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transbordements.map((t: any) => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{t.dossier_id || t.id || "-"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.espace_id || t.de || "-"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.entrepot_id || t.vers || "-"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${t.type_mouvement === "transbordement" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}
                        >
                          {t.type_mouvement || t.status || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{t.date_mouvement ? new Date(t.date_mouvement).toLocaleDateString() : t.date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="denombrement" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Dénombrement par type</h3>
            </div>
            {isDP && (
              <div className="p-4 border-b bg-muted/10 space-y-4">
                 <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-48 space-y-1.5">
                       <label className="text-[10px] font-bold uppercase text-muted-foreground">Barrière contrôle</label>
                       <select className="w-full h-9 border rounded bg-background px-2 text-sm">
                          <option>Toutes les barrières</option>
                          <option>Barrière Kasindi</option>
                          <option>Barrière Mahagi</option>
                       </select>
                    </div>
                    <div className="w-48 space-y-1.5">
                       <label className="text-[10px] font-bold uppercase text-muted-foreground">Bureau</label>
                       <select className="w-full h-9 border rounded bg-background px-2 text-sm">
                          <option>Tous les bureaux</option>
                          <option>BOMA</option>
                          <option>MATADI</option>
                       </select>
                    </div>
                    <div className="w-48 space-y-1.5">
                       <label className="text-[10px] font-bold uppercase text-muted-foreground">Intervalle date</label>
                       <div className="flex gap-2">
                          <input type="date" className="flex-1 h-9 border rounded bg-background px-2 text-sm" />
                          <input type="date" className="flex-1 h-9 border rounded bg-background px-2 text-sm" />
                       </div>
                    </div>
                    <Button className="h-9 gap-2">
                       <BarChart3 className="h-4 w-4" />
                       Analyser
                    </Button>
                 </div>
              </div>
            )}
            <div className="p-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { type: "Entrant chargé", count: entrantCharge.length },
                { type: "Entrant vide", count: entrantVide.length },
                { type: "Sortant chargé", count: sortantCharge.length },
                { type: "Sortant vide", count: sortantVide.length },
                { type: "VRAC", count: vracs.length },
              ].map(({ type, count }) => (
                <div
                  key={type}
                  className="rounded-xl border border-border p-4 text-center hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <Package className="mx-auto h-5 w-5 text-accent mb-1" />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{type}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parking" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-medium flex items-center gap-2">
                <Truck className="h-5 w-5 text-accent" />
                Situation Parking ({mouvements.length} mouvements)
              </h3>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50 font-bold">
                  <tr>
                    <th className="px-3 py-2">Plaque</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Importateur</th>
                    <th className="px-3 py-2">Depuis</th>
                    <th className="px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {mouvements.slice(0, 10).map((v: any) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono font-medium">{v.plaque}</td>
                      <td className="px-3 py-2">{v.operation_type || "Camion"}</td>
                      <td className="px-3 py-2">{v.importateur || "-"}</td>
                      <td className="px-3 py-2 text-xs">{v.date_mouvement ? new Date(v.date_mouvement).toLocaleDateString() : "-"}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground">enregistré</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Liste complète des Entrepôts */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Liste complète des Entrepôts</h2>
          {(user?.role === "super_admin" || isDP || user?.role === "directeur_general" || user?.role === "inspecteur_chef") && (
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Nouvel Entrepôt</Button>
          )}
        </div>
        <div className="rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Bureau</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entrepots.length === 0 ? (
                 <tr><td colSpan={4} className="text-center py-4">Aucun entrepôt. Tout est à 0.</td></tr>
              ) : entrepots.map(e => (
                 <tr key={e.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">{e.code}</td>
                    <td className="px-4 py-3 font-medium">{e.nom}</td>
                    <td className="px-4 py-3">{e.bureau}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                       <Button size="sm" variant="outline" onClick={() => openEdit(e)}><Edit className="h-4 w-4" /></Button>
                       <Button size="sm" variant="destructive" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'entrepôt" : "Créer un entrepôt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code entrepôt</label>
              <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Ex: ENTR-01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom entrepôt</label>
              <Input value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Entrepôt Douanier" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bureau douanier</label>
              <Input value={formData.bureau} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ville</label>
              <Input value={formData.ville} onChange={e => setFormData({ ...formData, ville: e.target.value })} placeholder="Ex: GOMA" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
