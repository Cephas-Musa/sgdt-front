import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { CreditCard, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";

/* ── Validation helpers ── */
function isValidRD(v: string) {
  return /^RD-\d{4,6}$/.test(v);
}
function isValidE(v: string) {
  return /^E-\d{3,5}$/.test(v);
}

/* ── Dossier Direct ── */
export function DirectForm() {
  const [ref, setRef] = useState("");
  const [refDouane, setRefDouane] = useState("");
  const [importateur, setImportateur] = useState("");
  const [declarant, setDeclarant] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);
  const [dateDossier] = useState(new Date().toISOString().split("T")[0]);

  const refErr = ref && !isValidRD(ref);
  const eErr = refDouane && !isValidE(refDouane);

  return (
    <FormDialog
      trigger={
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Direct ($50)
        </Button>
      }
      title="Nouveau dossier — Direct"
      submitLabel="Enregistrer"
      onSubmit={() => {
        if (!isValidRD(ref)) {
          toast.error("Référence dossier invalide (format RD-XXXX)");
          return;
        }
        toast.success("Dossier Direct créé.");
      }}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input
            placeholder="RD-0001"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className={refErr ? "border-destructive" : ""}
          />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" value={dateDossier} onChange={() => {}} />
        </Field>
        <Field label="Type">
          <Input value="Direct" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nom importateur" required>
          <Input value={importateur} onChange={(e) => setImportateur(e.target.value)} />
        </Field>

        <Field label="Nombre de titres" required>
          <Input
            type="number"
            min={0}
            value={numTitres}
            onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)}
          />
        </Field>
        <Field label="Nombre déclarations attendues" required>
          <Input
            type="number"
            min={0}
            value={numDecl}
            onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)}
          />
        </Field>

        <Field label="Localisation" required>
          <Input list="entrepots-list" value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
        </Field>
        <Field label="Nom déclarant" required>
          <Input value={declarant} onChange={(e) => setDeclarant(e.target.value)} />
        </Field>

        {/* ── ITÉRATION TITRES ── */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Détails des Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Référence Titre ${i + 1}`}>
                  <Input placeholder="T1 / DEA / ..." />
                </Field>
                <Field label="Date">
                  <Input type="date" />
                </Field>
              </div>
            ))}
          </div>
        )}

        {/* ── ITÉRATION DÉCLARATIONS ── */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Détails des Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Référence Douane ${i + 1} (E-XXX)`}>
                  <Input placeholder="E-001" />
                </Field>
                <Field label="Date">
                  <Input type="date" />
                </Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Transbordement ── */
export function TransbordementForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Transbordement ($50)
        </Button>
      }
      title="Nouveau dossier — Transbordement"
      onSubmit={() => toast.success("Dossier Transbordement créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nombre déclarations attendues" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Réf. lettre demande transbordement" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

export function VracForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Vrac ($10)
        </Button>
      }
      title="Nouveau dossier — Vrac"
      onSubmit={() => toast.success("Dossier Vrac enregistré.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="Vrac" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Localisation" required>
          <Input list="entrepots-list" placeholder="Choisir localisation..." required />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Lot ── */
export function LotForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Lot ($10)
        </Button>
      }
      title="Nouveau dossier — Lot"
      onSubmit={() => toast.success("Dossier Lot créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="LOT" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nombre véhicules" required>
          <Input type="number" min={1} />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre déclarations attendues" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Localisation" required>
          <Input list="entrepots-list" />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Produit Pétrolier ── */
export function PetrolierForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Pétrolier ($50)
        </Button>
      }
      title="Nouveau dossier — Produit Pétrolier"
      onSubmit={() => toast.success("Dossier Pétrolier créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="Produit pétrolier" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Quantité (litres)" required>
          <Input type="number" min={1} />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>
        
        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Allègement ── */
export function AllegementForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Allègement ($10)
        </Button>
      }
      title="Nouveau dossier — Allègement"
      onSubmit={() => toast.success("Dossier Allègement créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="Allègement" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        <Field label="Localisation" required>
          <Input list="entrepots-list" />
        </Field>
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Autres ── */
export function AutresForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Autres ($10)
        </Button>
      }
      title="Nouveau dossier — Autres"
      onSubmit={() => toast.success("Dossier créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="Autres" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Description du type" required>
          <Input placeholder="Transit, Conteneur…" />
        </Field>
        <Field label="Importateur" required>
          <Input />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Dossier Déchargement ── */
export function DechargementForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Déchargement ($10)
        </Button>
      }
      title="Nouveau dossier — Déchargement"
      onSubmit={() => toast.success("Dossier Déchargement créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier (RD-XXXX)" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Type">
          <Input value="Déchargement" readOnly className="bg-muted/50" />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Trafic Transfrontalier ── */
export function TraficForm() {
  const [evals, setEvals] = useState<string[]>([]);
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Trafic ($10)
        </Button>
      }
      title="Trafic Transfrontalier"
      onSubmit={() => toast.success("Dossier Trafic créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

/* ── Export ── */
export function ExportForm() {
  const [numTitres, setNumTitres] = useState(0);
  const [numDecl, setNumDecl] = useState(0);

  return (
    <FormDialog
      trigger={
        <Button variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Export ($50)
        </Button>
      }
      title="Nouveau dossier — Export"
      onSubmit={() => toast.success("Dossier Export créé.")}
    >
      <FormGrid>
        <Field label="Référence dossier" required>
          <Input placeholder="RD-0001" />
        </Field>
        <Field label="Date référence dossier" required>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </Field>
        <Field label="Nom déclarant" required>
          <Input />
        </Field>
        <Field label="Nom importateur" required>
          <Input />
        </Field>
        <Field label="Nombre de titres" required>
          <Input type="number" value={numTitres} onChange={(e) => setNumTitres(parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Nombre de déclarations" required>
          <Input type="number" value={numDecl} onChange={(e) => setNumDecl(parseInt(e.target.value) || 0)} />
        </Field>

        {/* Dynamisme Titres */}
        {numTitres > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Titres ({numTitres})</h4>
            {Array.from({ length: numTitres }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Titre ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
              </div>
            ))}
          </div>
        )}

        {/* Dynamisme Déclarations */}
        {numDecl > 0 && (
          <div className="col-span-2 space-y-4 border-t pt-4">
            <h4 className="text-xs font-bold uppercase text-accent">Déclarations ({numDecl})</h4>
            {Array.from({ length: numDecl }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg border border-dashed">
                <Field label={`Réf Déclaration ${i + 1}`}><Input /></Field>
                <Field label="Date"><Input type="date" /></Field>
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
        {paid && (
          <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
            <CheckCircle2 className="h-3 w-3" />
            Payé
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-dashed border-border p-4">
          <FormGrid>
            <Field label="Référence dossier">
              <Input placeholder="RD-0001" />
            </Field>
            <Field label="Type dossier">
              <Input readOnly placeholder="Direct" />
            </Field>
            <Field label="Quantité">
              <Input type="number" min={1} />
            </Field>
            <Field label="Montant total ($)" required>
              <Input type="number" />
            </Field>
          </FormGrid>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                setPaid(true);
                toast.success("Paiement validé ✓ Dossier activé et ajouté à la liste.");
              }}
            >
              <CreditCard className="mr-1.5 h-4 w-4" />
              Valider le paiement
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ❌ Tant que le paiement n'est pas effectué, le dossier ne sera PAS visible dans la liste
            active.
          </p>
        </div>
      </div>
    </div>
  );
}
