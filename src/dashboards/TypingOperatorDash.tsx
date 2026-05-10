import { useState } from "react";
import { FileText, Truck, Plus } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, EMPTY_MANIFESTS } from "@/lib/mock";
import { toast } from "sonner";

interface TransshippedVehicle {
  vehicleReference: string;
  container: string;
  documentReference: string;
  date: string;
}

interface TranshippedDocument {
  id: string;
  transhippedTo: string;
  vehicles: TransshippedVehicle[];
}

export default function TypingOperatorDash() {
  const [manifestSearch, setManifestSearch] = useState("");
  const [numberOfVehicles, setNumberOfVehicles] = useState<number>(0);
  const [transhippedTo, setTranshippedTo] = useState("");
  const [vehicles, setVehicles] = useState<TransshippedVehicle[]>([]);
  const [transhippedDocs, setTranshippedDocs] = useState<TranshippedDocument[]>([]);

  const filteredManifests = EMPTY_MANIFESTS.filter(m => !manifestSearch || m.reference.toLowerCase().includes(manifestSearch.toLowerCase()));

  // Handle number of vehicles change
  const handleVehiclesChange = (num: number) => {
    setNumberOfVehicles(num);
    // Create array with new vehicles if needed, or remove extras
    const newVehicles = Array(num).fill(null).map((_, i) =>
      vehicles[i] || { vehicleReference: "", container: "", documentReference: "", date: "" }
    );
    setVehicles(newVehicles);
  };

  // Update vehicle data
  const updateVehicle = (index: number, field: keyof TransshippedVehicle, value: string) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setVehicles(updated);
  };

  const handleCreateTranshipped = () => {
    if (numberOfVehicles <= 0 || !transhippedTo.trim()) {
      toast.error("Veuillez renseigner le nombre de véhicules et la destination.");
      return;
    }

    setTranshippedDocs(prev => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        transhippedTo,
        vehicles,
      },
    ]);
    setNumberOfVehicles(0);
    setTranshippedTo("");
    setVehicles([]);
    toast.success(`Document transhipped créé (${vehicles.length} véhicule(s)).`);
  };

  return (
    <div>
      <DashHeader subtitle="Typing Operator — Docs, Empty Manifest, IT" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={FileText} label="Docs" value={DOSSIERS.length} />
        <StatCard icon={FileText} label="Empty Manifests" value={EMPTY_MANIFESTS.length} />
        <StatCard icon={Truck} label="IT" value={0} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="docs">
          <TabsList><TabsTrigger value="docs">Docs</TabsTrigger><TabsTrigger value="manifest">Empty Manifest</TabsTrigger><TabsTrigger value="it">IT</TabsTrigger></TabsList>

          <TabsContent value="docs" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* DIRECT */}
              <Panel title="Load — Direct" actions={
                <FormDialog trigger={<Button size="sm">New Direct</Button>} title="Direct Document" onSubmit={() => toast.success("Saved")}>
                  <FormGrid>
                    <Field label="Office" required><Input /></Field>
                    <Field label="Entry Reference" required><Input /></Field>
                    <Field label="Date" required><Input type="date" /></Field>
                    <Field label="T1" required><Input /></Field>
                    <Field label="Date T1" required><Input type="date" /></Field>
                    <Field label="Consignee" required><Input /></Field>
                    <Field label="Country of Export" required><Input /></Field>
                    <Field label="Vehicle Reference" required><Input /></Field>
                    <Field label="Container Nº"><Input /></Field>
                    <Field label="Container type">
                      <div className="flex gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> 1x20</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> 1x40</label></div>
                    </Field>
                  </FormGrid>
                </FormDialog>
              }>
                <div className="py-4 text-center text-sm text-muted-foreground">Créez un nouveau document direct avec le formulaire ci-dessus.</div>
              </Panel>

              {/* TRANSHIPPED */}
              <Panel
                title="Load — Transhipped"
                actions={
                  <FormDialog
                    trigger={<Button size="sm" variant="outline">New Transhipped</Button>}
                    title="Transhipped Document"
                    onSubmit={() => handleCreateTranshipped()}
                  >
                    <FormGrid>
                      <Field label="Nº of vehicles transhipped" required>
                        <Input
                          type="number"
                          min="0"
                          value={numberOfVehicles}
                          onChange={(e) => handleVehiclesChange(parseInt(e.target.value) || 0)}
                        />
                      </Field>
                      <Field label="Transhipped to" required>
                        <Input
                          value={transhippedTo}
                          onChange={(e) => setTranshippedTo(e.target.value)}
                        />
                      </Field>
                    </FormGrid>

                    {numberOfVehicles > 0 ? (
                      <div className="space-y-4 mt-4">
                        {vehicles.map((vehicle, index) => (
                          <div key={index} className="grid grid-cols-1 xl:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                            <Field label={`Vehicle ${index + 1} Reference`} required>
                              <Input
                                value={vehicle.vehicleReference}
                                onChange={(e) => updateVehicle(index, "vehicleReference", e.target.value)}
                                placeholder="Vehicle ref"
                              />
                            </Field>
                            <Field label={`Container ${index + 1}`} required>
                              <Input
                                value={vehicle.container}
                                onChange={(e) => updateVehicle(index, "container", e.target.value)}
                                placeholder="Container Nº"
                              />
                            </Field>
                            <Field label={`Document Ref ${index + 1}`} required>
                              <Input
                                value={vehicle.documentReference}
                                onChange={(e) => updateVehicle(index, "documentReference", e.target.value)}
                                placeholder="Document ref"
                              />
                            </Field>
                            <Field label={`Date ${index + 1}`} required>
                              <Input
                                type="date"
                                value={vehicle.date}
                                onChange={(e) => updateVehicle(index, "date", e.target.value)}
                              />
                            </Field>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        Saisissez le nombre de véhicules pour afficher les formulaires de transbordement ci-dessous.
                      </div>
                    )}
                  </FormDialog>
                }
              >
                {transhippedDocs.length > 0 ? (
                  <div className="space-y-3">
                    {transhippedDocs.map((doc) => (
                      <div key={doc.id} className="rounded-lg border border-border p-4 bg-card">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                          <div>
                            <div className="text-xs uppercase text-muted-foreground">Destination</div>
                            <div className="font-semibold">{doc.transhippedTo}</div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-muted-foreground">Véhicules</div>
                            <div className="font-semibold">{doc.vehicles.length}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          {doc.vehicles.map((vehicle, index) => (
                            <div key={index} className="rounded-lg border border-border p-3 bg-muted/50">
                              <div className="text-xs text-muted-foreground">Véhicule {index + 1}</div>
                              <div className="text-sm font-semibold">{vehicle.vehicleReference || "-"}</div>
                              <div className="text-xs text-muted-foreground">Conteneur</div>
                              <div className="text-sm">{vehicle.container || "-"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Espace réservé pour la liste des transhipped. Cliquez sur <span className="font-semibold">New Transhipped</span> pour ouvrir le formulaire.
                  </div>
                )}
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4 space-y-4">
            <div className="flex gap-3"><Input placeholder="Manifest reference…" value={manifestSearch} onChange={e => setManifestSearch(e.target.value)} className="max-w-xs" /><Button variant="outline" onClick={() => setManifestSearch("")}>Filter</Button></div>
            <Panel title={`Results (${filteredManifests.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Plate Number</th><th className="px-3 py-2">Vehicle Mark</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Manifest Ref</th><th className="px-3 py-2">Date</th><th className="px-3 py-2"></th></tr></thead>
                  <tbody>{filteredManifests.map(m => (<tr key={m.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2">{m.vehicule}</td><td className="px-3 py-2">{m.marque}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{m.status}</span></td><td className="px-3 py-2 font-mono text-xs">{m.reference}</td><td className="px-3 py-2">{m.date}</td><td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => toast.success("OK")}>OK</Button></td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="it" className="mt-4">
            <Panel title="IT — Information Technology">
              <FormDialog trigger={<Button>New IT Entry</Button>} title="IT Entry" onSubmit={() => toast.success("IT saved")}>
                <FormGrid>
                  <Field label="Consignee" required><Input /></Field>
                  <Field label="Chassis" required><Input /></Field>
                  <Field label="Vehicle Mark" required><Input /></Field>
                  <Field label="Manifest Year" required><Input type="number" placeholder="2025" /></Field>
                  <Field label="Color" required><Input /></Field>
                  <Field label="IT Ref" required><Input /></Field>
                </FormGrid>
              </FormDialog>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
