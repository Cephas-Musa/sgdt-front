import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { BUREAUX_REPR } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/configuration")({
  component: ConfigPage,
});

function ConfigPage() {
  return (
    <div>
      <PageHeader
        title="Configuration"
        description="Bureaux de sortie et bureaux d'entrée pays"
        actions={
          <FormDialog
            trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Ajouter un bureau</Button>}
            title="Nouveau bureau"
            onSubmit={() => toast.success("Bureau ajouté")}
          >
            <Tabs defaultValue="sortie">
              <TabsList><TabsTrigger value="sortie">Bureau sortie</TabsTrigger><TabsTrigger value="entree">Bureau entrée pays</TabsTrigger></TabsList>
              <TabsContent value="sortie" className="space-y-3 pt-3">
                <FormGrid>
                  <Field label="Code (ex: UGMPO / UGCYKA)"><Input /></Field>
                  <Field label="Dénomination (ex: MPONDWE / CHANIKA)"><Input /></Field>
                </FormGrid>
              </TabsContent>
              <TabsContent value="entree" className="space-y-3 pt-3">
                <FormGrid>
                  <Field label="Code (ex: 617B / 603B)"><Input /></Field>
                  <Field label="Dénomination (ex: KASINDI / GOMA VILLE)"><Input /></Field>
                </FormGrid>
              </TabsContent>
            </Tabs>
          </FormDialog>
        }
      />
      <DataTable
        data={BUREAUX_REPR}
        columns={[
          { key: "type", header: "Type" },
          { key: "code", header: "Code" },
          { key: "denomination", header: "Dénomination" },
        ]}
      />
    </div>
  );
}
