import { useState, useRef } from "react";
import { FileText, Truck, Plus, Search, Calendar, Edit, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers, apiGetEmptyManifests, apiCreateTypingDocDirect, apiCreateTypingDocTranshipment, apiCreateItEntry, apiGetItEntries } from "@/lib/api";
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
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = (rawDossiers as any[]) || [];

  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  const allManifests = (rawManifests as any[]) || [];

  const { data: rawItEntries, reload: reloadIt } = useApi(apiGetItEntries);
  const allItEntries = (rawItEntries as any[]) || [];

  const [manifestSearch, setManifestSearch] = useState("");
  const [numberOfVehicles, setNumberOfVehicles] = useState<number>(0);
  const [transhippedTo, setTranshippedTo] = useState("");
  const [vehicles, setVehicles] = useState<TransshippedVehicle[]>([]);
  const [transhippedDocs, setTranshippedDocs] = useState<TranshippedDocument[]>([]);

  // Form state for Load Direct
  const directFormRef = useRef<{ [key: string]: string }>({});
  
  const [itSearch, setItSearch] = useState("");
  const [itChassisSearch, setItChassisSearch] = useState("");
  
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const filteredManifests = allManifests.filter(
    (m) => !manifestSearch || (m.reference || m.vehicule || "").toLowerCase().includes(manifestSearch.toLowerCase()),
  );

  const filteredIT = allItEntries.filter(
    (it) => 
      (!itSearch || (it.it_reference || it.reference || "").toLowerCase().includes(itSearch.toLowerCase())) &&
      (!itChassisSearch || (it.chassis || "").toLowerCase().includes(itChassisSearch.toLowerCase()))
  );

  const isEditable = (createdAt: string) => {
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    // Use a bit of buffer for demo purposes if needed, but here 5 mins
    return now - createdDate < 5 * 60 * 1000;
  };

  const formatTimeLeft = (createdAt: string) => {
    const createdDate = new Date(createdAt).getTime();
    const now = Date.now();
    const diff = 5 * 60 * 1000 - (now - createdDate);
    if (diff <= 0) return "Expiré";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Handle number of vehicles change
  const handleVehiclesChange = (num: number) => {
    setNumberOfVehicles(num);
    const newVehicles = Array(num)
      .fill(null)
      .map(
        (_, i) =>
          vehicles[i] || { vehicleReference: "", container: "", documentReference: "", date: "" },
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

    setTranshippedDocs((prev) => [
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
        <StatCard icon={FileText} label="Docs Directs" value={activeDossiers.length} />
        <StatCard icon={FileText} label="Empty Manifests" value={allManifests.length} />
        <StatCard icon={Truck} label="IT Entries" value={allItEntries.length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="docs">
          <TabsList>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
            <TabsTrigger value="it">IT</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="mt-4 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* LOAD DIRECT */}
              <Panel
                title="Load Direct"
                className="border-primary/20 shadow-lg shadow-primary/5"
                actions={
                  <FormDialog
                    trigger={
                      <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Load Direct
                      </Button>
                    }
                    title="Créer un Nouveau Document Direct"
                    onSubmit={async (formData?: Record<string, string>) => {
                      try {
                        await apiCreateTypingDocDirect({
                          barriere_code: directFormRef.current.barriere_code || "UGMPO",
                          office: directFormRef.current.office,
                          entree_reference: directFormRef.current.entree_reference,
                          date_entree: directFormRef.current.date_entree,
                          t1_reference: directFormRef.current.t1_reference,
                          t1_date: directFormRef.current.t1_date,
                          consignee: directFormRef.current.consignee,
                          country_of_export: directFormRef.current.country_of_export,
                          vehicule_reference: directFormRef.current.vehicule_reference,
                          container_number: directFormRef.current.container_number,
                          dossier_reference: directFormRef.current.dossier_reference,
                        });
                        toast.success("Document Direct créé et enregistré.");
                        directFormRef.current = {};
                      } catch (e: any) {
                        toast.error(e?.message || "Erreur lors de la création.");
                      }
                    }}
                  >
                    <FormGrid>
                      <Field label="Référence Dossier (optionnel)">
                        <div className="flex items-center overflow-hidden rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
                          <span className="flex items-center px-3 border-r border-input bg-muted/50 font-bold text-muted-foreground select-none">RD-</span>
                          <input 
                            className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50 h-9"
                            placeholder="0001" 
                            inputMode="numeric"
                            onChange={(e) => { 
                              const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                              e.target.value = val;
                              directFormRef.current.dossier_reference = val ? "RD-" + val : ""; 
                            }}
                          />
                        </div>
                      </Field>
                      <Field label="Code Barrière" required>
                        <Input 
                          placeholder="Ex: UGMPO" 
                          onChange={(e) => { directFormRef.current.barriere_code = e.target.value; }}
                        />
                      </Field>
                      <Field label="Bureau de destination" required>
                        <Input 
                          placeholder="Ex: KASINDI" 
                          onChange={(e) => { directFormRef.current.office = e.target.value; }}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Référence d'entrée" required>
                          <Input 
                            placeholder="Ex: RD-001" 
                            onChange={(e) => { directFormRef.current.entree_reference = e.target.value; }}
                          />
                        </Field>
                        <Field label="Date" required>
                          <Input 
                            type="date" 
                            onChange={(e) => { directFormRef.current.date_entree = e.target.value; }}
                          />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="T1" required>
                          <Input 
                            placeholder="Ex: T1-001" 
                            onChange={(e) => { directFormRef.current.t1_reference = e.target.value; }}
                          />
                        </Field>
                        <Field label="Date T1" required>
                          <Input 
                            type="date" 
                            onChange={(e) => { directFormRef.current.t1_date = e.target.value; }}
                          />
                        </Field>
                      </div>
                      <Field label="Importateur (Consignee)" required>
                        <Input 
                          placeholder="Nom de l'importateur" 
                          onChange={(e) => { directFormRef.current.consignee = e.target.value; }}
                        />
                      </Field>
                      <Field label="Pays d'exportation" required>
                        <Input 
                          placeholder="Ex: OUGANDA" 
                          onChange={(e) => { directFormRef.current.country_of_export = e.target.value; }}
                        />
                      </Field>
                      <Field label="Référence Véhicule" required>
                        <Input 
                          placeholder="Nº de plaque" 
                          onChange={(e) => { directFormRef.current.vehicule_reference = e.target.value; }}
                        />
                      </Field>
                      <Field label="Type de conteneur" required>
                        <Select defaultValue="conventional">
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ref">Entry reference</SelectItem>
                            <SelectItem value="ref_date">sa date</SelectItem>
                            <SelectItem value="t1">T1</SelectItem>
                            <SelectItem value="t1_date">sa date</SelectItem>
                            <SelectItem value="conventional">Conventional</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Nº de Conteneur">
                        <Input 
                          placeholder="Si applicable" 
                          onChange={(e) => { directFormRef.current.container_number = e.target.value; }}
                        />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                }
              >
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">Nouveau Document</h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
                    Utilisez ce formulaire pour créer directement un nouveau document dans le système.
                  </p>
                </div>
              </Panel>

              {/* DOCS - DIRECT */}
              <Panel
                title="Docs — Direct"
                actions={
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      Actualiser
                    </Button>
                  </div>
                }
              >
                  <div className="space-y-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Données de l'importateur
                    </div>
                    <div className="overflow-x-auto rounded-md border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left">Réf</th>
                            <th className="px-3 py-2 text-left">Importateur</th>
                            <th className="px-3 py-2 text-left">Status</th>
                            <th className="px-3 py-2 text-left">Créé le</th>
                            <th className="px-3 py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDossiers.slice(0, 5).map((d: any) => (
                            <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                              <td className="px-3 py-2 font-mono">{d.reference}</td>
                              <td className="px-3 py-2 font-medium">{d.importateur || "—"}</td>
                              <td className="px-3 py-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  d.status === "paye" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                }`}>
                                  {d.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">
                                {new Date(d.created_at || d.createdAt || Date.now()).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="text-[10px] text-muted-foreground">Verrouillé</span>
                              </td>
                            </tr>
                          ))}
                          {activeDossiers.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">Aucun dossier trouvé</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </Panel>
            </div>

            {/* TRANSHIPPED */}
            <Panel
              title="Transshipped"
              icon={Truck}
              actions={
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="h-7 w-32 border-none bg-transparent text-[10px]" 
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                    />
                    <span className="text-muted-foreground">à</span>
                    <Input 
                      type="date" 
                      className="h-7 w-32 border-none bg-transparent text-[10px]"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                    />
                  </div>
                  <FormDialog
                    trigger={
                      <Button size="sm" variant="outline" className="gap-2 border-primary/30 text-primary">
                        <Plus className="h-4 w-4" /> Transshipped
                      </Button>
                    }
                    title="Transshipped Dossier"
                    onSubmit={async () => {
                      if (numberOfVehicles <= 0 || !transhippedTo.trim()) {
                        toast.error("Veuillez renseigner le nombre de véhicules et la destination.");
                        return;
                      }
                      try {
                        await apiCreateTypingDocTranshipment({
                          nombre_vehicules: numberOfVehicles,
                          transhipped_to: transhippedTo,
                          vehicule_reference: vehicles.map(v => v.vehicleReference).join(", "),
                          container_number: vehicles.map(v => v.container).join(", "),
                          document_reference: vehicles.map(v => v.documentReference).join(", "),
                          date_doc: vehicles[0]?.date || new Date().toISOString().split("T")[0],
                        });
                        setTranshippedDocs((prev) => [...prev, {
                          id: `${Date.now()}-${prev.length}`,
                          transhippedTo,
                          vehicles,
                        }]);
                        setNumberOfVehicles(0);
                        setTranshippedTo("");
                        setVehicles([]);
                        toast.success(`Document transhipped créé (${vehicles.length} véhicule(s)).`);
                      } catch (e: any) {
                        toast.error(e?.message || "Erreur lors de la création.");
                      }
                    }}
                  >
                    <div className="mb-6 p-4 border-2 border-dashed border-warning/30 bg-warning/5 rounded-lg text-center">
                      <AlertTriangle className="mx-auto h-8 w-8 text-warning mb-2" />
                      <h4 className="font-bold text-warning uppercase">Espace Réservé</h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        This space is reserved for transhipped dossier. Use new transhipped form.
                      </p>
                    </div>
                    
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

                    {numberOfVehicles > 0 && (
                      <div className="space-y-4 mt-6 pt-6 border-t border-border">
                        {vehicles.map((vehicle, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 xl:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                          >
                            <Field label={`Vehicle ${index + 1} Reference`} required>
                              <Input
                                value={vehicle.vehicleReference}
                                onChange={(e) =>
                                  updateVehicle(index, "vehicleReference", e.target.value)
                                }
                                placeholder="Plaque"
                              />
                            </Field>
                            <Field label={`Container ${index + 1}`} required>
                              <Input
                                value={vehicle.container}
                                onChange={(e) => updateVehicle(index, "container", e.target.value)}
                                placeholder="Nº Conteneur"
                              />
                            </Field>
                            <Field label={`Document Ref ${index + 1}`} required>
                              <Input
                                value={vehicle.documentReference}
                                onChange={(e) =>
                                  updateVehicle(index, "documentReference", e.target.value)
                                }
                                placeholder="Réf Doc"
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
                    )}
                  </FormDialog>
                </div>
              }
            >
              {transhippedDocs.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {transhippedDocs.map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-border p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-info/10 p-2">
                            <Truck className="h-4 w-4 text-info" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase text-muted-foreground font-bold">Destinataire</div>
                            <div className="text-sm font-semibold">{doc.transhippedTo}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-muted-foreground font-bold">Véhicules</div>
                          <div className="text-sm font-mono">{doc.vehicles.length}</div>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {doc.vehicles.map((v, i) => (
                          <div key={i} className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded-md">
                            <span className="font-medium">{v.vehicleReference}</span>
                            <span className="text-muted-foreground">{v.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                  <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm">Aucun dossier transhipped pour cet intervalle.</p>
                </div>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4 space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="Manifest reference…"
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={() => setManifestSearch("")}>
                Filter
              </Button>
            </div>
            <Panel title={`Results (${filteredManifests.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Plate Number</th>
                      <th className="px-3 py-2">Vehicle Mark</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Manifest Ref</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredManifests.map((m) => (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2">{m.vehicule}</td>
                        <td className="px-3 py-2">{m.marque}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{m.reference}</td>
                        <td className="px-3 py-2">{m.date}</td>
                        <td className="px-3 py-2">
                          <Button size="sm" variant="outline" onClick={() => toast.success("OK")}>
                            OK
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="it" className="mt-4 space-y-6">
            <Panel 
              title="Support IT" 
              icon={CheckCircle}
              actions={
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Réf IT..." 
                      className="pl-9 h-9 w-40 text-xs" 
                      value={itSearch}
                      onChange={(e) => setItSearch(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Nº Châssis..." 
                      className="pl-9 h-9 w-40 text-xs"
                      value={itChassisSearch}
                      onChange={(e) => setItChassisSearch(e.target.value)}
                    />
                  </div>
                  <FormDialog
                    trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> New IT</Button>}
                    title="Créer une Entrée IT"
                    onSubmit={async (fd?: Record<string, string>) => {
                      try {
                        // collect from refs via form
                        const form = document.querySelector('[data-it-form]') as HTMLFormElement;
                        const inputs = form ? Object.fromEntries(new FormData(form)) : {};
                        await apiCreateItEntry(inputs);
                        if (reloadIt) reloadIt();
                        toast.success("IT Entry enregistrée.");
                      } catch (e: any) {
                        toast.error(e?.message || "Erreur lors de la création.");
                      }
                    }}
                  >
                    <FormGrid>
                      <Field label="Consignee" required>
                        <Input />
                      </Field>
                      <Field label="Chassis" required>
                        <Input />
                      </Field>
                      <Field label="Vehicle Mark" required>
                        <Input />
                      </Field>
                      <Field label="Manifest Year" required>
                        <Input type="number" placeholder="2025" />
                      </Field>
                      <Field label="Color" required>
                        <Input />
                      </Field>
                      <Field label="IT Ref" required>
                        <Input />
                      </Field>
                    </FormGrid>
                  </FormDialog>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Référence IT</th>
                      <th className="px-4 py-3 text-left">Châssis</th>
                      <th className="px-4 py-3 text-left">Consignataire</th>
                      <th className="px-4 py-3 text-left">Marque</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredIT.map((it: any) => (
                      <tr key={it.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{it.it_reference || it.reference}</td>
                        <td className="px-4 py-3 font-medium">{it.chassis}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.consignee}</td>
                        <td className="px-4 py-3">{it.vehicule_mark || it.vehicleMark}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.manifest_year || it.date}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredIT.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground">Aucune entrée IT trouvée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Gestion des Références" icon={Search}>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Search className="h-5 w-5" />
                    <span>Analyse</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyser la liste des références pour détecter les doublons ou anomalies de format.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Analyse en cours...")}>
                    Lancer l'analyse
                  </Button>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2 text-warning font-semibold">
                    <CheckCircle className="h-5 w-5" />
                    <span>Vérification</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vérifier l'intégrité des numéros de châssis par rapport au registre constructeur.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Vérification des châssis...")}>
                    Vérifier Châssis
                  </Button>
                </div>

                <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2 text-success font-semibold">
                    <Plus className="h-5 w-5" />
                    <span>Correction</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Corriger manuellement ou automatiquement les incohérences détectées.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info("Recherche d'incohérences...")}>
                    Corriger Incohérences
                  </Button>
                </div>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
