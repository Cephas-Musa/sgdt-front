import { useState } from "react";
import { Truck, ArrowDownToLine, ArrowUpFromLine, Package, Search } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";

export default function BrigadierEntrepotDash() {
  const [searchChassis, setSearchChassis] = useState("");

  return (
    <div>
      <DashHeader subtitle="Brigadier Entrepôt — véhicules, vracs, colis (entrant & sortant)" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Entrants" value={12} />
        <StatCard icon={ArrowUpFromLine} label="Sortants" value={9} />
        <StatCard icon={Truck} label="VRAC" value={6} />
        <StatCard icon={Package} label="Colis" value={15} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="vehicules">
          <TabsList><TabsTrigger value="vehicules">Véhicules</TabsTrigger><TabsTrigger value="vracs">Vracs</TabsTrigger><TabsTrigger value="colis">Colis</TabsTrigger></TabsList>

          <TabsContent value="vehicules" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* ENTRANT CHARGÉ */}
              <Panel title="Entrant — Chargé" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Véhicule entrant chargé" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Nom" required><Input /></Field>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Véhicule"><Input /></Field>
                    <Field label="Provenance" required><Input /></Field>
                    <Field label="Référence DRA" required><Input /></Field>
                    <Field label="T1" required><Input /></Field>
                    <Field label="Date d'entrée" required><Input type="date" /></Field>
                    <Field label="Nombre de titres"><Input type="number" /></Field>
                    <Field label="Nom déclarant" required><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Véhicule entrant chargé</div></Panel>

              {/* ENTRANT VIDE */}
              <Panel title="Entrant — Vide" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Véhicule entrant vide" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Nom chauffeur" required><Input /></Field>
                    <Field label="Activité attendue"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Véhicule entrant vide</div></Panel>

              {/* SORTANT VIDE */}
              <Panel title="Sortant — Vide" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Véhicule sortant vide" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Véhicule"><Input /></Field>
                    <Field label="Opération effectuée">
                      <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent><SelectItem value="dechargement">Déchargement</SelectItem><SelectItem value="transbordement">Transbordement</SelectItem></SelectContent>
                      </Select>
                    </Field>
                    <Field label="Réf. déchargement"><Input /></Field>
                    <Field label="Empty manifest"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                    <Field label="Réf. dossier"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Véhicule sortant vide</div></Panel>

              {/* SORTANT CHARGÉ */}
              <Panel title="Sortant — Chargé" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Véhicule sortant chargé" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Importateur" required><Input /></Field>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Véhicule"><Input /></Field>
                    <Field label="Réf. douane" required><Input /></Field>
                    <Field label="Date" required><Input type="date" /></Field>
                    <Field label="Réf. bon de sortie" required><Input /></Field>
                    <Field label="Date bon" required><Input type="date" /></Field>
                    <Field label="Agent émetteur" required><Input /></Field>
                    <Field label="Réf. dossier farde (RD-…)" required><Input placeholder="RD-… + date" /></Field>
                    <Field label="Lieu de déchargement"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Véhicule sortant chargé</div></Panel>
            </div>
          </TabsContent>

          <TabsContent value="vracs" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* VRAC ENTRANT */}
              <Panel title="Vrac — Entrant" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Vrac entrant" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Importateur" required><Input /></Field>
                    <Field label="Numéro châssis" required><Input /></Field>
                    <Field label="Nombre titres"><Input type="number" /></Field>
                    <Field label="Référence DRA" required><Input /></Field>
                    <Field label="T1" required><Input /></Field>
                    <Field label="Marque" required><Input /></Field>
                    <Field label="Couleur"><Input /></Field>
                    <Field label="Année" required><Input type="number" /></Field>
                    <Field label="Nº moteur"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Vrac entrant</div></Panel>

              {/* VRAC SORTANT */}
              <Panel title="Vrac — Sortant" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Vrac sortant" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Numéro châssis" required><Input /></Field>
                    <Field label="Réf. déclaration"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                    <Field label="Bon de sortie"><Input /></Field>
                    <Field label="Date bon"><Input type="date" /></Field>
                    <Field label="Matricule"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Recherche par châssis…" value={searchChassis} onChange={e => setSearchChassis(e.target.value)} className="max-w-xs" />
                    <Button variant="outline"><Search className="mr-1 h-4 w-4" />Rechercher</Button>
                  </div>
                  <div className="py-3 text-center text-sm text-muted-foreground">
                    Recherchez un véhicule par châssis ou ajoutez manuellement.
                  </div>
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="colis" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Colis — Entrant" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Colis entrant" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Nom" required><Input /></Field>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Provenance" required><Input /></Field>
                    <Field label="Référence DRA"><Input /></Field>
                    <Field label="T1"><Input /></Field>
                    <Field label="Date d'entrée"><Input type="date" /></Field>
                    <Field label="Nombre colis"><Input type="number" /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Colis entrant</div></Panel>

              <Panel title="Colis — Sortant" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Colis sortant" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Plaque" required><Input /></Field>
                    <Field label="Réf. dossier"><Input /></Field>
                    <Field label="Bon de sortie"><Input /></Field>
                    <Field label="Date"><Input type="date" /></Field>
                    <Field label="Nombre colis"><Input type="number" /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Colis sortant</div></Panel>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
