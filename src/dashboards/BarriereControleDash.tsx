import { useState } from "react";
import { 
  FolderKanban, FileText, Search, Plus, 
  ArrowRight, Truck, Calendar, Hash, CheckCircle2
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, EMPTY_MANIFESTS } from "@/lib/mock";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

export default function BarriereControleDash() {
  const [dossierSearch, setDossierSearch] = useState("");
  const [manifestSearch, setManifestSearch] = useState("");

  const filteredDossiers = (DOSSIERS || []).filter(d => 
    !dossierSearch || 
    d.reference?.toLowerCase().includes(`rd-${dossierSearch}`.toLowerCase()) ||
    d.importateur?.toLowerCase().includes(dossierSearch.toLowerCase())
  );

  const filteredManifests = (EMPTY_MANIFESTS || []).filter(m => 
    !manifestSearch || 
    m.reference?.toLowerCase().includes(manifestSearch.toLowerCase())
  );

  const dossierColumns: Column<any>[] = [
    { key: "reference", header: "Référence", render: (r) => <span className="font-mono font-medium text-accent">{r.reference}</span> },
    { key: "importateur", header: "Importateur" },
    { key: "plaque", header: "Plaque" },
    { key: "typeMarchandises", header: "Marchandises" },
    { key: "destination", header: "Destination" },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
  ];

  const manifestColumns: Column<any>[] = [
    { key: "reference", header: "Nº Manifeste", render: (r) => <span className="font-mono font-medium">{r.reference}</span> },
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
        <Button size="sm" variant="outline" className="h-8 gap-1 border-accent/30 text-accent hover:bg-accent/10" onClick={() => toast.success(`Manifeste ${r.reference} passé avec succès`)}>
          Passer
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Barrière Contrôle — Gestion des dossiers et manifests" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS?.length || 0} />
        <StatCard icon={FileText} label="Manifests" value={EMPTY_MANIFESTS?.length || 0} />
        <StatCard icon={CheckCircle2} label="Traités aujourd'hui" value={12} />
        <StatCard icon={Plus} label="Nouveaux" value={4} />
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
                value={dossierSearch}
                onChange={(e) => setDossierSearch(e.target.value)}
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
              onSubmit={() => toast.success("Dossier créé avec succès")}
            >
              <FormGrid>
                <Field label="Importateur" required><Input placeholder="Nom de l'importateur" /></Field>
                <Field label="Plaque" required><Input placeholder="ABC-1234" /></Field>
                <Field label="Description marchandises" required><Input placeholder="Nature des biens" /></Field>
                <Field label="Destination finale" required><Input placeholder="Ville / Entrepôt" /></Field>
                
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence dossier" required>
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs font-mono">RD-</span>
                      <Input className="rounded-l-none" placeholder="0001" />
                    </div>
                  </Field>
                  <Field label="Date réf dossier" required><Input type="date" /></Field>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence douane (E-XXX)" required>
                    <div className="flex">
                      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs font-mono">E-</span>
                      <Input className="rounded-l-none" placeholder="123" />
                    </div>
                  </Field>
                  <Field label="Sa date" required><Input type="date" /></Field>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <Field label="Référence bon de sortie" required><Input placeholder="BS-456" /></Field>
                  <Field label="Sa date" required><Input type="date" /></Field>
                </div>
              </FormGrid>
            </FormDialog>
          </div>

          <Panel title={`Liste des dossiers (${filteredDossiers.length})`}>
            <DataTable 
              columns={dossierColumns} 
              data={filteredDossiers} 
              searchable={false}
            />
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
            <DataTable 
              columns={manifestColumns} 
              data={filteredManifests} 
              searchable={false}
            />
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
