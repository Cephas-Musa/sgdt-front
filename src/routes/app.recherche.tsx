import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { DOSSIERS } from "@/lib/mock";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/app/recherche")({
  component: RecherchePage,
});

function RecherchePage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("nav.recherche")} description="Dashboard, apurement, dossiers traités." />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase text-muted-foreground">Dossiers traités</div>
          <div className="mt-2 text-2xl font-semibold">128</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase text-muted-foreground">En cours</div>
          <div className="mt-2 text-2xl font-semibold">14</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs uppercase text-muted-foreground">Apurés ce mois</div>
          <div className="mt-2 text-2xl font-semibold">62</div>
        </div>
      </div>
      <DataTable
        data={DOSSIERS.filter((d) => d.status === "verifie" || d.status === "apure")}
        columns={[
          { key: "reference", header: t("common.reference") },
          { key: "importateur", header: t("dossier.importateur") },
          { key: "dra", header: t("dossier.dra") },
          { key: "status", header: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
          { key: "date", header: t("common.date") },
        ]}
      />
    </div>
  );
}
