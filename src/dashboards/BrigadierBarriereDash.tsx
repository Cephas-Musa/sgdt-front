import { useState } from "react";
import { Truck, ArrowDownToLine, ArrowUpFromLine, Search, FileText } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { ENTREPOTS, EMPTY_MANIFESTS } from "@/lib/mock";
import { toast } from "sonner";

export default function BrigadierBarriereDash() {
  const [manifestSearch, setManifestSearch] = useState("");
  const filteredManifests = EMPTY_MANIFESTS.filter(m => !manifestSearch || m.reference.toLowerCase().includes(manifestSearch.toLowerCase()));

  return (
    <div>
      <DashHeader subtitle="Brigadier Barrière — véhicules entrée/sortie, vrac, empty manifest" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ArrowDownToLine} label="Entrées" value={18} />
        <StatCard icon={ArrowUpFromLine} label="Sorties" value={14} />
        <StatCard icon={Truck} label="VRAC" value={6} />
        <StatCard icon={FileText} label="Manifests" value={EMPTY_MANIFESTS.length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="vehicule">
          <TabsList><TabsTrigger value="vehicule">Véhicule</TabsTrigger><TabsTrigger value="vrac">VRAC</TabsTrigger><TabsTrigger value="manifest">Empty Manifest</TabsTrigger></TabsList>

          <TabsContent value="vehicule" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* ENTRÉE CHARGÉ */}
              <Panel title="Entrée — Véhicule chargé" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Entrée véhicule chargé" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Nom importateur" required><Input /></Field>
                    <Field label="Plaque véhicule" required><Input /></Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Référence DRA (E-XXX)" required><Input placeholder="E-001" /></Field>
                      <Field label="Sa date" required><Input type="date" /></Field>
                    </div>
                    <Field label="Nombre de titres" required><Input type="number" /></Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Du"><Input type="date" /></Field>
                      <Field label="Au"><Input type="date" /></Field>
                    </div>
                    <Field label="Bureau émission doc"><Input /></Field>
                    <Field label="Destination">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="dest" value="direct" /> Passage direct</label>
                        <div className="ml-6 space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Réf. douane (E-XXX)"><Input placeholder="E-001" /></Field>
                            <Field label="Date"><Input type="date" /></Field>
                          </div>
                          <Field label="Réf. DRA"><Input /></Field>
                        </div>
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="dest" value="entrepot" /> Entrepôt</label>
                        <div className="ml-6">
                          <Select><SelectTrigger><SelectValue placeholder="Sélectionner entrepôt" /></SelectTrigger>
                            <SelectContent>{ENTREPOTS?.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Field>
                    <Field label="Nom déclarant" required><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Formulaire véhicule chargé entrant</div></Panel>

              {/* ENTRÉE VIDE */}
              <Panel title="Entrée — Véhicule vide" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Entrée véhicule vide" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Plaque véhicule" required><Input /></Field>
                    <Field label="Nom chauffeur" required><Input /></Field>
                    <Field label="Activité attendue"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Formulaire véhicule vide entrant</div></Panel>

              {/* SORTIE CHARGÉ */}
              <Panel title="Sortie — Véhicule chargé" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Sortie véhicule chargé" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Importateur" required><Input /></Field>
                    <Field label="Plaque véhicule" required><Input /></Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Réf. douane (E-XXX)" required><Input placeholder="E-001" /></Field>
                      <Field label="Sa date" required><Input type="date" /></Field>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Réf. bon de sortie" required><Input /></Field>
                      <Field label="Sa date" required><Input type="date" /></Field>
                    </div>
                    <Field label="Agent émetteur" required><Input /></Field>
                    <Field label="Réf. dossier (RD-…)" required><Input placeholder="RD-…" /></Field>
                    <Field label="Lieu de déchargement"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Formulaire véhicule chargé sortant</div></Panel>

              {/* SORTIE VIDE */}
              <Panel title="Sortie — Véhicule vide" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Sortie véhicule vide" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Plaque véhicule" required><Input /></Field>
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
              }><div className="py-3 text-center text-sm text-muted-foreground">Formulaire véhicule vide sortant</div></Panel>
            </div>
          </TabsContent>

          <TabsContent value="vrac" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="VRAC — Véhicule entrant" actions={
                <FormDialog trigger={<Button size="sm">Nouveau</Button>} title="Entrée véhicule automobile (VRAC)" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Importateur" required><Input /></Field>
                    <Field label="Numéro châssis" required><Input /></Field>
                    <Field label="Nombre de titres" required><Input type="number" /></Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Référence DRA (E-XXX)" required><Input placeholder="E-001" /></Field>
                      <Field label="Sa date" required><Input type="date" /></Field>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="T1" required><Input placeholder="T1-…" /></Field>
                      <Field label="Sa date" required><Input type="date" /></Field>
                    </div>
                    <Field label="Couleur véhicule"><Input /></Field>
                    <Field label="Entrepôt destination">
                      <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>{ENTREPOTS?.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Marque véhicule"><Input /></Field>
                    <Field label="Année" required><Input type="number" placeholder="2025" /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Entrée véhicule automobile</div></Panel>

              <Panel title="VRAC — Véhicule sortant" actions={
                <FormDialog trigger={<Button size="sm" variant="outline">Nouveau</Button>} title="Sortie VRAC" onSubmit={() => toast.success("Enregistré")}>
                  <FormGrid>
                    <Field label="Numéro châssis" required><Input /></Field>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Réf. déclaration (E-XXX)"><Input placeholder="E-001" /></Field>
                      <Field label="Sa date"><Input type="date" /></Field>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Field label="Bon de sortie"><Input /></Field>
                      <Field label="Sa date"><Input type="date" /></Field>
                    </div>
                    <Field label="Matricule émetteur"><Input /></Field>
                  </FormGrid>
                </FormDialog>
              }><div className="py-3 text-center text-sm text-muted-foreground">Sortie VRAC</div></Panel>
            </div>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4 space-y-4">
            <div className="flex gap-3"><Input placeholder="Numéro manifest…" value={manifestSearch} onChange={e => setManifestSearch(e.target.value)} className="max-w-xs" /><Button variant="outline"><Search className="mr-1 h-4 w-4" />Rechercher</Button></div>
            <Panel title={`Résultats (${filteredManifests.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Nº</th><th className="px-3 py-2">Immatriculation</th><th className="px-3 py-2">Marque</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Destination</th><th className="px-3 py-2">Receveur</th><th className="px-3 py-2">Barrière entrée</th><th className="px-3 py-2">Barrière sortie</th></tr></thead>
                  <tbody>{filteredManifests.map(m => (<tr key={m.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2">{m.reference}</td><td className="px-3 py-2">{m.vehicule}</td><td className="px-3 py-2">{m.marque}</td><td className="px-3 py-2">{m.typeVehicule}</td><td className="px-3 py-2">{m.destination}</td><td className="px-3 py-2">{m.receveur}</td><td className="px-3 py-2">{m.barriereEntree}</td><td className="px-3 py-2">{m.barriereSortie}</td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
