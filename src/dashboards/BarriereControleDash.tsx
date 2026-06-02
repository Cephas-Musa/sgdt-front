import { useState } from "react";
import {
  FolderKanban,
  FileText,
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers, apiGetEmptyManifests, apiGetMouvements, apiCreateDossier, apiCreateBarriereEntry } from "@/lib/api";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export default function BarriereControleDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  const { data: rawMouvements } = useApi(() => apiGetMouvements({}));
  const activeDossiers = (rawDossiers as any[]) || [];
  const manifests = (rawManifests as any[]) || [];
  const mouvements = (rawMouvements as any[]) || [];

  const [dossierSearch, setDossierSearch] = useState("");
  const [manifestSearch, setManifestSearch] = useState("");

  const filteredDossiers = (activeDossiers || []).filter(
    (d: any) =>
      !dossierSearch ||
      (d.reference || "").toLowerCase().includes(`rd-${dossierSearch}`.toLowerCase()) ||
      (d.importateur || "").toLowerCase().includes(dossierSearch.toLowerCase()),
  );

  const filteredManifests = (manifests || []).filter(
    (m: any) => !manifestSearch || (m.reference || "").toLowerCase().includes(manifestSearch.toLowerCase()),
  );

  const dossierColumns: Column<any>[] = [
    {
      key: "reference",
      header: "Référence",
      render: (r) => <span className="font-mono font-medium text-accent">{r.reference}</span>,
    },
    { key: "importateur", header: "Importateur" },
    { key: "plaque", header: "Plaque" },
    { key: "typeMarchandises", header: "Marchandises" },
    { key: "destination", header: "Destination" },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const manifestColumns: Column<any>[] = [
    {
      key: "reference",
      header: "Nº Manifeste",
      render: (r) => <span className="font-mono font-medium">{r.reference}</span>,
    },
    { key: "vehicule", header: "Immatriculation" },
    { key: "marque", header: "Marque" },
    { key: "typeVehicule", header: "Type" },
    { key: "destination", header: "Destination" },
    { key: "receveur", header: "Receveur" },
    { key: "barriereEntree", header: "Barrière entrée" },
    { key: "barriereSortie", header: "Barrière sortie" },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 border-accent/30 text-accent hover:bg-accent/10"
          onClick={async () => {
            try {
              await apiCreateBarriereEntry({ empty_manifest_id: r.id });
              toast.success(`Manifeste ${r.reference} passé avec succès`);
            } catch (e: any) {
              toast.error(e?.message || "Erreur");
            }
          }}
        >
          Passer
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Barrière Contrôle — Gestion des dossiers et manifests" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={activeDossiers.length} />
        <StatCard icon={FileText} label="Manifests" value={manifests.length} />
        <StatCard icon={CheckCircle2} label="Mouvements" value={mouvements.length} />
        <StatCard icon={Plus} label="Nouveaux" value={activeDossiers.filter((d: any) => d.status === "en_cours").length} />
      </div>

      <Tabs defaultValue="dossiers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
          <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
        </TabsList>

        <TabsContent value="dossiers" className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40 max-w-sm flex-1 overflow-hidden transition-all duration-200">
              <span className="flex h-9 items-center border-r border-input bg-muted px-3 text-xs font-bold text-foreground select-none">
                RD-
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={dossierSearch}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setDossierSearch(val);
                }}
                placeholder="0001"
                className="h-9 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/40"
              />
              <div className="flex h-9 w-9 items-center justify-center border-l border-input bg-muted/30">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <FormDialog
              trigger={
                <Button className="gap-2 bg-accent hover:bg-accent/90">
                  <Plus className="h-4 w-4" />
                  Nouveau Dossier
                </Button>
              }
              title="Créer un nouveau dossier"
              onSubmit={() => {
                const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
                apiCreateDossier({
                  importateur: g("bc-importateur"),
                  plaque: g("bc-plaque"),
                  type_marchandises: g("bc-marchandises"),
                  localisation: g("bc-destination"),
                  metadata: {
                    reference: g("bc-reference"),
                    date_reference: g("bc-date-ref"),
                    reference_douane: g("bc-ref-douane"),
                    date_reference_douane: g("bc-date-ref-douane"),
                    bon_sortie: g("bc-bon-sortie"),
                    date_bon_sortie: g("bc-date-bon-sortie"),
                  },
                }).then(() => toast.success("Dossier créé avec succès")).catch((e) => toast.error(e.message));
              }}
            >
              <FormGrid>
                <Field label="Importateur" required>
                  <Input id="bc-importateur" placeholder="Nom de l'importateur" />
                </Field>
                <Field label="Plaque" required>
                  <Input id="bc-plaque" placeholder="ABC-1234" />
                </Field>
                <Field label="Description marchandises" required>
                  <Input id="bc-marchandises" placeholder="Nature des biens" />
                </Field>
                <Field label="Destination finale" required>
                  <Input id="bc-destination" placeholder="Ville / Entrepôt" />
                </Field>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence dossier" required>
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs font-mono">
                        RD-
                      </span>
                      <Input id="bc-reference" className="rounded-l-none" placeholder="0001" />
                    </div>
                  </Field>
                  <Field label="Date réf dossier" required>
                    <Input id="bc-date-ref" type="date" />
                  </Field>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence douane (E-XXX)" required>
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs font-mono">
                        E-
                      </span>
                      <Input id="bc-ref-douane" className="rounded-l-none" placeholder="123" />
                    </div>
                  </Field>
                  <Field label="Sa date" required>
                    <Input id="bc-date-ref-douane" type="date" />
                  </Field>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence bon de sortie" required>
                    <Input id="bc-bon-sortie" placeholder="BS-456" />
                  </Field>
                  <Field label="Sa date" required>
                    <Input id="bc-date-bon-sortie" type="date" />
                  </Field>
                </div>
              </FormGrid>
            </FormDialog>
          </div>

          <Panel title={`Liste des dossiers (${filteredDossiers.length})`}>
            <DataTable columns={dossierColumns} data={filteredDossiers} searchable={false} />
          </Panel>
        </TabsContent>

        <TabsContent value="manifest" className="mt-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par référence manifest…"
                className="pl-9"
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
              />
            </div>
          </div>

          <Panel title={`Manifestes vides (${filteredManifests.length})`}>
            <DataTable columns={manifestColumns} data={filteredManifests} searchable={false} />
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
