import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DataTable } from "@/components/DataTable";
import { ENTREPOTS, DOSSIERS } from "@/lib/mock";
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

/* Données entrepôt simulées */
const vracSortant = [
  {
    id: 1,
    importateur: "Congo Motors",
    marque: "Toyota",
    couleur: "Blanc",
    annee: "2018",
    moteur: "1KD-564738",
    liquidateur: "Agence Centrale",
    dateLiquidation: "2025-10-25",
    matriculeAgent: "AG-1025",
  }
];

const entrantCharge = [
  {
    id: 1,
    plaque: "AA 1001 XY",
    importateur: "Société Atlas SARL",
    dra: "DRA-2001",
    t1: "T1-3001",
    date: "2025-10-28",
    titres: 3,
  },
  {
    id: 2,
    plaque: "BC 1005 ZA",
    importateur: "Global Cargo Ltd",
    dra: "DRA-2005",
    t1: "T1-3005",
    date: "2025-10-28",
    titres: 2,
  },
  {
    id: 3,
    plaque: "CC 1011 BB",
    importateur: "Kivu Import",
    dra: "DRA-2011",
    t1: "T1-3011",
    date: "2025-10-29",
    titres: 1,
  },
];
const entrantVide = [
  {
    id: 1,
    plaque: "AB 1019 XY",
    chauffeur: "Jean Mulumba",
    activite: "Chargement prévu",
    date: "2025-10-29",
  },
  {
    id: 2,
    plaque: "CC 1035 BB",
    chauffeur: "Pierre Kabongo",
    activite: "Transbordement",
    date: "2025-10-29",
  },
];
const sortantCharge = [
  {
    id: 1,
    plaque: "AA 1024 ZA",
    importateur: "PetroPlus SA",
    refDouane: "E-101",
    bonSortie: "BS-001",
    date: "2025-10-28",
  },
  {
    id: 2,
    plaque: "BC 1030 XY",
    importateur: "Sahel Logistics",
    refDouane: "E-102",
    bonSortie: "BS-002",
    date: "2025-10-29",
  },
];
const sortantVide = [
  {
    id: 1,
    plaque: "AB 1040 ZA",
    operation: "Déchargement terminé",
    emptyManifest: "EMP/2025/0701",
    date: "2025-10-28",
  },
  {
    id: 2,
    plaque: "CC 1050 BB",
    operation: "Transbordement terminé",
    emptyManifest: "EMP/2025/0702",
    date: "2025-10-29",
  },
];
const transbordements = [
  {
    id: 1,
    ref: "DSR/2025/1003",
    de: "AA 1001 XY",
    vers: "BC 1030 ZA",
    status: "terminé",
    date: "2025-10-27",
  },
  {
    id: 2,
    ref: "DSR/2025/1010",
    de: "CC 1011 BB",
    vers: "AB 1040 XY",
    status: "en_cours",
    date: "2025-10-29",
  },
  {
    id: 3,
    ref: "DSR/2025/1015",
    de: "BC 1005 ZA",
    vers: "CC 1050 BB",
    status: "en_cours",
    date: "2025-10-29",
  },
];
const denombrements = { direct: 12, lot: 8, transbordement: 5, colis: 4 };
const parking = [
  {
    id: 1,
    plaque: "AA 1024 ZA",
    type: "Camion",
    importateur: "PetroPlus SA",
    depuis: "2 jours",
    status: "stationné",
  },
  {
    id: 2,
    plaque: "BC 1030 XY",
    type: "Semi-remorque",
    importateur: "Sahel Logistics",
    depuis: "1 jour",
    status: "stationné",
  },
  {
    id: 3,
    plaque: "AB 1019 XY",
    type: "Pick-up",
    importateur: "Atlas SARL",
    depuis: "4h",
    status: "en attente",
  },
  {
    id: 4,
    plaque: "CC 1035 BB",
    type: "Camion",
    importateur: "Global Cargo",
    depuis: "6h",
    status: "chargement",
  },
  {
    id: 5,
    plaque: "AA 1050 ZA",
    type: "Bus",
    importateur: "Kivu Import",
    depuis: "3 jours",
    status: "stationné",
  },
  {
    id: 6,
    plaque: "BC 1060 XY",
    type: "Semi-remorque",
    importateur: "Imex Trading",
    depuis: "12h",
    status: "en attente",
  },
];

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
      onSubmit={() => toast.success("Mouvement enregistré")}
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
              <Input />
            </Field>
            <Field label="Plaque véhicule">
              <Input />
            </Field>
            <Field label="Provenance">
              <Input />
            </Field>
            <Field label="Date d'entrée">
              <Input type="date" />
            </Field>
            <Field label="Nombre de titres">
              <Input 
                type="number" 
                min={1} 
                value={nombreTitres} 
                onChange={(e) => setNombreTitres(Math.max(1, parseInt(e.target.value) || 1))} 
              />
            </Field>
            <Field label="Nom déclarant">
              <Input />
            </Field>
          </FormGrid>
          
          <div className="space-y-4 mt-4 border-t pt-4">
            {Array.from({ length: nombreTitres }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                <FormGrid>
                  <Field label="Réf. DRA">
                    <Input />
                  </Field>
                  <Field label="Date DRA">
                    <Input type="date" />
                  </Field>
                  <Field label="Réf. T1">
                    <Input />
                  </Field>
                  <Field label="Date Titre">
                    <Input type="date" />
                  </Field>
                </FormGrid>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ev" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque">
              <Input />
            </Field>
            <Field label="Date d'entrée">
              <Input type="date" />
            </Field>
            <Field label="Nom chauffeur">
              <Input />
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
                <Input placeholder="Saisir le type d'opération" />
              </Field>
            )}
          </FormGrid>
        </TabsContent>
        <TabsContent value="sc" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input />
            </Field>
            <Field label="Plaque">
              <Input />
            </Field>
            <Field label="Réf. douane">
              <Input />
            </Field>
            <Field label="Date Réf. douane">
              <Input type="date" />
            </Field>
            <Field label="Bon de sortie">
              <Input />
            </Field>
            <Field label="Date Bon de sortie">
              <Input type="date" />
            </Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="sv" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque">
              <Input />
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
              <Input />
            </Field>
            <Field label="Date Empty manifest">
              <Input type="date" />
            </Field>
          </FormGrid>

          {operationSortantVide === "Déchargement" && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/10 space-y-3">
              <h4 className="text-sm font-semibold text-accent">Détails Déchargement</h4>
              <FormGrid>
                <Field label="Bâtiment">
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Sélectionner bâtiment</option>
                    {ENTREPOTS.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                  </select>
                </Field>
                <Field label="Zone / espace spécifique">
                  <Input />
                </Field>
              </FormGrid>
            </div>
          )}

          {operationSortantVide === "Transbordement" && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/10 space-y-3">
              <h4 className="text-sm font-semibold text-accent">Détails Transbordement</h4>
              <FormGrid>
                <Field label="Plaque avant du véhicule">
                  <Input />
                </Field>
                <Field label="Plaque arrière du véhicule">
                  <Input />
                </Field>
              </FormGrid>
            </div>
          )}
        </TabsContent>
        <TabsContent value="vrac" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input />
            </Field>
            <Field label="Marque véhicule">
              <Input />
            </Field>
            <Field label="Couleur">
              <Input />
            </Field>
            <Field label="Année">
              <Input type="number" />
            </Field>
            <Field label="Numéro moteur">
              <Input />
            </Field>
            <Field label="Liquidateur">
              <Input />
            </Field>
            <Field label="Date liquidation">
              <Input type="date" />
            </Field>
            <Field label="Matricule Agent BS">
              <Input />
            </Field>
          </FormGrid>
        </TabsContent>
      </Tabs>
    </FormDialog>
  );
}

function EntrepotsPage() {
  const { user } = useAuth();
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
                  {entrantCharge.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.dra}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.t1}</td>
                      <td className="px-3 py-2">{v.titres}</td>
                      <td className="px-3 py-2 text-xs">{v.date}</td>
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
                  {entrantVide.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.chauffeur}</td>
                      <td className="px-3 py-2">{v.activite}</td>
                      <td className="px-3 py-2 text-xs">{v.date}</td>
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
                  {sortantCharge.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.refDouane}</td>
                      {isDP && <td className="px-3 py-2 text-xs font-bold text-accent">15/05/2024</td>}
                      <td className="px-3 py-2 font-mono text-xs">{v.bonSortie}</td>
                      <td className="px-3 py-2 text-xs">{v.date}</td>
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
                  {sortantVide.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono">{v.plaque}</td>
                      <td className="px-3 py-2">{v.operation}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.emptyManifest}</td>
                      <td className="px-3 py-2 text-xs">{v.date}</td>
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
                  {vracSortant.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2">{v.marque}</td>
                      <td className="px-3 py-2">{v.couleur}</td>
                      <td className="px-3 py-2">{v.annee}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.moteur}</td>
                      <td className="px-3 py-2">{v.liquidateur}</td>
                      <td className="px-3 py-2 text-xs">{v.dateLiquidation}</td>
                      <td className="px-3 py-2 font-mono text-xs">{v.matriculeAgent}</td>
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
                    {transbordements.filter((t) => t.status === "terminé").length}
                  </div>
                  <div className="text-xs text-muted-foreground">Terminés</div>
                </div>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 text-center">
                  <Clock className="mx-auto h-6 w-6 text-warning mb-1" />
                  <div className="text-2xl font-bold">
                    {transbordements.filter((t) => t.status === "en_cours").length}
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
                  {transbordements.map((t) => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{t.ref}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.de}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.vers}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${t.status === "terminé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{t.date}</td>
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
              {Object.entries(denombrements).map(([type, count]) => (
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
                Situation Parking ({parking.length} véhicules)
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
                  {parking.map((v) => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono font-medium">{v.plaque}</td>
                      <td className="px-3 py-2">{v.type}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 text-xs">{v.depuis}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${v.status === "stationné" ? "bg-muted text-muted-foreground" : v.status === "chargement" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Liste entrepôts (pour les chefs) */}
      {(isInspecteur ||
        isDP ||
        user?.role === "chef_entrepot_log") && (
        <div className="mt-6">
          <DataTable
            data={ENTREPOTS}
            columns={[
              { key: "code", header: "Code" },
              { key: "nom", header: "Nom" },
              { key: "bureau", header: "Bureau" },
              { key: "capacite", header: "Capacité" },
            ]}
            onRowClick={(entrepot) =>
              navigate({ to: "/app/entrepots/$entrepotId", params: { entrepotId: entrepot.id } })
            }
          />
        </div>
      )}
    </div>
  );
}
