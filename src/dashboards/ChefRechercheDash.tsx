import { FileCheck, Search, FolderKanban } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers } from "@/lib/api";
import { DOSSIERS_TRAITES } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function ChefRechercheDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];

  const traites = DOSSIERS_TRAITES;
  const apures = activeDossiers.filter((d) => d.status === "apure");

  return (
    <div>
      <DashHeader subtitle="Chef Bureau Recherche — appurement et dossiers traités" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={FolderKanban} label="Dossiers" value={activeDossiers.length} />
        <StatCard icon={FileCheck} label="Dossiers traités" value={traites.length} />
        <StatCard icon={Search} label="Apurés" value={apures.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Appurement"
          actions={
            <FormDialog
              trigger={
                <Button size="sm">
                  <Search className="mr-1.5 h-4 w-4" />
                  Apurer un dossier
                </Button>
              }
              title="Appurement dossier"
              onSubmit={() => toast.success("Dossier apuré")}
            >
              <FormGrid>
                <Field label="Référence dossier" required>
                  <Input placeholder="DSR/…" />
                </Field>
                <Field label="Année">
                  <Input placeholder="2025" />
                </Field>
                <Field label="Référence douane (E-…)" required>
                  <Input />
                </Field>
                <Field label="Date appurement">
                  <Input type="date" />
                </Field>
              </FormGrid>
            </FormDialog>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Référence</th>
                  <th className="px-3 py-2">Importateur</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {apures.slice(0, 10).map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <Link
                        to="/app/dossiers/$dossierId"
                        params={{ dossierId: d.id }}
                        className="text-accent hover:underline font-mono text-xs"
                      >
                        {d.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{d.importateur}</td>
                    <td className="px-3 py-2 capitalize">{d.type}</td>
                    <td className="px-3 py-2">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Dossiers traités">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Référence</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {traites.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      <Link
                        to="/app/dossiers/$dossierId"
                        params={{ dossierId: d.dossierId }}
                        className="text-accent hover:underline font-mono text-xs"
                      >
                        {d.reference}
                      </Link>
                    </td>
                    <td className="px-3 py-2 capitalize">{d.type}</td>
                    <td className="px-3 py-2">{d.dateTraitement}</td>
                    <td className="px-3 py-2">{d.agent}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${d.resultat === "conforme" ? "bg-success/15 text-success" : d.resultat === "non_conforme" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                      >
                        {d.resultat.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
