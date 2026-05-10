import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { DOSSIERS } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { ListChecks } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/colisage")({
  component: ColisagePage,
});

function ColisagePage() {
  const { t } = useI18n();
  const direct = DOSSIERS.filter((d) => d.type === "direct").slice(0, 12);
  const trans = DOSSIERS.filter((d) => d.type === "transbordement").slice(0, 10);

  const cols = [
    { key: "reference", header: t("common.reference") },
    { key: "importateur", header: t("dossier.importateur") },
    { key: "vehicule", header: t("dossier.vehicule") },
    { key: "actions", header: "", render: () => <Button size="sm"><ListChecks className="mr-1 h-3.5 w-3.5" />Colisage</Button> },
  ];

  return (
    <div>
      <PageHeader title={t("nav.colisage")} description="Pointage et rapports de colisage." />
      <Tabs defaultValue="direct">
        <TabsList>
          <TabsTrigger value="direct">Direct</TabsTrigger>
          <TabsTrigger value="trans">Transbordement</TabsTrigger>
          <TabsTrigger value="hist">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="direct" className="mt-4"><DataTable data={direct} columns={cols} /></TabsContent>
        <TabsContent value="trans" className="mt-4"><DataTable data={trans} columns={cols} /></TabsContent>
        <TabsContent value="hist" className="mt-4">
          <DataTable
            data={DOSSIERS.slice(0, 8)}
            columns={[
              { key: "reference", header: "Rapport" },
              { key: "importateur", header: t("dossier.importateur") },
              { key: "date", header: t("common.date") },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
