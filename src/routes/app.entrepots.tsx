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
  ArrowDownRight, ArrowUpRight, Container, Package,
  Truck, Plus, RotateCcw, CheckCircle2, Clock,
} from "lucide-react";

export const Route = createFileRoute("/app/entrepots")({
  component: EntrepotsPage,
});

/* Données entrepôt simulées */
const entrantCharge = [
  { id: 1, plaque: "AA 1001 XY", importateur: "Société Atlas SARL", dra: "DRA-2001", t1: "T1-3001", date: "2025-10-28", titres: 3 },
  { id: 2, plaque: "BC 1005 ZA", importateur: "Global Cargo Ltd", dra: "DRA-2005", t1: "T1-3005", date: "2025-10-28", titres: 2 },
  { id: 3, plaque: "CC 1011 BB", importateur: "Kivu Import", dra: "DRA-2011", t1: "T1-3011", date: "2025-10-29", titres: 1 },
];
const entrantVide = [
  { id: 1, plaque: "AB 1019 XY", chauffeur: "Jean Mulumba", activite: "Chargement prévu", date: "2025-10-29" },
  { id: 2, plaque: "CC 1035 BB", chauffeur: "Pierre Kabongo", activite: "Transbordement", date: "2025-10-29" },
];
const sortantCharge = [
  { id: 1, plaque: "AA 1024 ZA", importateur: "PetroPlus SA", refDouane: "E-101", bonSortie: "BS-001", date: "2025-10-28" },
  { id: 2, plaque: "BC 1030 XY", importateur: "Sahel Logistics", refDouane: "E-102", bonSortie: "BS-002", date: "2025-10-29" },
];
const sortantVide = [
  { id: 1, plaque: "AB 1040 ZA", operation: "Déchargement terminé", emptyManifest: "EMP/2025/0701", date: "2025-10-28" },
  { id: 2, plaque: "CC 1050 BB", operation: "Transbordement terminé", emptyManifest: "EMP/2025/0702", date: "2025-10-29" },
];
const transbordements = [
  { id: 1, ref: "DSR/2025/1003", de: "AA 1001 XY", vers: "BC 1030 ZA", status: "terminé", date: "2025-10-27" },
  { id: 2, ref: "DSR/2025/1010", de: "CC 1011 BB", vers: "AB 1040 XY", status: "en_cours", date: "2025-10-29" },
  { id: 3, ref: "DSR/2025/1015", de: "BC 1005 ZA", vers: "CC 1050 BB", status: "en_cours", date: "2025-10-29" },
];
const denombrements = { direct: 12, lot: 8, transbordement: 5, vrac: 15, colis: 4 };
const parking = [
  { id: 1, plaque: "AA 1024 ZA", type: "Camion", importateur: "PetroPlus SA", depuis: "2 jours", status: "stationné" },
  { id: 2, plaque: "BC 1030 XY", type: "Semi-remorque", importateur: "Sahel Logistics", depuis: "1 jour", status: "stationné" },
  { id: 3, plaque: "AB 1019 XY", type: "Pick-up", importateur: "Atlas SARL", depuis: "4h", status: "en attente" },
  { id: 4, plaque: "CC 1035 BB", type: "Camion", importateur: "Global Cargo", depuis: "6h", status: "chargement" },
  { id: 5, plaque: "AA 1050 ZA", type: "Bus", importateur: "Kivu Import", depuis: "3 jours", status: "stationné" },
  { id: 6, plaque: "BC 1060 XY", type: "Semi-remorque", importateur: "Imex Trading", depuis: "12h", status: "en attente" },
];

function BrigadierEntrepotForms() {
  return (
    <FormDialog
      trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Mouvement entrepôt</Button>}
      title="Mouvement entrepôt"
      onSubmit={() => toast.success("Mouvement enregistré")}
    >
      <Tabs defaultValue="ec">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="ec">Entrant chargé</TabsTrigger>
          <TabsTrigger value="ev">Entrant vide</TabsTrigger>
          <TabsTrigger value="sc">Sortant chargé</TabsTrigger>
          <TabsTrigger value="sv">Sortant vide</TabsTrigger>
        </TabsList>
        <TabsContent value="ec" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Nom"><Input /></Field>
            <Field label="Plaque véhicule"><Input /></Field>
            <Field label="Provenance"><Input /></Field>
            <Field label="Réf. DRA"><Input /></Field>
            <Field label="T1"><Input /></Field>
            <Field label="Date d'entrée"><Input type="date" /></Field>
            <Field label="Nombre de titres"><Input type="number" /></Field>
            <Field label="Nom déclarant"><Input /></Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="ev" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque"><Input /></Field>
            <Field label="Nom chauffeur"><Input /></Field>
            <Field label="Activité attendue"><Input /></Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="sc" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur"><Input /></Field>
            <Field label="Plaque"><Input /></Field>
            <Field label="Réf. douane"><Input /></Field>
            <Field label="Bon de sortie"><Input /></Field>
            <Field label="Date"><Input type="date" /></Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="sv" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Plaque"><Input /></Field>
            <Field label="Opération effectuée"><Input /></Field>
            <Field label="Empty manifest"><Input /></Field>
            <Field label="Date"><Input type="date" /></Field>
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
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="entrant_charge">Entrant chargé</TabsTrigger>
          <TabsTrigger value="entrant_vide">Entrant vide</TabsTrigger>
          <TabsTrigger value="sortant_charge">Sortant chargé</TabsTrigger>
          <TabsTrigger value="sortant_vide">Sortant vide</TabsTrigger>
          <TabsTrigger value="transbordement">Transbordement</TabsTrigger>
          <TabsTrigger value="denombrement">Dénombrement</TabsTrigger>
          <TabsTrigger value="parking">Parking</TabsTrigger>
        </TabsList>

        <TabsContent value="entrant_charge" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Véhicules entrants chargés ({entrantCharge.length})</h3></div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Plaque</th><th className="px-3 py-2">Importateur</th><th className="px-3 py-2">DRA</th><th className="px-3 py-2">T1</th><th className="px-3 py-2">Titres</th><th className="px-3 py-2">Date</th></tr>
                </thead>
                <tbody>
                  {entrantCharge.map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{v.plaque}</td><td className="px-3 py-2">{v.importateur}</td><td className="px-3 py-2 font-mono text-xs">{v.dra}</td><td className="px-3 py-2 font-mono text-xs">{v.t1}</td><td className="px-3 py-2">{v.titres}</td><td className="px-3 py-2 text-xs">{v.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entrant_vide" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Véhicules entrants vides ({entrantVide.length})</h3></div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Plaque</th><th className="px-3 py-2">Chauffeur</th><th className="px-3 py-2">Activité</th><th className="px-3 py-2">Date</th></tr>
                </thead>
                <tbody>
                  {entrantVide.map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{v.plaque}</td><td className="px-3 py-2">{v.chauffeur}</td><td className="px-3 py-2">{v.activite}</td><td className="px-3 py-2 text-xs">{v.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sortant_charge" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Véhicules sortants chargés ({sortantCharge.length})</h3></div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Plaque</th><th className="px-3 py-2">Importateur</th><th className="px-3 py-2">Réf. douane</th><th className="px-3 py-2">Bon sortie</th><th className="px-3 py-2">Date</th></tr>
                </thead>
                <tbody>
                  {sortantCharge.map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{v.plaque}</td><td className="px-3 py-2">{v.importateur}</td><td className="px-3 py-2 font-mono text-xs">{v.refDouane}</td><td className="px-3 py-2 font-mono text-xs">{v.bonSortie}</td><td className="px-3 py-2 text-xs">{v.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sortant_vide" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Véhicules sortants vides ({sortantVide.length})</h3></div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Plaque</th><th className="px-3 py-2">Opération</th><th className="px-3 py-2">Empty manifest</th><th className="px-3 py-2">Date</th></tr>
                </thead>
                <tbody>
                  {sortantVide.map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{v.plaque}</td><td className="px-3 py-2">{v.operation}</td><td className="px-3 py-2 font-mono text-xs">{v.emptyManifest}</td><td className="px-3 py-2 text-xs">{v.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transbordement" className="mt-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border p-4"><h3 className="font-medium">Transbordements ({transbordements.length})</h3></div>
            <div className="p-3">
              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-success mb-1" />
                  <div className="text-2xl font-bold">{transbordements.filter(t => t.status === "terminé").length}</div>
                  <div className="text-xs text-muted-foreground">Terminés</div>
                </div>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 text-center">
                  <Clock className="mx-auto h-6 w-6 text-warning mb-1" />
                  <div className="text-2xl font-bold">{transbordements.filter(t => t.status === "en_cours").length}</div>
                  <div className="text-xs text-muted-foreground">En cours</div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Réf.</th><th className="px-3 py-2">De</th><th className="px-3 py-2">Vers</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Date</th></tr>
                </thead>
                <tbody>
                  {transbordements.map(t => (
                    <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs">{t.ref}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.de}</td>
                      <td className="px-3 py-2 font-mono text-xs">{t.vers}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${t.status === "terminé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{t.status}</span>
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
            <div className="border-b border-border p-4"><h3 className="font-medium">Dénombrement par type</h3></div>
            <div className="p-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(denombrements).map(([type, count]) => (
                <div key={type} className="rounded-xl border border-border p-4 text-center hover:bg-muted/30 transition-all cursor-pointer">
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
              <h3 className="font-medium flex items-center gap-2"><Truck className="h-5 w-5 text-accent" />Situation Parking ({parking.length} véhicules)</h3>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr><th className="px-3 py-2">Plaque</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Importateur</th><th className="px-3 py-2">Depuis</th><th className="px-3 py-2">Statut</th></tr>
                </thead>
                <tbody>
                  {parking.map(v => (
                    <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono font-medium">{v.plaque}</td>
                      <td className="px-3 py-2">{v.type}</td>
                      <td className="px-3 py-2">{v.importateur}</td>
                      <td className="px-3 py-2 text-xs">{v.depuis}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${v.status === "stationné" ? "bg-muted text-muted-foreground" : v.status === "chargement" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{v.status}</span>
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
      {(isInspecteur || user?.role === "chef_entrepot_log" || user?.role === "chef_entrepot_douane") && (
        <div className="mt-6">
          <DataTable
            data={ENTREPOTS}
            columns={[
              { key: "code", header: "Code" },
              { key: "nom", header: "Nom" },
              { key: "bureau", header: "Bureau" },
              { key: "capacite", header: "Capacité" },
            ]}
            onRowClick={(entrepot) => navigate({ to: "/app/entrepots/$entrepotId", params: { entrepotId: entrepot.id } })}
          />
        </div>
      )}
    </div>
  );
}
