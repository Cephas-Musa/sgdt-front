import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { DOSSIERS } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";

export const Route = createFileRoute("/app/verification")({
  component: VerificationPage,
});

function VerificationPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader
        title={t("nav.verification")}
        description="Recherche dossiers, vérification, apurement."
      />
      <DataTable
        data={DOSSIERS}
        columns={[
          { key: "reference", header: t("common.reference") },
          { key: "importateur", header: t("dossier.importateur") },
          { key: "type", header: t("common.type"), render: (r) => t(`type.${r.type}`) },
          { key: "dra", header: t("dossier.dra") },
          { key: "t1", header: t("dossier.t1") },
          { key: "status", header: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
          { key: "actions", header: "", render: () => (
            <Button size="sm" variant="outline"><FileCheck className="mr-1 h-3.5 w-3.5" />Apurement</Button>
          ) },
        ]}
      />
    </div>
  );
}
