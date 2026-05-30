import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Declaration {
    index: number;
    numero: string;
    date: string;
}

interface Titre {
    index: number;
    numero: string;
    date: string;
}

interface ExtraData {
    nombre_declarations_attendues?: number;
    nombre_declarations?: number;
    nombre_titres?: number;
    declarations_details?: Declaration[];
    titres_details?: Titre[];
    [key: string]: any;
}

interface DossierExtraDataEditorProps {
    extraData?: ExtraData;
    onSave: (updatedData: ExtraData) => Promise<void>;
    disabled?: boolean;
}

export function DossierExtraDataEditor({ extraData, onSave, disabled = false }: DossierExtraDataEditorProps) {
    const [formData, setFormData] = useState<ExtraData>(extraData || {});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (path: string, value: any) => {
        const keys = path.split(".");
        const newData = JSON.parse(JSON.stringify(formData));

        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;

        setFormData(newData);
    };

    const handleDeclarationChange = (index: number, field: "numero" | "date", value: string) => {
        const declarations = [...(formData.declarations_details || [])];
        if (!declarations[index]) declarations[index] = { index: index + 1, numero: "-", date: "-" };
        declarations[index][field] = value;
        setFormData({ ...formData, declarations_details: declarations });
    };

    const handleTitreChange = (index: number, field: "numero" | "date", value: string) => {
        const titres = [...(formData.titres_details || [])];
        if (!titres[index]) titres[index] = { index: index + 1, numero: "-", date: "-" };
        titres[index][field] = value;
        setFormData({ ...formData, titres_details: titres });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onSave(formData);
            toast.success("Données mises à jour avec succès");
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la mise à jour");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormDialog
            trigger={
                <Button disabled={disabled} className="gap-1.5" variant="outline">
                    <Edit2 className="h-4 w-4" />
                    Remplir les données
                </Button>
            }
            title="Remplir les informations manquantes"
            submitLabel="Sauvegarder"
            onSubmit={handleSubmit}
        >
            <FormGrid>
                {/* Déclarations */}
                {(formData.declarations_details?.length || 0) > 0 && (
                    <>
                        <h4 className="col-span-2 font-semibold text-blue-700 text-sm mb-2">📋 Déclarations</h4>
                        {(formData.declarations_details || []).map((decl, i) => (
                            <div key={`decl-${i}`} className="col-span-2 grid grid-cols-2 gap-4 p-3 rounded-lg bg-blue-50/50">
                                <Field label={`Déclaration ${i + 1}`}>
                                    <Input
                                        placeholder={`N° Déclaration ${i + 1}`}
                                        value={decl.numero}
                                        onChange={(e) => handleDeclarationChange(i, "numero", e.target.value)}
                                    />
                                </Field>
                                <Field label={`Date Déclaration ${i + 1}`}>
                                    <Input
                                        type="date"
                                        value={decl.date}
                                        onChange={(e) => handleDeclarationChange(i, "date", e.target.value)}
                                    />
                                </Field>
                            </div>
                        ))}
                    </>
                )}

                {/* Titres */}
                {(formData.titres_details?.length || 0) > 0 && (
                    <>
                        <h4 className="col-span-2 font-semibold text-amber-700 text-sm mb-2 mt-4">📄 Titres</h4>
                        {(formData.titres_details || []).map((titre, i) => (
                            <div key={`titre-${i}`} className="col-span-2 grid grid-cols-2 gap-4 p-3 rounded-lg bg-amber-50/50">
                                <Field label={`Titre ${i + 1}`}>
                                    <Input
                                        placeholder={`N° Titre ${i + 1}`}
                                        value={titre.numero}
                                        onChange={(e) => handleTitreChange(i, "numero", e.target.value)}
                                    />
                                </Field>
                                <Field label={`Date Titre ${i + 1}`}>
                                    <Input
                                        type="date"
                                        value={titre.date}
                                        onChange={(e) => handleTitreChange(i, "date", e.target.value)}
                                    />
                                </Field>
                            </div>
                        ))}
                    </>
                )}

                {/* Autres champs */}
                <Field label="Référence Titre">
                    <Input
                        value={formData.reference_titre || ""}
                        onChange={(e) => handleChange("reference_titre", e.target.value)}
                    />
                </Field>
                <Field label="Date Titre">
                    <Input
                        type="date"
                        value={formData.date_titre || ""}
                        onChange={(e) => handleChange("date_titre", e.target.value)}
                    />
                </Field>
                <Field label="Référence T1">
                    <Input
                        value={formData.reference_t1 || ""}
                        onChange={(e) => handleChange("reference_t1", e.target.value)}
                    />
                </Field>
                <Field label="Date T1">
                    <Input
                        type="date"
                        value={formData.date_t1 || ""}
                        onChange={(e) => handleChange("date_t1", e.target.value)}
                    />
                </Field>
                <Field label="Référence Douane">
                    <Input
                        value={formData.reference_douane || ""}
                        onChange={(e) => handleChange("reference_douane", e.target.value)}
                    />
                </Field>
                <Field label="Date Référence Douane">
                    <Input
                        type="date"
                        value={formData.date_reference_douane || ""}
                        onChange={(e) => handleChange("date_reference_douane", e.target.value)}
                    />
                </Field>
                <Field label="Date Début">
                    <Input
                        type="date"
                        value={formData.date_debut || ""}
                        onChange={(e) => handleChange("date_debut", e.target.value)}
                    />
                </Field>
                <Field label="Date Fin">
                    <Input
                        type="date"
                        value={formData.date_fin || ""}
                        onChange={(e) => handleChange("date_fin", e.target.value)}
                    />
                </Field>
            </FormGrid>
        </FormDialog>
    );
}
