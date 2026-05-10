import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { LOCODES, PAYS, DEVISES } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/representation")({
  component: ReprPage,
});

function ReprPage() {
  return (
    <div>
      <PageHeader title="Bureau Représentation" description="Locode · Pays · Devises" />
      <Tabs defaultValue="locode">
        <TabsList>
          <TabsTrigger value="locode">Locode</TabsTrigger>
          <TabsTrigger value="pays">Pays</TabsTrigger>
          <TabsTrigger value="devise">Devises</TabsTrigger>
        </TabsList>

        <TabsContent value="locode" className="space-y-3 pt-3">
          <div className="flex justify-end">
            <FormDialog
              trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>}
              title="Nouveau locode"
              onSubmit={() => toast.success("Locode ajouté")}
            >
              <FormGrid>
                <Field label="Code"><Input placeholder="UGKLA" /></Field>
                <Field label="Désignation"><Input placeholder="Kampala" /></Field>
                <Field label="Code pays"><Input placeholder="UG" /></Field>
                <Field label="Dénomination"><Input placeholder="OUGANDA" /></Field>
              </FormGrid>
            </FormDialog>
          </div>
          <DataTable data={LOCODES} columns={[
            { key: "code", header: "Code" },
            { key: "designation", header: "Désignation" },
            { key: "codePays", header: "Code pays" },
            { key: "denomination", header: "Pays" },
          ]} />
        </TabsContent>

        <TabsContent value="pays" className="space-y-3 pt-3">
          <div className="flex justify-end">
            <FormDialog
              trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>}
              title="Nouveau pays"
              onSubmit={() => toast.success("Pays ajouté")}
            >
              <FormGrid>
                <Field label="Code pays"><Input /></Field>
                <Field label="Désignation pays"><Input /></Field>
              </FormGrid>
            </FormDialog>
          </div>
          <DataTable data={PAYS} columns={[
            { key: "code", header: "Code" },
            { key: "designation", header: "Désignation" },
          ]} />
        </TabsContent>

        <TabsContent value="devise" className="space-y-3 pt-3">
          <div className="flex justify-end">
            <FormDialog
              trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>}
              title="Nouvelle devise"
              onSubmit={() => toast.success("Devise ajoutée")}
            >
              <FormGrid>
                <Field label="Code pays"><Input /></Field>
                <Field label="Code devise"><Input placeholder="USD" /></Field>
                <Field label="Dénomination devise"><Input placeholder="Dollar Américain" /></Field>
              </FormGrid>
            </FormDialog>
          </div>
          <DataTable data={DEVISES} columns={[
            { key: "codePays", header: "Code pays" },
            { key: "codeDevise", header: "Devise" },
            { key: "denomination", header: "Dénomination" },
          ]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
