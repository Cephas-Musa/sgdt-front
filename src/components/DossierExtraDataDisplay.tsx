import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
    reference_titre?: string;
    date_titre?: string;
    reference_t1?: string;
    date_t1?: string;
    reference_douane?: string;
    date_reference_douane?: string;
    date_debut?: string;
    date_fin?: string;
    [key: string]: any;
}

interface DossierExtraDataDisplayProps {
    extraData?: ExtraData;
    compact?: boolean;
}

const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return String(value);
};

const isFieldEmpty = (value: any): boolean => {
    return value === null || value === undefined || value === "" || value === "-";
};

export function DossierExtraDataDisplay({ extraData, compact = false }: DossierExtraDataDisplayProps) {
    if (!extraData) return null;

    const hasDeclarations = extraData.declarations_details && extraData.declarations_details.length > 0;
    const hasTitres = extraData.titres_details && extraData.titres_details.length > 0;

    if (compact) {
        return (
            <div className="space-y-2 text-xs">
                {extraData.nombre_declarations_attendues && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Déclarations attendues:</span>
                        <span className="font-mono font-semibold">{extraData.nombre_declarations_attendues}</span>
                    </div>
                )}
                {extraData.nombre_titres && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Titres:</span>
                        <span className="font-mono font-semibold">{extraData.nombre_titres}</span>
                    </div>
                )}
                {extraData.reference_douane && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Réf. Douane:</span>
                        <span className="font-mono font-semibold">{formatValue(extraData.reference_douane)}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Référence Titre</p>
                    <p className="font-mono text-sm">{formatValue(extraData.reference_titre)}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Date Titre</p>
                    <p className="font-mono text-sm">{formatValue(extraData.date_titre)}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Référence Douane</p>
                    <p className="font-mono text-sm">{formatValue(extraData.reference_douane)}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Date Référence Douane</p>
                    <p className="font-mono text-sm">{formatValue(extraData.date_reference_douane)}</p>
                </div>
            </div>

            {/* Déclarations */}
            {hasDeclarations && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                        📋 Déclarations ({extraData.declarations_details.length})
                    </h4>
                    <div className="space-y-2">
                        {extraData.declarations_details.map((decl) => (
                            <div
                                key={`decl-${decl.index}`}
                                className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100"
                            >
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex-shrink-0">
                                    {decl.index}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase">Déclaration {decl.index}</p>
                                    <p className={`font-mono text-sm font-semibold ${isFieldEmpty(decl.numero) ? "text-muted-foreground" : "text-foreground"}`}>
                                        {formatValue(decl.numero)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase">Date</p>
                                    <p className={`font-mono text-sm ${isFieldEmpty(decl.date) ? "text-muted-foreground" : "text-foreground"}`}>
                                        {formatValue(decl.date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Titres */}
            {hasTitres && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
                        📄 Titres ({extraData.titres_details.length})
                    </h4>
                    <div className="space-y-2">
                        {extraData.titres_details.map((titre) => (
                            <div
                                key={`titre-${titre.index}`}
                                className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                            >
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs flex-shrink-0">
                                    {titre.index}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase">Titre {titre.index}</p>
                                    <p className={`font-mono text-sm font-semibold ${isFieldEmpty(titre.numero) ? "text-muted-foreground" : "text-foreground"}`}>
                                        {formatValue(titre.numero)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase">Date</p>
                                    <p className={`font-mono text-sm ${isFieldEmpty(titre.date) ? "text-muted-foreground" : "text-foreground"}`}>
                                        {formatValue(titre.date)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dates de période */}
            {(extraData.date_debut || extraData.date_fin) && (
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Date Début</p>
                        <p className="font-mono text-sm">{formatValue(extraData.date_debut)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Date Fin</p>
                        <p className="font-mono text-sm">{formatValue(extraData.date_fin)}</p>
                    </div>
                </div>
            )}

            {/* T1 si présent */}
            {(extraData.reference_t1 || extraData.date_t1) && (
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Référence T1</p>
                        <p className="font-mono text-sm">{formatValue(extraData.reference_t1)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Date T1</p>
                        <p className="font-mono text-sm">{formatValue(extraData.date_t1)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
