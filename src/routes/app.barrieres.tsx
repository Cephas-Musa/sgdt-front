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
      trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouvelle entrée</Button>}
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
            <Field label="Nom importateur" required><Input /></Field>
            <Field label="Plaque véhicule"><Input /></Field>
            <Field label="Référence DRA"><Input /></Field>
            <Field label="Nombre de titres"><Input type="number" /></Field>
            <Field label="Du"><Input type="date" /></Field>
            <Field label="Au"><Input type="date" /></Field>
            <Field label="Bureau émission Doc"><Input /></Field>
            <Field label="Entrepôt destination">
              <div className="flex gap-2">
                <label className="flex items-center gap-2 text-sm"><Checkbox /> Passage direct</label>
                <label className="flex items-center gap-2 text-sm"><Checkbox /> Entrepôt</label>
              </div>
            </Field>
            <Field label="Référence DRA passage direct (ex: E-435 du 3/4/2026)"><Input /></Field>
            <Field label="Sélection entrepôt"><Input placeholder="Liste créée par l'inspecteur" /></Field>
            <Field label="Nom déclarant"><Input /></Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="vrac" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur"><Input /></Field>
            <Field label="Numéro châssis"><Input /></Field>
            <Field label="Nombre de titres"><Input type="number" /></Field>
            <Field label="Référence DRA"><Input /></Field>
            <Field label="T1"><Input /></Field>
            <Field label="Couleur véhicule"><Input /></Field>
            <Field label="Marque véhicule"><Input /></Field>
            <Field label="Année"><Input /></Field>
            <Field label="Entrepôt de destination"><Input /></Field>
          </FormGrid>
        </TabsContent>
        <TabsContent value="emp" className="space-y-3 pt-3">
          <div className="flex gap-2">
            <Input placeholder="Numéro de manifest" />
            <Button variant="outline"><Search className="mr-1.5 h-4 w-4" />Rechercher</Button>
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

  const columns: Column<BarriereEntry>[] = [
    { key: "reference", header: t("common.reference") },
    { key: "vehicule", header: t("dossier.vehicule") },
    { key: "type", header: t("common.type") },
    { key: "charge", header: "Charge" },
    { key: "sens", header: "Sens" },
    { key: "date", header: t("common.date") },
  ];

  const action = user?.role === "brigadier_barriere"
    ? <BrigadierForms />
    : <Button><Plus className="mr-1.5 h-4 w-4" />Nouvelle entrée</Button>;

  return (
    <div>
      <PageHeader title={t("nav.barrieres")} description="Mouvements barrière (entrée/sortie)" actions={action} />
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
