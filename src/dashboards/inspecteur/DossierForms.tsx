import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { CreditCard, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

/* ── Validation helpers ── */
function isValidRD(v: string) { return /^RD-\d{4,6}$/.test(v); }
function isValidE(v: string) { return /^E-\d{3,5}$/.test(v); }

/* ── Dossier Direct ── */
export function DirectForm() {
  const [ref, setRef] = useState("");
  const [refDouane, setRefDouane] = useState("");
  const refErr = ref && !isValidRD(ref);
  const eErr = refDouane && !isValidE(refDouane);

  return (
    <FormDialog
      trigger={<Button className="gap-1.5"><Plus className="h-4 w-4" />Direct ($50)</Button>}
      title="Nouveau dossier — Direct"
      submitLabel="Enregistrer"
      onSubmit={() => {
        if (!isValidRD(ref)) { toast.error("Référence dossier invalide (format RD-XXXX)"); return; }
        if (!isValidE(refDouane)) { toast.error("Référence douane invalide (format E-XXX)"); return; }
        toast.success("Dossier Direct créé. Passez au paiement.");
      }}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" value={ref} onChange={e => setRef(e.target.value)}
            className={refErr ? "border-destructive" : ""} />
          {refErr && <p className="text-xs text-destructive mt-1">Format requis : RD-XXXX</p>}
        </Field>
        <Field label="Date" required><Input type="date" /></Field>
        <Field label="Type"><Input value="Direct" readOnly className="bg-muted/50" /></Field>
        <Field label="Nombre de titres" required><Input type="number" min={1} /></Field>
        <Field label="Nombre déclarations attendues" required><Input type="number" min={1} /></Field>
        
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)" required><Input placeholder="E-001" /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence T1" required><Input placeholder="T1-…" /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        
        <Field label="Localisation"><Input /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required>
            <Input placeholder="E-001" value={refDouane} onChange={e => setRefDouane(e.target.value)}
              className={eErr ? "border-destructive" : ""} />
            {eErr && <p className="text-xs text-destructive mt-1">Format requis : E-XXX</p>}
          </Field>
          <Field label="Date référence douane" required><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Date début" required><Input type="date" /></Field>
          <Field label="Date fin"><Input type="date" /></Field>
        </div>
        <Field label="Nom déclarant" required><Input /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Transbordement ── */
export function TransbordementForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Transbordement ($50)</Button>}
      title="Nouveau dossier — Transbordement"
      onSubmit={() => toast.success("Dossier Transbordement créé. Passez au paiement.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Année" required><Input type="number" placeholder="2025" /></Field>
        <Field label="Type">
          <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="transbordement">Transbordement</SelectItem>
              <SelectItem value="lettre_declaration">Lettre déclaration</SelectItem>
              <SelectItem value="lettre_transbordement">Lettre transbordement</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nombre de titres" required><Input type="number" min={1} /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre" required><Input /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        <Field label="Nombre déclarations attendues"><Input type="number" /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" /></Field>
          <Field label="Date réf. douane" required><Input type="date" /></Field>
        </div>
        <Field label="Réf. lettre demande transbordement"><Input /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Vrac ── */
export function VracForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Vrac ($10)</Button>}
      title="Nouveau dossier — Vrac"
      onSubmit={() => toast.success("Dossier Vrac enregistré. Veuillez payer pour activer.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Type"><Input value="Vrac" readOnly className="bg-muted/50" /></Field>
        <Field label="Localisation"><Input /></Field>
        <Field label="En route">
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" className="rounded" id="enroute-vrac" />
            <label htmlFor="enroute-vrac" className="text-sm">Cocher si en route</label>
          </div>
        </Field>
        <Field label="Nombre de titres"><Input type="number" /></Field>
        <Field label="Nombre de déclarations"><Input type="number" /></Field>
        <Field label="Numéro châssis" required><Input /></Field>
        <Field label="Couleur"><Input /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre" required><Input /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence déclaration" required><Input /></Field>
          <Field label="Date déclaration" required><Input type="date" /></Field>
        </div>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Nom déclarant" required><Input /></Field>
      </FormGrid>
      <div className="mt-3 rounded-md bg-warning/10 border border-warning/30 p-3 text-sm text-warning flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Veuillez effectuer le paiement pour activer ce dossier</span>
      </div>
    </FormDialog>
  );
}

/* ── Dossier Lot / Colis ── */
export function LotForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Lot / Colis ($10)</Button>}
      title="Nouveau dossier — Lot / Colis"
      onSubmit={() => toast.success("Dossier Lot créé. Passez au paiement.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Type"><Input value="Lot / Colis" readOnly className="bg-muted/50" /></Field>
        <Field label="Localisation"><Input /></Field>
        <Field label="En route">
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" className="rounded" id="enroute-lot" />
            <label htmlFor="enroute-lot" className="text-sm">Cocher si en route</label>
          </div>
        </Field>
        <Field label="Nombre véhicules"><Input type="number" /></Field>
        <Field label="Nombre déclarations attendues"><Input type="number" /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" /></Field>
          <Field label="Date réf. douane" required><Input type="date" /></Field>
        </div>
        <Field label="Nom déclarant" required><Input /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Produit Pétrolier ── */
export function PetrolierForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Pétrolier ($50)</Button>}
      title="Nouveau dossier — Produit Pétrolier"
      onSubmit={() => toast.success("Dossier Pétrolier créé. Passez au paiement.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Type"><Input value="Produit pétrolier" readOnly className="bg-muted/50" /></Field>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Nom déclarant" required><Input /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)" required><Input placeholder="E-001" /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence T1" required><Input placeholder="T1-…" /></Field>
          <Field label="Sa date" required><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" /></Field>
          <Field label="Date réf. douane" required><Input type="date" /></Field>
        </div>
        <Field label="Quantité (litres)" required><Input type="number" min={1} /></Field>
        <Field label="Véhicule / Citerne" required><Input /></Field>
        <Field label="Provenance" required><Input /></Field>
        <Field label="Destination" required><Input /></Field>
        <Field label="Date" required><Input type="date" /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Déchargement ── */
export function DechargementForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Déchargement ($10)</Button>}
      title="Nouveau dossier — Déchargement"
      onSubmit={() => toast.success("Dossier Déchargement créé. Passez au paiement.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Type"><Input value="Déchargement" readOnly className="bg-muted/50" /></Field>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Nom déclarant" required><Input /></Field>
        <Field label="Entrepôt de destination" required>
          <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="kasindi1">Entrepôt Kasindi 1</SelectItem>
              <SelectItem value="kasindi2">Entrepôt Kasindi 2</SelectItem>
              <SelectItem value="goma">Entrepôt Goma</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Véhicule" required><Input /></Field>
        <Field label="Plaque" required><Input /></Field>
        <Field label="Nombre de colis" required><Input type="number" min={1} /></Field>
        <Field label="Poids total (kg)" required><Input type="number" min={1} /></Field>
        <Field label="Emplacement entrepôt"><Input placeholder="Zone A, Quai 4…" /></Field>
        <Field label="Date" required><Input type="date" /></Field>
        <Field label="Observations"><Input /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Autres ── */
export function AutresForm() {
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Autres ($10)</Button>}
      title="Nouveau dossier — Autres"
      onSubmit={() => toast.success("Dossier créé. Passez au paiement.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required><Input placeholder="RD-0001" /></Field>
        <Field label="Type"><Input value="Autres" readOnly className="bg-muted/50" /></Field>
        <Field label="Description du type" required><Input placeholder="Ex: Transit, Conteneur…" /></Field>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Nom déclarant" required><Input /></Field>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)"><Input placeholder="E-001" /></Field>
          <Field label="Sa date"><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="T1"><Input placeholder="T1-…" /></Field>
          <Field label="Sa date"><Input type="date" /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)"><Input placeholder="E-001" /></Field>
          <Field label="Date réf. douane"><Input type="date" /></Field>
        </div>
        <Field label="Véhicule"><Input /></Field>
        <Field label="Provenance"><Input /></Field>
        <Field label="Destination"><Input /></Field>
        <Field label="Date" required><Input type="date" /></Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Trafic Transfrontalier ── */
export function TraficForm() {
  const [evals, setEvals] = useState<string[]>([]);
  
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Trafic ($10)</Button>}
      title="Trafic Transfrontalier"
      onSubmit={() => toast.success("Dossier Trafic créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier" required><Input placeholder="RD-0001" /></Field>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Dénomination marchandise" required><Input /></Field>
        <Field label="Moyen de transport" required>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="velo">Vélo</SelectItem>
              <SelectItem value="tricycle">Tricycle</SelectItem>
              <SelectItem value="voiture">Voiture</SelectItem>
              <SelectItem value="humain">Humain</SelectItem>
              <SelectItem value="autres">Autres</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Modèle de déclaration"><Input placeholder="Trafic simplifié…" /></Field>
        <Field label="Lieu d'entreposage">
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plein_air">Plein air</SelectItem>
              <SelectItem value="batiment_1">Bâtiment 1</SelectItem>
              <SelectItem value="batiment_2">Bâtiment 2</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Entrepôt">
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plein_air">Plein air</SelectItem>
              <SelectItem value="batiment">Bâtiment</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Évaluateurs</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEvals([...evals, ""])}>
              <Plus className="h-3.5 w-3.5 mr-1" />Ajouter évaluateur
            </Button>
          </div>
          {evals.map((_, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder={`Évaluateur ${i+1}`} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setEvals(evals.filter((_, idx) => idx !== i))}>×</Button>
            </div>
          ))}
        </div>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Export ── */
export function ExportForm() {
  const [numDocs, setNumDocs] = useState(0);
  
  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Export ($50)</Button>}
      title="Nouveau dossier — Export"
      onSubmit={() => toast.success("Dossier Export créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier" required><Input placeholder="RD-0001" /></Field>
        <Field label="Exportateur" required><Input /></Field>
        <Field label="Importateur" required><Input /></Field>
        <Field label="Mode de déclaration" required><Input /></Field>
        <Field label="Véhicule" required><Input /></Field>
        <Field label="Nombre documents joints" required>
          <Input type="number" min={0} value={numDocs} onChange={e => setNumDocs(parseInt(e.target.value) || 0)} />
        </Field>
        
        {numDocs > 0 && (
          <div className="col-span-2 mt-4 space-y-4 border-t pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documents joints</h4>
            {Array.from({ length: numDocs }).map((_, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Dénomination doc {i+1}</label>
                  <Input className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Référence doc {i+1}</label>
                  <Input className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Date doc {i+1}</label>
                  <Input className="h-8 text-xs" type="date" />
                </div>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Module Paiement ── */
export function PaiementModule() {
  const [paid, setPaid] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent" />
          <h3 className="font-medium">Module Paiement — Validation dossier</h3>
        </div>
        {paid && <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success"><CheckCircle2 className="h-3 w-3" />Payé</span>}
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-dashed border-border p-4">
          <FormGrid>
            <Field label="Référence dossier"><Input placeholder="RD-0001" /></Field>
            <Field label="Type dossier"><Input readOnly placeholder="Direct" /></Field>
            <Field label="Quantité"><Input type="number" min={1} /></Field>
            <Field label="Montant total ($)" required><Input type="number" /></Field>
          </FormGrid>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => { setPaid(true); toast.success("Paiement validé ✓ Dossier activé et ajouté à la liste."); }}>
              <CreditCard className="mr-1.5 h-4 w-4" />Valider le paiement
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ❌ Tant que le paiement n'est pas effectué, le dossier ne sera PAS visible dans la liste active.
          </p>
        </div>
      </div>
    </div>
  );
}

