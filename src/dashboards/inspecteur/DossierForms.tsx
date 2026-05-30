import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { CreditCard, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { apiCreateDossier, apiGetTypesDossiers, apiGetWarehouses, apiGetNextReference } from "@/lib/api";

function useTypeDossierId(code: string) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    apiGetTypesDossiers().then(res => {
      const type = res.find((t: any) => t.code.toLowerCase() === code.toLowerCase());
      if (type) setId(String(type.id));
    });
  }, [code]);
  return id;
}

function useWarehouses() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  useEffect(() => {
    apiGetWarehouses().then(res => setWarehouses(res)).catch(() => { });
  }, []);
  return warehouses;
}

const CommonFields = ({ formData, setFormData }: { formData?: any, setFormData?: any }) => {
  const [ref, setRef] = useState("Chargement...");
  useEffect(() => {
    apiGetNextReference().then(res => setRef(res.reference)).catch(() => setRef("RD-XXXX"));
  }, []);
  return (
    <div className="col-span-2 grid grid-cols-2 gap-4 mb-2">
      <Field label="Référence dossier"><Input value={ref} disabled className="bg-muted text-primary font-mono font-bold" /></Field>
      <Field label="Date"><Input value={new Date().toLocaleDateString('fr-FR')} disabled className="bg-muted" /></Field>
      {formData && setFormData && (
        <>
          <Field label="Référence E- (DRA)"><Input placeholder="E-XXXX" value={formData.dra || ''} onChange={e => setFormData({...formData, dra: e.target.value})} /></Field>
          <Field label="T1"><Input placeholder="T1-XXXX" value={formData.t1 || ''} onChange={e => setFormData({...formData, t1: e.target.value})} /></Field>
        </>
      )}
    </div>
  );
};

const DynamicDeclarations = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  
  useEffect(() => {
    if (formData.declarations_details && formData.declarations_details.length > (num || 0)) {
      setFormData({ ...formData, declarations_details: formData.declarations_details.slice(0, num || 0) });
    }
  }, [num]); // prevent infinite loops

  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed border-border rounded-lg bg-card text-card-foreground">
      <h4 className="font-semibold text-sm">📋 Détails des {num} Déclaration{num > 1 ? 's' : ''}</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"decl-" + i} className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded border border-border">
          <Field label={"Déclaration " + (i + 1)}><Input placeholder={"N° Déclaration " + (i + 1)} value={(formData.declarations_details && formData.declarations_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({ ...formData, declarations_details: arr });
          }} /></Field>
          <Field label={"Date Déclaration " + (i + 1)}><Input type="date" value={(formData.declarations_details && formData.declarations_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.declarations_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({ ...formData, declarations_details: arr });
          }} /></Field>
        </div>
      ))}
    </div>
  );
};
const DynamicTitres = ({ count, formData, setFormData }: any) => {
  const num = parseInt(count);
  
  useEffect(() => {
    if (formData.titres_details && formData.titres_details.length > (num || 0)) {
      setFormData({ ...formData, titres_details: formData.titres_details.slice(0, num || 0) });
    }
  }, [num]); // removed formData.titres_details to prevent infinite loops

  if (!num || num < 1) return null;
  return (
    <div className="col-span-2 space-y-4 mt-2 p-4 border border-dashed border-border rounded-lg bg-card text-card-foreground">
      <h4 className="font-semibold text-sm">📄 Détails des {num} Titre{num > 1 ? 's' : ''}</h4>
      {Array.from({ length: num }).map((_, i) => (
        <div key={"titre-" + i} className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded border border-border">
          <Field label={"Titre " + (i + 1)}><Input placeholder={"N° Titre " + (i + 1)} value={(formData.titres_details && formData.titres_details[i]?.numero) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].numero = e.target.value;
            setFormData({ ...formData, titres_details: arr });
          }} /></Field>
          <Field label={"Date Titre " + (i + 1)}><Input type="date" value={(formData.titres_details && formData.titres_details[i]?.date) || ''} onChange={e => {
            const arr = [...(formData.titres_details || [])];
            if (!arr[i]) arr[i] = {};
            arr[i].date = e.target.value;
            setFormData({ ...formData, titres_details: arr });
          }} /></Field>
        </div>
      ))}
    </div>
  );
};
const LocalisationField = ({ value, onChange, warehouses }: any) => (
  <Field label="Localisation / Entrepôt">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Sélectionner l'entrepôt" /></SelectTrigger>
      <SelectContent>
        {warehouses.map((w: any) => (
          <SelectItem key={w.id} value={String(w.id)}>{w.nom}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

export function DirectForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const warehouses = useWarehouses();
  const typeId = type?.id || useTypeDossierId("direct");
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        declarant: formData.declarant,
        localisation: formData.localisation,
        extra_data: {
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations_attendues: parseInt(formData.nombre_declarations_attendues) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || [],
          reference_titre: formData.reference_titre,
          date_titre: formData.date_titre,
          reference_t1: formData.reference_t1,
          date_t1: formData.date_t1,
          reference_douane: formData.reference_douane,
          date_reference_douane: formData.date_reference_douane,
          date_debut: formData.date_debut,
          date_fin: formData.date_fin
        }
      });
      toast.success("Dossier Direct créé (Référence générée).");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button className="gap-1.5"><Plus className="h-4 w-4" />Direct</Button>}
      title="Nouveau dossier — Direct"
      submitLabel="Enregistrer"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Nom déclarant" required><Input onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <Field label="Nombre déclarations attendues" required><Input type="number" min={0} onChange={e => handleChange('nombre_declarations_attendues', e.target.value)} /></Field>
        <Field label="Nombre de titres" required><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations_attendues} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence T1" required><Input placeholder="T1-…" onChange={e => handleChange('reference_t1', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_t1', e.target.value)} /></Field>
        </div>

        <LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date référence douane" required><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Date début" required><Input type="date" onChange={e => handleChange('date_debut', e.target.value)} /></Field>
          <Field label="Date fin"><Input type="date" onChange={e => handleChange('date_fin', e.target.value)} /></Field>
        </div>
      </FormGrid>
    </FormDialog>
  );
}

export function TransbordementForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const typeId = type?.id || useTypeDossierId("transbordement");
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        extra_data: {
          ...formData,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations_attendues: parseInt(formData.nombre_declarations_attendues) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Transbordement créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Transbordement</Button>}
      title="Nouveau dossier — Transbordement"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Année" required><Input type="number" placeholder="2025" onChange={e => handleChange('annee', e.target.value)} /></Field>
        <Field label="Type Transbordement">
          <Select onValueChange={v => handleChange('type_transbordement', v)}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="transbordement">Transbordement</SelectItem>
              <SelectItem value="lettre_declaration">Lettre déclaration</SelectItem>
              <SelectItem value="lettre_transbordement">Lettre transbordement</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nombre déclarations attendues"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations_attendues', e.target.value)} /></Field>
        <Field label="Nombre de titres" required><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations_attendues} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre" required><Input onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date réf. douane" required><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
        <Field label="Réf. lettre demande transbordement"><Input onChange={e => handleChange('lettre_demande', e.target.value)} /></Field>
      </FormGrid>
    </FormDialog>
  );
}

export function VracForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const warehouses = useWarehouses();
  const typeId = type?.id || useTypeDossierId("vrac");
  const [formData, setFormData] = useState<any>({});
  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        declarant: formData.declarant,
        localisation: formData.localisation,
        extra_data: {
          ...formData,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations: parseInt(formData.nombre_declarations) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Vrac enregistré.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Vrac</Button>}
      title="Nouveau dossier — Vrac"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Nom déclarant" required><Input onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />
        <Field label="En route">
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" className="rounded" id="enroute-vrac" onChange={e => handleChange('en_route', e.target.checked)} />
            <label htmlFor="enroute-vrac" className="text-sm">Cocher si en route</label>
          </div>
        </Field>
        <Field label="Nombre déclarations"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>
        <Field label="Numéro châssis" required><Input onChange={e => handleChange('chassis', e.target.value)} /></Field>
        <Field label="Couleur"><Input onChange={e => handleChange('couleur', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre" required><Input onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence déclaration" required><Input onChange={e => handleChange('reference_declaration', e.target.value)} /></Field>
          <Field label="Date déclaration" required><Input type="date" onChange={e => handleChange('date_declaration', e.target.value)} /></Field>
        </div>
      </FormGrid>
    </FormDialog>
  );
}

export function LotForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const warehouses = useWarehouses();
  const typeId = type?.id || useTypeDossierId("lot");
  const [formData, setFormData] = useState<any>({});
  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        declarant: formData.declarant,
        localisation: formData.localisation,
        extra_data: {
          ...formData,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations_attendues: parseInt(formData.nombre_declarations_attendues) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Lot créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Lot / Colis</Button>}
      title="Nouveau dossier — Lot / Colis"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Nom déclarant" required><Input onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />
        <Field label="En route">
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" className="rounded" id="enroute-lot" onChange={e => handleChange('en_route', e.target.checked)} />
            <label htmlFor="enroute-lot" className="text-sm">Cocher si en route</label>
          </div>
        </Field>
        <Field label="Nombre véhicules"><Input type="number" min={0} onChange={e => handleChange('nombre_vehicules', e.target.value)} /></Field>
        <Field label="Nombre déclarations attendues"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations_attendues', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations_attendues} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date réf. douane" required><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
      </FormGrid>
    </FormDialog>
  );
}

export function PetrolierForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const typeId = type?.id || useTypeDossierId("petrolier");
  const [formData, setFormData] = useState<any>({});
  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        declarant: formData.declarant,
        extra_data: {
          ...formData,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations: parseInt(formData.nombre_declarations) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Pétrolier créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Pétrolier</Button>}
      title="Nouveau dossier — Produit Pétrolier"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Nom déclarant" required><Input onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <Field label="Nombre déclarations"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence T1" required><Input placeholder="T1-…" onChange={e => handleChange('reference_t1', e.target.value)} /></Field>
          <Field label="Sa date" required><Input type="date" onChange={e => handleChange('date_t1', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)" required><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date référence douane" required><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
        <Field label="Véhicule"><Input onChange={e => handleChange('vehicule', e.target.value)} /></Field>
        <Field label="Provenance"><Input onChange={e => handleChange('provenance', e.target.value)} /></Field>
        <Field label="Destination"><Input onChange={e => handleChange('destination', e.target.value)} /></Field>
      </FormGrid>
    </FormDialog>
  );
}

export function AutresForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const typeId = useTypeDossierId("autres");
  const [formData, setFormData] = useState<any>({});
  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        declarant: formData.declarant,
        extra_data: {
          ...formData,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations: parseInt(formData.nombre_declarations) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Autres créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Autres</Button>}
      title="Nouveau dossier — Autres"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Description du type" required><Input placeholder="Ex: Transit, Conteneur…" onChange={e => handleChange('description_type', e.target.value)} /></Field>
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Nom déclarant" required><Input onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <Field label="Nombre déclarations"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)"><Input placeholder="E-001" onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date"><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="T1"><Input placeholder="T1-…" onChange={e => handleChange('reference_t1', e.target.value)} /></Field>
          <Field label="Sa date"><Input type="date" onChange={e => handleChange('date_t1', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)"><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date réf. douane"><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
        <Field label="Véhicule"><Input onChange={e => handleChange('vehicule', e.target.value)} /></Field>
        <Field label="Provenance"><Input onChange={e => handleChange('provenance', e.target.value)} /></Field>
        <Field label="Destination"><Input onChange={e => handleChange('destination', e.target.value)} /></Field>
      </FormGrid>
    </FormDialog>
  );
}

export function TraficForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const typeId = type?.id || useTypeDossierId("trafic");
  const [formData, setFormData] = useState<any>({});
  const [evals, setEvals] = useState<string[]>([]);

  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        extra_data: {
          ...formData,
          evaluateurs: evals,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations: parseInt(formData.nombre_declarations) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Trafic créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Trafic</Button>}
      title="Trafic Transfrontalier"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Dénomination marchandise" required><Input onChange={e => handleChange('marchandise', e.target.value)} /></Field>
        <Field label="Moyen de transport" required>
          <Select onValueChange={v => handleChange('moyen_transport', v)}>
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
        <Field label="Nombre déclarations"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        <Field label="Modèle de déclaration"><Input placeholder="Trafic simplifié…" onChange={e => handleChange('modele_declaration', e.target.value)} /></Field>
        <Field label="Lieu d'entreposage">
          <Select onValueChange={v => handleChange('lieu_entreposage', v)}>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plein_air">Plein air</SelectItem>
              <SelectItem value="batiment_1">Bâtiment 1</SelectItem>
              <SelectItem value="batiment_2">Bâtiment 2</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Entrepôt">
          <Select onValueChange={v => handleChange('entrepot', v)}>
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
          {evals.map((val, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder={"Évaluateur " + (i + 1)} value={val} onChange={e => {
                const newEvals = [...evals];
                newEvals[i] = e.target.value;
                setEvals(newEvals);
              }} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setEvals(evals.filter((_, idx) => idx !== i))}>×</Button>
            </div>
          ))}
        </div>
      </FormGrid>
    </FormDialog>
  );
}

export function ExportForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  const typeId = type?.id || useTypeDossierId("export");
  const [formData, setFormData] = useState<any>({});
  const [docs, setDocs] = useState<any[]>([]);

  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleDocChange = (i: number, field: string, value: any) => {
    const newDocs = [...docs];
    newDocs[i] = { ...newDocs[i], [field]: value };
    setDocs(newDocs);
  };

  const handleNumDocsChange = (val: string) => {
    const n = parseInt(val) || 0;
    if (n > docs.length) {
      setDocs([...docs, ...Array(n - docs.length).fill({})]);
    } else if (n < docs.length) {
      setDocs(docs.slice(0, n));
    }
  };

  const handleSubmit = async () => {
    if (!typeId) { toast.error("Type de dossier non trouvé"); return; }

    const tarif = type?.tarif || 0;
    const devise = type?.devise || 'USD';
    if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${tarif} ${devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
      toast.info("Création et paiement annulés.");
      return;
    }
    try {
      await apiCreateDossier({
        type_dossier_id: typeId,
        dra: formData.dra,
        t1: formData.t1,
        importateur: formData.importateur,
        extra_data: {
          ...formData,
          documents: docs,
          nombre_titres: parseInt(formData.nombre_titres) || 0,
          nombre_declarations: parseInt(formData.nombre_declarations) || 0,
          declarations_details: formData.declarations_details || [],
          titres_details: formData.titres_details || []
        }
      });
      toast.success("Dossier Export créé.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <FormDialog
      trigger={<Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" />Export</Button>}
      title="Nouveau dossier — Export"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Exportateur" required><Input onChange={e => handleChange('exportateur', e.target.value)} /></Field>
        <Field label="Importateur" required><Input onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Mode de déclaration" required><Input onChange={e => handleChange('mode_declaration', e.target.value)} /></Field>
        <Field label="Véhicule" required><Input onChange={e => handleChange('vehicule', e.target.value)} /></Field>
        <Field label="Nombre documents joints" required>
          <Input type="number" min={0} value={docs.length} onChange={e => handleNumDocsChange(e.target.value)} />
        </Field>

        <Field label="Nombre déclarations"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

        <DynamicDeclarations count={formData.nombre_declarations} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

        {docs.length > 0 && (
          <div className="col-span-2 mt-4 space-y-4 border-t pt-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Documents joints</h4>
            {docs.map((doc, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Dénomination doc {i + 1}</label>
                  <Input className="h-8 text-xs" onChange={e => handleDocChange(i, 'denomination', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Référence doc {i + 1}</label>
                  <Input className="h-8 text-xs" onChange={e => handleDocChange(i, 'reference', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Date doc {i + 1}</label>
                  <Input className="h-8 text-xs" type="date" onChange={e => handleDocChange(i, 'date', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </FormGrid>
    </FormDialog>
  );
}

export function DechargementForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  return <AutresForm />;
}

export function AllegementForm({ type, onSuccess }: { type?: any, onSuccess?: () => void } = {}) {
  return <AutresForm />;
}
