import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { useApi, apiGetBarriereEntries, apiGetEmptyManifests, apiGetLocodes, apiCreateMouvement, apiCreateVrac, apiCreateBarriereEntry } from "@/lib/api";
import type { BarriereEntry } from "@/lib/mock";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/app/barrieres")({
  component: BarrieresPage,
});

function BrigadierForms() {
  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  type Manifest = { id: number | string; reference: string; vehicule: string; marque: string; destination?: string; receveur?: string; barriereEntree?: string; barriereSortie?: string };
  const manifests = (rawManifests as Manifest[] ?? []);
  const [bfVcTitres, setBfVcTitres] = useState(1);
  const [bfVracTitres, setBfVracTitres] = useState(1);

  return (
    <FormDialog
      trigger={
        <Button>
          <Plus className="mr-1.5 h-4 w-4" />
          Nouvelle entrée
        </Button>
      }
      title="Mouvement barrière"
      onSubmit={() => {
        const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
        const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])')?.getAttribute("aria-label") || "vc";
        if (activeTab === "vc") {
          const titresDetails = Array.from({ length: bfVcTitres }, (_, i) => ({
            reference_t1: g(`bf-vc-t1-${i}`),
            date_t1: g(`bf-vc-date-t1-${i}`),
          }));
          apiCreateMouvement({
            operation_type: "entrant_charge",
            plaque: g("bf-vc-plaque"),
            importateur: g("bf-vc-importateur"),
            date_mouvement: new Date().toISOString().split("T")[0],
            reference_dra: g("bf-vc-dra") || undefined,
            date_dra: g("bf-vc-date-dra") || undefined,
            reference_t1: titresDetails[0]?.reference_t1 || undefined,
            date_t1: titresDetails[0]?.date_t1 || undefined,
            custom_fields: {
              nb_titres: bfVcTitres,
              titres_details: titresDetails,
              bureau: g("bf-vc-bureau"),
              declarant: g("bf-vc-declarant"),
              passage_direct: g("bf-vc-dra-passage"),
              entrepot: g("bf-vc-entrepot"),
            },
          }).then(() => toast.success("Véhicule chargé enregistré")).catch((e) => toast.error(e.message));
        } else if (activeTab === "vrac") {
          const titresDetails = Array.from({ length: bfVracTitres }, (_, i) => ({
            reference_t1: g(`bf-vrac-t1-${i}`),
            date_t1: g(`bf-vrac-date-t1-${i}`),
          }));
          apiCreateVrac({
            reference: `VRAC-${Date.now()}`,
            type: "direct",
            importateur: g("bf-vrac-importateur"),
            plaque: g("bf-vrac-chassis"),
            quantite: parseInt(g("bf-vrac-titres") || "1"),
            poids: 0,
          }).then(() => toast.success("VRAC enregistré")).catch((e) => toast.error(e.message));
        }
      }}
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
              <Input id="bf-vc-importateur" />
            </Field>
            <Field label="Plaque véhicule">
              <Input id="bf-vc-plaque" />
            </Field>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Field label="Réf. DRA (E-XXX)" required>
                <Input id="bf-vc-dra" placeholder="E-001" />
              </Field>
              <Field label="Sa date" required>
                <Input id="bf-vc-date-dra" type="date" />
              </Field>
            </div>
            <Field label="Nombre de titres" required>
              <Input id="bf-vc-titres" type="number" min={1} value={bfVcTitres} onChange={(e) => setBfVcTitres(Math.max(1, parseInt(e.target.value) || 1))} />
            </Field>
            <Field label="Du">
              <Input id="bf-vc-date-du" type="date" />
            </Field>
            <Field label="Au">
              <Input id="bf-vc-date-au" type="date" />
            </Field>
            <Field label="Bureau émission Doc">
              <Input id="bf-vc-bureau" />
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
              <Input id="bf-vc-dra-passage" />
            </Field>
            <Field label="Sélection entrepôt">
              <Input id="bf-vc-entrepot" placeholder="Liste créée par l'inspecteur" />
            </Field>
            <Field label="Nom déclarant">
              <Input id="bf-vc-declarant" />
            </Field>
          </FormGrid>
          <div className="space-y-4 mt-4 border-t pt-4">
            {Array.from({ length: bfVcTitres }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                <FormGrid>
                  <Field label="Réf. titre" required>
                    <Input id={`bf-vc-t1-${i}`} placeholder="T1-..." />
                  </Field>
                  <Field label="Sa date" required>
                    <Input id={`bf-vc-date-t1-${i}`} type="date" />
                  </Field>
                </FormGrid>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="vrac" className="space-y-3 pt-3">
          <FormGrid>
            <Field label="Importateur">
              <Input id="bf-vrac-importateur" />
            </Field>
            <Field label="Numéro châssis">
              <Input id="bf-vrac-chassis" />
            </Field>
            <Field label="Nombre de titres" required>
              <Input id="bf-vrac-titres" type="number" min={1} value={bfVracTitres} onChange={(e) => setBfVracTitres(Math.max(1, parseInt(e.target.value) || 1))} />
            </Field>
            <Field label="Couleur véhicule">
              <Input id="bf-vrac-couleur" />
            </Field>
            <Field label="Marque véhicule">
              <Input id="bf-vrac-marque" />
            </Field>
            <Field label="Année">
              <Input id="bf-vrac-annee" />
            </Field>
            <Field label="Entrepôt de destination">
              <Input id="bf-vrac-entrepot" />
            </Field>
          </FormGrid>
          <div className="space-y-4 mt-4 border-t pt-4">
            {Array.from({ length: bfVracTitres }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 bg-muted/10 space-y-3">
                <h4 className="text-sm font-semibold text-accent">Titre {i + 1}</h4>
                <FormGrid>
                  <Field label="Réf. titre" required>
                    <Input id={`bf-vrac-t1-${i}`} placeholder="T1-..." />
                  </Field>
                  <Field label="Sa date" required>
                    <Input id={`bf-vrac-date-t1-${i}`} type="date" />
                  </Field>
                </FormGrid>
              </div>
            ))}
          </div>
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
            data={manifests}
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

  const { data: rawEntries } = useApi(apiGetBarriereEntries);
  const entries = (rawEntries as BarriereEntry[] ?? []);

  const { data: rawLocodes } = useApi(apiGetLocodes);
  type Locode = { code: string; designation: string; denomination: string };
  const locodes = (rawLocodes as Locode[] ?? []);

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
           <div className="p-4 rounded-xl border bg-card shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Bureaux Actifs</p>
              <p className="text-2xl font-bold">12 / 15</p>
           </div>
           <div className="p-4 rounded-xl border bg-card shadow-sm">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Mouvements Global</p>
              <p className="text-2xl font-bold">{entries.length}</p>
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
                 {locodes.slice(0, 10).map((b) => (
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
                                <div className="h-full bg-accent" style={{ width: "60%" }} />
                             </div>
                             <span className="text-[10px] font-bold">60%</span>
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
        data={entries}
        columns={columns}
        onRowClick={(entree) =>
          navigate({ to: "/app/barrieres/$barriereId", params: { barriereId: entree.id } })
        }
      />
    </div>
  );
}
