import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { BARRIERE_ENTRIES, EMPTY_MANIFESTS, type BarriereEntry } from "@/lib/mock";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/app/barrieres")({
  component: BarrieresPage,
});

function BrigadierForms() {
  return (
    <FormDialog
      trigger={
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Nouvelle entrée
        </Button>
      }
      title="Mouvement barrière"
      onSubmit={() => toast.success("Mouvement enregistré")}
    >
      <Tabs defaultValue="vc">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="vc">Véhicule chargé</TabsTrigger>
          <TabsTrigger value="vrac">Vrac (automobile)</TabsTrigger>
          <TabsTrigger value="emp">Empty manifest</TabsTrigger>
        </TabsList>
        <TabsContent value="vc" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Nom importateur" required>
              <Input />
            </Field>
            <Field label="Plaque véhicule">
              <Input />
            </Field>
            <Field label="Référence DRA">
              <Input />
            </Field>
            <Field label="Nombre de titres">
              <Input type="number" />
            </Field>
            <Field label="Du">
              <Input type="date" />
            </Field>
            <Field label="Au">
              <Input type="date" />
            </Field>
            <Field label="Bureau émission Doc">
              <Input />
            </Field>
            <Field label="Entrepôt destination">
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox /> Passage direct
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox /> Entrepôt
                </label>
              </div>
            </Field>
            <Field label="Référence DRA passage direct (ex: E-435 du 3/4/2026)">
              <Input />
            </Field>
            <Field label="Sélection entrepôt">
              <Input placeholder="Liste créée par l'inspecteur" />
            </Field>
            <Field label="Nom déclarant">
              <Input />
            </Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="vrac" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input />
            </Field>
            <Field label="Numéro châssis">
              <Input />
            </Field>
            <Field label="Nombre de titres">
              <Input type="number" />
            </Field>
            <Field label="Référence DRA">
              <Input />
            </Field>
            <Field label="T1">
              <Input />
            </Field>
            <Field label="Couleur véhicule">
              <Input />
            </Field>
            <Field label="Marque véhicule">
              <Input />
            </Field>
            <Field label="Année">
              <Input />
            </Field>
            <Field label="Entrepôt de destination">
              <Input />
            </Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="emp" className="space-y-3 pt-3">
          <div className="flex gap-2">
            <Input placeholder="Numéro de manifest" />
            <Button variant="outline">
              <Search className="mr-1.5 h-4 w-4" />
              Rechercher
            </Button>
          </div>
          <DataTable
            data={EMPTY_MANIFESTS}
            columns={[
              { key: "reference", header: "Manifest" },
              { key: "vehicule", header: "Immat." },
              { key: "marque", header: "Marque" },
              { key: "destination", header: "Destination" },
              { key: "receveur", header: "Receveur" },
              { key: "barriereEntree", header: "Barrière entrant" },
              { key: "barriereSortie", header: "Barrière sortie" },
            ]}
            pageSize={5}
            searchable={false}
          />
        </TabsContent>
      </Tabs>
    </FormDialog>
  );
}

function BarrieresPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDP = user?.role === "directeur_provincial";

  const columns: Column<BarriereEntry>[] = [
    { key: "reference", header: t("common.reference") },
    { key: "vehicule", header: t("dossier.vehicule") },
    { key: "type", header: t("common.type") },
    { key: "charge", header: "Charge" },
    { key: "sens", header: "Sens" },
    { key: "date", header: t("common.date") },
  ];

  if (isDP) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Supervision des Bureaux" 
          description="État d'activité et performance des bureaux de la province" 
        />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {/* Summary Stats for Bureaux */}
           <div className="p-4 rounded-xl border bg-card shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Bureaux Actifs</p>
              <p className="text-2xl font-bold">12 / 15</p>
           </div>
           <div className="p-4 rounded-xl border bg-card shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Mouvements Global</p>
              <p className="text-2xl font-bold">458</p>
           </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
           <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-[10px] font-bold uppercase text-muted-foreground">
                 <tr>
                    <th className="px-4 py-4">Code</th>
                    <th className="px-4 py-4">Désignation</th>
                    <th className="px-4 py-4">Localisation</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-4 py-4">Activité</th>
                    <th className="px-4 py-4 text-right">Superviser</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {LOCODES.slice(0, 10).map((b) => (
                    <tr key={b.code} className="hover:bg-muted/30 transition-colors">
                       <td className="px-4 py-4 font-mono font-bold text-accent">{b.code}</td>
                       <td className="px-4 py-4 font-medium">{b.designation}</td>
                       <td className="px-4 py-4 text-xs text-muted-foreground">{b.denomination}</td>
                       <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-success/15 text-success">
                             <span className="h-1.5 w-1.5 rounded-full bg-success" />
                             Opérationnel
                          </span>
                       </td>
                       <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-accent" style={{ width: `${Math.random() * 100}%` }} />
                             </div>
                             <span className="text-[10px] font-bold">{Math.floor(Math.random() * 50)}%</span>
                          </div>
                       </td>
                       <td className="px-4 py-4 text-right">
                          <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase">Détails</Button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  const action =
    user?.role === "brigadier_barriere" ? (
      <BrigadierForms />
    ) : (
      <Button>
        <Plus className="mr-1.5 h-4 w-4" />
        Nouvelle entrée
      </Button>
    );

  return (
    <div>
      <PageHeader
        title={t("nav.barrieres")}
        description="Mouvements barrière (entrée/sortie)"
        actions={action}
      />
      <DataTable
        data={BARRIERE_ENTRIES}
        columns={columns}
        onRowClick={(entree) =>
          navigate({ to: "/app/barrieres/$barriereId", params: { barriereId: entree.id } })
        }
      />
    </div>
  );
}

