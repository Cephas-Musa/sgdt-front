import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { apiCreateDossier, apiGetTypesDossiers, apiGetWarehouses, apiGetNextReference } from "@/lib/api";

interface TypeDossier {
    id: string;
    code: string;
    libelle: string;
    tarif: number;
    devise: string;
}

interface FormDataState {
    [key: string]: any;
}

function useTypesDossiers() {
    const [types, setTypes] = useState<TypeDossier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGetTypesDossiers()
            .then((res: any) => {
                setTypes(res || []);
            })
            .catch(() => {
                setTypes([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { types, loading };
}

function useWarehouses() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    useEffect(() => {
        apiGetWarehouses().then(res => setWarehouses(res)).catch(() => { });
    }, []);
    return warehouses;
}

const CommonFields = () => {
    const [ref, setRef] = useState("Chargement...");
    useEffect(() => {
        apiGetNextReference().then(res => setRef(res.reference)).catch(() => setRef("RD-XXXX"));
    }, []);
    return (
        <div className="col-span-2 grid grid-cols-2 gap-4 mb-2">
            <Field label="Référence dossier"><Input value={ref} disabled className="bg-muted text-primary font-mono font-bold" /></Field>
            <Field label="Date"><Input value={new Date().toLocaleDateString('fr-FR')} disabled className="bg-muted" /></Field>
        </div>
    );
};

const DynamicDeclarations = ({ count, formData, setFormData }: any) => {
    const num = parseInt(count);

    useEffect(() => {
        if (formData.declarations_details && formData.declarations_details.length > (num || 0)) {
            setFormData({ ...formData, declarations_details: formData.declarations_details.slice(0, num || 0) });
        }
    }, [num]);

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
    }, [num]);

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

/**
 * Composant de formulaire dynamique générique pour tous les types de dossiers
 */
function DynamicDossierForm({ type, onSuccess }: { type: TypeDossier, onSuccess?: () => void }) {
    const warehouses = useWarehouses();
    const [formData, setFormData] = useState<FormDataState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Confirmer le tarif
            if (!window.confirm(`Le tarif de création pour ce type de dossier est de ${type.tarif} ${type.devise}. Ce montant sera déduit de votre solde.\n\nVoulez-vous procéder au paiement et créer le dossier ?`)) {
                toast.info("Création et paiement annulés.");
                setIsSubmitting(false);
                return;
            }

            const payload: any = {
                type_dossier_id: type.id,
                extra_data: {
                    ...formData,
                    nombre_titres: parseInt(formData.nombre_titres) || 0,
                    nombre_declarations_attendues: parseInt(formData.nombre_declarations_attendues) || 0,
                    declarations_details: formData.declarations_details || [],
                    titres_details: formData.titres_details || [],
                }
            };

            // Ajouter les champs si remplis
            if (formData.importateur) payload.importateur = formData.importateur;
            if (formData.declarant) payload.declarant = formData.declarant;
            if (formData.localisation) payload.localisation = formData.localisation;

            await apiCreateDossier(payload);
            toast.success(`Dossier ${type.libelle} créé (Référence générée).`);

            // Réinitialiser le formulaire
            setFormData({});
            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error("Erreur: " + (err.message || "Impossible de créer le dossier"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormDialog
            trigger={
                <Button className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    {type.libelle}
                </Button>
            }
            title={`Nouveau dossier — ${type.libelle}`}
            submitLabel="Enregistrer"
            onSubmit={handleSubmit}
        >
            <FormGrid>
                <CommonFields />

                {/* Champs standards pour tous les types */}
                <Field label="Importateur"><Input onChange={e => handleChange('importateur', e.target.value)} placeholder="Nom de l'importateur" /></Field>
                <Field label="Déclarant"><Input onChange={e => handleChange('declarant', e.target.value)} placeholder="Nom du déclarant" /></Field>

                {/* Déclarations et Titres */}
                <Field label="Nombre déclarations attendues"><Input type="number" min={0} onChange={e => handleChange('nombre_declarations_attendues', e.target.value)} /></Field>
                <Field label="Nombre de titres"><Input type="number" min={0} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>

                <DynamicDeclarations count={formData.nombre_declarations_attendues} formData={formData} setFormData={setFormData} />
                <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />

                {/* Champs pour références et dates */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence titre (E-XXX)"><Input placeholder="E-001" onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
                    <Field label="Date titre"><Input type="date" onChange={e => handleChange('date_titre', e.target.value)} /></Field>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence T1"><Input placeholder="T1-…" onChange={e => handleChange('reference_t1', e.target.value)} /></Field>
                    <Field label="Date T1"><Input type="date" onChange={e => handleChange('date_t1', e.target.value)} /></Field>
                </div>

                <LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence douane"><Input placeholder="E-001" onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
                    <Field label="Date référence douane"><Input type="date" onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Date début"><Input type="date" onChange={e => handleChange('date_debut', e.target.value)} /></Field>
                    <Field label="Date fin"><Input type="date" onChange={e => handleChange('date_fin', e.target.value)} /></Field>
                </div>
            </FormGrid>
        </FormDialog>
    );
}

/**
 * Conteneur qui affiche dynamiquement les formulaires pour tous les types disponibles
 */
export function DynamicDossierFormsContainer({ onSuccess }: { onSuccess?: () => void } = {}) {
    const { types, loading } = useTypesDossiers();

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm text-muted-foreground">Chargement des types de dossiers...</span>
            </div>
        );
    }

    if (types.length === 0) {
        return (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                <p className="text-sm text-muted-foreground">
                    Aucun type de dossier n'est actuellement disponible. Veuillez contacter l'administrateur.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {types.map((type) => (
                <DynamicDossierForm key={type.id} type={type} onSuccess={onSuccess} />
            ))}
        </div>
    );
}
