import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  FileText,
  ShieldCheck,
  Truck,
  Package,
  Globe,
  Flag,
  Building2,
  ClipboardList,
  CheckCircle2,
  LogOut,
  Warehouse,
  ChevronRight,
  Info,
  Printer,
  Download,
  User,
  MapPin,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi, apiGetDossierAggregate, apiUpdateDossier } from "@/lib/api";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dossiers/$dossierId")({
  component: DossierDetailPage,
});

/* ── Types de filtres d'analyse ── */
type FilterKey =
  | "barriereEtranger"
  | "barrierePays"
  | "donneesRepresentation"
  | "rapportColisage"
  | "verification"
  | "sortie"
  | "rapportDechargement";

const FILTERS: { key: FilterKey; label: string; icon: any; color: string; source: string }[] = [
  {
    key: "barriereEtranger",
    label: "Barrière étranger",
    icon: Globe,
    color: "text-blue-500",
    source: "Typing Operator",
  },
  {
    key: "barrierePays",
    label: "Barrière pays",
    icon: Flag,
    color: "text-emerald-500",
    source: "Brigadier Barrière",
  },
  {
    key: "donneesRepresentation",
    label: "Données représentation",
    icon: Building2,
    color: "text-violet-500",
    source: "Opérateur de Saisie",
  },
  {
    key: "rapportColisage",
    label: "Rapport colisage",
    icon: ClipboardList,
    color: "text-amber-500",
    source: "Chef Entrepôt Logistique",
  },
  {
    key: "verification",
    label: "Vérification",
    icon: CheckCircle2,
    color: "text-cyan-500",
    source: "Vérificateur",
  },
  {
    key: "sortie",
    label: "Sortie",
    icon: LogOut,
    color: "text-orange-500",
    source: "Rapport de sortie",
  },
  {
    key: "rapportDechargement",
    label: "Rapport de déchargement",
    icon: Warehouse,
    color: "text-rose-500",
    source: "Chef Entrepôt Logistique",
  },
];

/* ── Rôles autorisés ── */
const ALLOWED_ROLES = [
  "directeur",
  "directeur_provincial",
  "agent_controle",
  "inspecteur_chef",
  "inspecteur",
  "secretaire_inspecteur",
  "chef_bureau_repr",
];

function DossierDetailPage() {
  const { dossierId } = useParams({ from: "/app/dossiers/$dossierId" });
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("barriereEtranger");
  const [filterTransition, setFilterTransition] = useState(false);
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: aggregateData, loading: isLoading, error, reload } = useApi<any>(() => apiGetDossierAggregate(dossierId), [dossierId]);

  const rawDossier = aggregateData?.dossier;
  const repr = aggregateData?.representation_data;
  const reprArticles = aggregateData?.representation_articles || [];

  const [editForm, setEditForm] = useState({
    importateur: "",
    nif: "",
    declarant: "",
    type_marchandises: "",
  });

  useEffect(() => {
    if (rawDossier) {
      setEditForm({
        importateur: rawDossier.importateur || "",
        nif: rawDossier.nif || "",
        declarant: rawDossier.declarant || "",
        type_marchandises: rawDossier.type_marchandises || "",
      });
    }
  }, [rawDossier]);

  // Mapping des données relationnelles du backend vers les sections UI
  const typingDirect = rawDossier?.typing_docs_direct?.[0];
  const typingTranship = rawDossier?.typing_docs_transhipment?.[0];
  const itEntry = rawDossier?.it_entries?.[0];

  const dossier = rawDossier ? {
    id: rawDossier.id,
    reference: rawDossier.reference || `RD-${rawDossier.id?.substring(0, 4)}`,
    type: rawDossier.type || "import",
    importateur: rawDossier.importateur || repr?.importateur || "—",
    nif: repr?.nif || rawDossier.nif || "—",
    bureauRepr: repr?.bureau_etranger_nom || rawDossier.bureau_repr || "—",
    operateurSaisie: repr?.operateur?.full_name || rawDossier.secretary?.full_name || rawDossier.creator?.full_name || "Système",
    date: new Date(rawDossier.created_at).toLocaleDateString(),
    status: rawDossier.status,
    typeMarchandises: rawDossier.type_marchandises || "Général",
    quantite: rawDossier.articles?.reduce((acc: number, a: any) => acc + Number(a.quantite ?? 0), 0) || 0,
    poids: rawDossier.articles?.reduce((acc: number, a: any) => acc + Number(a.poids ?? 0), 0) || 0,
    colis: rawDossier.articles?.length || 0,
    dra: rawDossier.dra || repr?.dra_reference || "—",
    t1: rawDossier.t1 || repr?.t1_reference || typingDirect?.t1_reference || "—",
    referenceDouane: rawDossier.reference_douane || "—",
    declarant: rawDossier.declarant || rawDossier.importateur || "—",
    nombreDeclarations: rawDossier.nombre_declarations || 1,
    vehicule: rawDossier.mouvements?.[0]?.vehicule || typingDirect?.vehicule_reference || repr?.immatriculation_avant || "—",
    plaque: rawDossier.mouvements?.[0]?.plaque || repr?.immatriculation_avant || "—",
    provenance: rawDossier.provenance || repr?.pays_provenance_nom || "—",
    destination: rawDossier.destination || "—",
    localisation: rawDossier.localisation || "—",
    barriereEtranger: {
      entree: typingDirect?.date_entree || rawDossier.empty_manifests?.[0]?.created_at?.split('T')[0] || "—",
      traversee: typingTranship ? `${typingTranship.nombre_vehicules} véhicule(s) → ${typingTranship.transhipped_to || '?'}` : "—",
      validation: typingDirect?.status || rawDossier.empty_manifests?.[0]?.facture_statut || "—",
      transport: typingDirect?.vehicule_reference || repr?.immatriculation_avant || "—",
      conteneur: typingDirect?.container_number || repr?.numero_conteneur || "—",
      container20: typingDirect?.container_20 ?? repr?.container_20 ?? 0,
      container40: typingDirect?.container_40 ?? repr?.container_40 ?? 0,
      barriere: typingDirect?.barriere_code || "—",
      office: typingDirect?.office || "—",
      consignee: typingDirect?.consignee || repr?.importateur || "—",
      t1: typingDirect?.t1_reference || repr?.t1_reference || "—",
      paysExport: typingDirect?.country_of_export || repr?.pays_provenance_nom || "—",
    },
    barrierePays: {
      entree: rawDossier.barriere_entries?.[0]?.date_passage?.split('T')[0] || rawDossier.barriere_entries?.[0]?.created_at?.split('T')[0] || "—",
      posteDouanier: rawDossier.barriere_entries?.[0]?.barriere_name || "—",
      validation: rawDossier.barriere_entries?.[0]?.status || "—",
      mouvementsInternes: rawDossier.mouvements?.length || "0",
      observations: rawDossier.barriere_entries?.[0]?.observations || "—",
    },
    donneesRepresentation: {
      bureau: repr?.bureau_etranger_nom ? `${repr.bureau_etranger_code} | ${repr.bureau_etranger_nom}` : "—",
      importateur: repr?.importateur || rawDossier.importateur || "—",
      nif: repr?.nif || "—",
      referenceDra: repr?.dra_reference || rawDossier.dra || "—",
      dateDra: repr?.dra_date || "—",
      referenceT1: repr?.t1_reference || rawDossier.t1 || "—",
      dateT1: repr?.t1_date || "—",
      typeDossier: rawDossier.type_dossier?.libelle || "—",
      devise: repr?.devise || rawDossier.devise || "USD",
      paysProvenance: repr?.pays_provenance_nom || "—",
      bureauSortie: repr?.bureau_sortie_nom ? `${repr.bureau_sortie_code} | ${repr.bureau_sortie_nom}` : "—",
      incoterm: repr?.incoterm || "—",
      conteneur: repr?.numero_conteneur || "—",
      container20: repr?.container_20 ?? 0,
      container40: repr?.container_40 ?? 0,
      fobTotal: repr?.fob_total || 0,
      immatAvant: repr?.immatriculation_avant || "—",
      immatArriere: repr?.immatriculation_arriere || "—",
    },
    itModule: itEntry ? {
      consignee: itEntry.consignee || "—",
      chassis: itEntry.chassis || "—",
      vehiculeMark: itEntry.vehicule_mark || "—",
      manifestYear: itEntry.manifest_year || "—",
      color: itEntry.color || "—",
      reference: itEntry.it_reference || "—",
      status: itEntry.status || "—",
    } : null,
    rapportColisage: {
      colis: rawDossier.colisages?.length || 0,
      denombrement: "—",
      pointage: "—",
      quantites: "—",
    },
    verificationRapport: {
      resultat: rawDossier.validations?.[0]?.status || "—",
      observations: rawDossier.validations?.[0]?.observation || "—",
      anomalies: rawDossier.anomalies?.length ? `${rawDossier.anomalies.length} détectée(s)` : "Aucune",
      commentaires: rawDossier.validations?.[0]?.validation_type || "—",
    },
    sortie: {
      autorisation: rawDossier.mouvements?.find((m: any) => m.operation_type === 'sortie')?.sub_type_operation || "—",
      bonSortie: "—",
      dateSortie: rawDossier.mouvements?.find((m: any) => m.operation_type === 'sortie')?.created_at?.split('T')[0] || "—",
      destinationFinale: rawDossier.destination || "—",
    },
    rapportDechargement: {
      entrepot: rawDossier.colisages?.[0]?.entrepot_name || "—",
      dechargement: "—",
      emplacement: "—",
      statutFinal: rawDossier.colisages?.[0]?.status || "—",
    },
    articles: [
      ...(rawDossier.articles || []),
      ...reprArticles.map((a: any) => ({ ...a, source: 'representation' }))
    ].filter((a, idx, arr) => arr.findIndex(x => x.id === a.id) === idx), // déduplique
    reprArticles: reprArticles,
    hasRepresentationData: !!repr
  } : null;

  // Transition douce entre les filtres
  const handleFilterChange = (key: FilterKey) => {
    if (key === activeFilter) return;
    setFilterTransition(true);
    setTimeout(() => {
      setActiveFilter(key);
      setFilterTransition(false);
    }, 150);
  };

  /* ── État de chargement (doit être avant le check "non trouvé") ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-muted mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Dossier non trouvé (après chargement terminé) ── */
  if (!dossier) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Info className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Dossier non trouvé</h1>
          <p className="text-sm text-muted-foreground">
            Le dossier demandé n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => router.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux dossiers
          </Button>
        </div>
      </div>
    );
  }


  const isAnalysisVisible = user?.role ? ALLOWED_ROLES.includes(user.role) : false;

  const renderActiveFilterContent = () => {
    switch (activeFilter) {
      case "barriereEtranger":
        return (
          <FilterSection
            title="Barrière Étranger"
            subtitle="Suivi du passage à la barrière étrangère"
            icon={Globe}
            iconColor="text-blue-500"
            source="Typing Operator"
          >
            <FilterField label="Barrière" value={dossier.barriereEtranger.barriere} icon="🚧" />
            <FilterField label="Office" value={dossier.barriereEtranger.office} icon="🏢" />
            <FilterField label="Entrée barrière" value={dossier.barriereEtranger.entree} icon="📥" />
            <FilterField label="Traversée (Transbordement)" value={dossier.barriereEtranger.traversee} icon="🔄" />
            <FilterField label="Référence T1" value={dossier.barriereEtranger.t1} icon="📄" />
            <FilterField label="Pays Export" value={dossier.barriereEtranger.paysExport} icon="🌍" />
            <FilterField label="Véhicule" value={dossier.barriereEtranger.transport} icon="🚛" />
            <FilterField label="Conteneur" value={dossier.barriereEtranger.conteneur} icon="📦" />
            <FilterField label="Container 20ft" value={`${dossier.barriereEtranger.container20} unité(s)`} icon="📦" />
            <FilterField label="Container 40ft" value={`${dossier.barriereEtranger.container40} unité(s)`} icon="📦" />
            <FilterField label="Consignee" value={dossier.barriereEtranger.consignee} icon="👤" />
            <FilterField label="Validation" value={dossier.barriereEtranger.validation} icon="✅" />
          </FilterSection>
        );
      case "barrierePays":
        return (
          <FilterSection
            title="Barrière Pays"
            subtitle="Suivi du passage à la barrière du pays"
            icon={Flag}
            iconColor="text-emerald-500"
            source="Brigadier Barrière"
          >
            <FilterField label="Statut Entrée" value={dossier.barrierePays.entree} icon="📥" />
            <FilterField label="Poste Douanier" value={dossier.barrierePays.posteDouanier} icon="🏢" />
            <FilterField label="Validation" value={dossier.barrierePays.validation} icon="✅" />
            <FilterField label="Mouvements Internes" value={String(dossier.barrierePays.mouvementsInternes)} icon="🔄" />
            <FilterField label="Observations" value={dossier.barrierePays.observations} icon="📝" />
          </FilterSection>
        );
      case "donneesRepresentation":
        if (!dossier.hasRepresentationData) {
          return (
            <FilterSection
              title="Données Représentation"
              subtitle="Informations déclarées au bureau de représentation étrangère"
              icon={Building2}
              iconColor="text-violet-500"
              source="Opérateur de Saisie"
            >
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Aucune donnée Bureau de Représentation trouvée pour cette référence DRA ({dossier.dra}).</p>
              </div>
            </FilterSection>
          );
        }
        return (
          <FilterSection
            title="Données Représentation"
            subtitle="Informations déclarées au bureau de représentation étrangère"
            icon={Building2}
            iconColor="text-violet-500"
            source="Opérateur de Saisie"
          >
            <FilterField label="Bureau de Représentation" value={dossier.donneesRepresentation.bureau} icon="🏢" />
            <FilterField label="Importateur déclaré" value={dossier.donneesRepresentation.importateur} icon="👤" />
            <FilterField label="NIF" value={dossier.donneesRepresentation.nif} icon="🆔" />
            <FilterField label="Référence DRA" value={dossier.donneesRepresentation.referenceDra} icon="📄" />
            <FilterField label="Date DRA" value={dossier.donneesRepresentation.dateDra} icon="📅" />
            <FilterField label="Référence T1" value={dossier.donneesRepresentation.referenceT1} icon="📑" />
            <FilterField label="Date T1" value={dossier.donneesRepresentation.dateT1} icon="📅" />
            <FilterField label="Type Dossier" value={dossier.donneesRepresentation.typeDossier} icon="💼" />
            <FilterField label="Devise" value={dossier.donneesRepresentation.devise} icon="💱" />
            <FilterField label="Pays Provenance" value={dossier.donneesRepresentation.paysProvenance} icon="🌍" />
            <FilterField label="Bureau Sortie" value={dossier.donneesRepresentation.bureauSortie} icon="🚪" />
            <FilterField label="Incoterm" value={dossier.donneesRepresentation.incoterm} icon="📋" />
            <FilterField label="Numéro Conteneur" value={dossier.donneesRepresentation.conteneur} icon="📦" />
            <FilterField label="Container 20ft" value={`${dossier.donneesRepresentation.container20} unité(s)`} icon="📦" />
            <FilterField label="Container 40ft" value={`${dossier.donneesRepresentation.container40} unité(s)`} icon="📦" />
            <FilterField label="FOB Total" value={`${dossier.donneesRepresentation.fobTotal?.toLocaleString()} USD`} icon="💰" />
            <FilterField label="Immat. Avant" value={dossier.donneesRepresentation.immatAvant} icon="🚘" />
            <FilterField label="Immat. Arrière" value={dossier.donneesRepresentation.immatArriere} icon="🚘" />
            {dossier.reprArticles && dossier.reprArticles.length > 0 && (
              <div className="col-span-2 mt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Articles déclarés ({dossier.reprArticles.length})</div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Désignation</th>
                        <th className="px-3 py-2 text-left">Position</th>
                        <th className="px-3 py-2 text-right">Qté</th>
                        <th className="px-3 py-2 text-right">Poids (kg)</th>
                        <th className="px-3 py-2 text-right">FOB (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dossier.reprArticles.map((a: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-3 py-2">{a.designation || "—"}</td>
                          <td className="px-3 py-2 font-mono text-xs">{a.position_tarifaire || "—"}</td>
                          <td className="px-3 py-2 text-right">{a.quantite || "—"}</td>
                          <td className="px-3 py-2 text-right">{a.poids ? Number(a.poids).toLocaleString() : "—"}</td>
                          <td className="px-3 py-2 text-right font-semibold text-accent">{a.fob ? Number(a.fob).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </FilterSection>
        );
      case "rapportColisage":
        return (
          <FilterSection
            title="Rapport Colisage"
            subtitle="Détails du colisage et du dénombrement des marchandises"
            icon={ClipboardList}
            iconColor="text-amber-500"
            source="Chef Entrepôt Logistique"
          >
            <FilterField label="Nombre de Colis" value={dossier.rapportColisage.colis} icon="📦" />
            <FilterField label="Dénombrement" value={dossier.rapportColisage.denombrement} icon="🔢" />
            <FilterField label="Pointage" value={dossier.rapportColisage.pointage} icon="✏️" />
            <FilterField label="Quantités" value={dossier.rapportColisage.quantites} icon="📊" />
          </FilterSection>
        );
      case "verification":
        return (
          <FilterSection
            title="Vérification"
            subtitle="Résultat de la vérification douanière et physique"
            icon={CheckCircle2}
            iconColor="text-cyan-500"
            source="Vérificateur"
          >
            <FilterField label="Résultat Vérification" value={dossier.verificationRapport.resultat} icon="⚖️" />
            <FilterField label="Observations" value={dossier.verificationRapport.observations} icon="👁️" />
            <FilterField label="Anomalies" value={dossier.verificationRapport.anomalies} icon="⚠️" />
            <FilterField label="Commentaires" value={dossier.verificationRapport.commentaires} icon="💬" />
          </FilterSection>
        );
      case "sortie":
        return (
          <FilterSection
            title="Autorisation de Sortie"
            subtitle="Détails du bon de sortie et autorisation finale"
            icon={LogOut}
            iconColor="text-orange-500"
            source="Rapport de sortie"
          >
            <FilterField label="Autorisation" value={dossier.sortie.autorisation} icon="🟢" />
            <FilterField label="Bon de Sortie" value={dossier.sortie.bonSortie} icon="🎫" />
            <FilterField label="Date de Sortie" value={dossier.sortie.dateSortie} icon="📅" />
            <FilterField label="Destination Finale" value={dossier.sortie.destinationFinale} icon="📍" />
          </FilterSection>
        );
      case "rapportDechargement":
        return (
          <FilterSection
            title="Rapport de Déchargement"
            subtitle="Informations de déchargement en entrepôt"
            icon={Warehouse}
            iconColor="text-rose-500"
            source="Chef Entrepôt Logistique"
          >
            <FilterField label="Entrepôt" value={dossier.rapportDechargement.entrepot} icon="🏠" />
            <FilterField label="Déchargement" value={dossier.rapportDechargement.dechargement} icon="🏗️" />
            <FilterField label="Emplacement" value={dossier.rapportDechargement.emplacement} icon="📍" />
            <FilterField label="Statut Final" value={dossier.rapportDechargement.statutFinal} icon="🏁" />
          </FilterSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.history.back()}
            className="shrink-0 transition-all duration-200 hover:bg-muted print:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
              DOSSIER RÉFÉRENCE {dossier.reference}
            </h1>
            <p className="text-sm text-muted-foreground">Importateur : {dossier.importateur}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {["inspecteur", "inspecteur_chef", "secretaire_inspecteur", "super_admin"].includes(user?.role || "") && (
            <FormDialog
              trigger={
                <Button variant="default" size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white">
                  <Edit className="h-4 w-4" />
                  Modifier
                </Button>
              }
              title={`Modifier Dossier — ${dossier.reference}`}
              onSubmit={async () => {
                await apiUpdateDossier(dossierId, editForm);
                toast.success("Dossier modifié avec succès");
                reload();
              }}
            >
              <FormGrid>
                <Field label="Importateur">
                  <Input 
                    value={editForm.importateur}
                    onChange={e => setEditForm({ ...editForm, importateur: e.target.value })}
                  />
                </Field>
                <Field label="NIF">
                  <Input 
                    value={editForm.nif}
                    onChange={e => setEditForm({ ...editForm, nif: e.target.value })}
                  />
                </Field>
                <Field label="Déclarant">
                  <Input 
                    value={editForm.declarant}
                    onChange={e => setEditForm({ ...editForm, declarant: e.target.value })}
                  />
                </Field>
                <Field label="Type Marchandises">
                  <Input 
                    value={editForm.type_marchandises}
                    onChange={e => setEditForm({ ...editForm, type_marchandises: e.target.value })}
                  />
                </Field>
              </FormGrid>
            </FormDialog>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimer / PDF
          </Button>
          <StatusBadge status={dossier.status} />
        </div>
        <div className="hidden print:block text-xs font-mono">
          Statut: {dossier.status.toUpperCase()}
        </div>
      </div>

      {/* ── INFORMATIONS DÉTAILLÉES DU DOSSIER (Sert d'entête à l'impression) ── */}
      <div className="grid gap-5 md:grid-cols-2 print:border-b print:pb-6 print:mb-6">
        {/* Informations générales */}
        <InfoSection
          icon={FileText}
          iconColor="text-accent"
          title="Informations générales"
          className="print:border-none print:shadow-none"
        >
          <InfoItem label="Référence dossier" value={dossier.reference} highlight />
          <InfoItem label="Type dossier" value={t(`type.${dossier.type}`)} />
          <InfoItem
            label={dossier.type === "export" ? "Exportateur" : "Importateur"}
            value={
              dossier.type === "export"
                ? dossier.exportateur || dossier.importateur
                : dossier.importateur
            }
          />
          <InfoItem label="NIF" value={dossier.nif} />
          <InfoItem label="Bureau Repr." value={dossier.bureauRepr} />
          <InfoItem label="Opérateur Saisie" value={dossier.operateurSaisie || "Système"} />
          <InfoItem label="Date création" value={dossier.date} />
          <InfoItem label="Statut" value={t(`status.${dossier.status}`)} />
        </InfoSection>

        {/* Informations marchandises (Aussi dans l'entête d'impression) */}
        <InfoSection
          icon={Package}
          iconColor="text-amber-500"
          title="Informations marchandises"
          className="print:border-none print:shadow-none"
        >
          <InfoItem label="Type marchandises" value={dossier.typeMarchandises} />
          <InfoItem label="Quantité" value={`${dossier.quantite}`} />
          <InfoItem label="Poids" value={`${dossier.poids} kg`} />
          <InfoItem label="Colis" value={`${dossier.colis}`} />
        </InfoSection>
      </div>

      {/* ── SECTIONS DÉTAILLÉES (Cachées à l'impression pour focaliser sur les articles) ── */}
      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        {/* Informations douanières */}
        <InfoSection
          icon={ShieldCheck}
          iconColor="text-emerald-500"
          title="Informations douanières"
        >
          <InfoItem label="Référence DRA" value={dossier.dra} highlight />
          <InfoItem label="Référence T1" value={dossier.t1} highlight />
          <InfoItem label="Référence douane" value={dossier.referenceDouane} />
          <InfoItem label="Déclarant" value={dossier.declarant} />
          <InfoItem label="Nombre déclarations" value={`${dossier.nombreDeclarations}`} />
        </InfoSection>

        {/* Informations transport */}
        <InfoSection icon={Truck} iconColor="text-blue-500" title="Informations transport">
          <InfoItem label="Véhicule" value={dossier.vehicule} />
          <InfoItem label="Plaque" value={dossier.plaque} />
          <InfoItem label="Provenance" value={dossier.provenance} />
          <InfoItem label="Destination" value={dossier.destination} />
          <InfoItem label="Localisation" value={dossier.localisation} />
        </InfoSection>

        {/* Détails spécifiques : Trafic */}
        {dossier.type === "trafic" && dossier.trafic && (
          <InfoSection
            icon={Truck}
            iconColor="text-indigo-500"
            title="Détails Trafic Transfrontalier"
          >
            <InfoItem label="Moyen de transport" value={dossier.trafic.moyenTransport} />
            <InfoItem label="Lieu entreposage" value={dossier.trafic.lieuEntreposage} />
            <InfoItem label="Entrepôt" value={dossier.trafic.entrepot} />
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Évaluateurs</div>
              <div className="flex flex-wrap gap-1">
                {dossier.trafic.evaluateurs.map((ev, i) => (
                  <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">
                    {ev}
                  </span>
                ))}
              </div>
            </div>
          </InfoSection>
        )}

        {/* Détails spécifiques : Export */}
        {dossier.type === "export" && dossier.export && (
          <InfoSection icon={FileText} iconColor="text-orange-500" title="Détails Exportation">
            <InfoItem label="Mode de déclaration" value={dossier.export.modeDeclaration} />
            <div className="col-span-2 space-y-3 mt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Documents joints
              </div>
              <div className="grid gap-2">
                {dossier.export.docsJoints.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs"
                  >
                    <span className="font-medium">{doc.designation}</span>
                    <span className="font-mono text-accent">{doc.reference}</span>
                    <span className="text-muted-foreground">{doc.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </InfoSection>
        )}
      </div>

      {/* ── SECTIONS D'ANALYSE DYNAMIQUES (FILTRES ET DÉTAILS COMPLÉMENTAIRES) ── */}
      {isAnalysisVisible && (
        <div className="space-y-4 print:hidden">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sources d'informations & Validation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {FILTERS.map((f) => {
                const Icon = f.icon;
                const isActive = activeFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => handleFilterChange(f.key)}
                    className={`flex flex-col items-start p-3 text-left rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "border-accent bg-accent/5 shadow-sm ring-1 ring-accent/20"
                        : "border-border bg-card text-muted-foreground hover:border-accent/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-accent/10" : "bg-muted"} ${f.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isActive && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isActive ? "text-foreground" : ""}`}>{f.label}</span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-wider opacity-70 flex items-center gap-1">
                      <User className="h-3 w-3" /> {f.source}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`transition-all duration-200 ${
              filterTransition ? "opacity-0 scale-[0.99] translate-y-1" : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            {renderActiveFilterContent()}
          </div>
        </div>
      )}

      {/* ── TABLEAU DES ARTICLES ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5 bg-muted/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Package className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm">Liste des articles liés au dossier</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Nº</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Position</th>
                <th className="px-5 py-3 font-medium text-right">Quantité</th>
                <th className="px-5 py-3 font-medium text-right">Poids (kg)</th>
                <th className="px-5 py-3 font-medium text-right">FOB (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dossier.articles?.map((art, idx) => (
                <tr key={art.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                  <td className="px-5 py-3 font-medium">{art.designation || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">{art.position || art.position_tarifaire || "—"}</td>
                  <td className="px-5 py-3 text-right">{art.quantite || "—"}</td>
                  <td className="px-5 py-3 text-right">{art.poids ? Number(art.poids).toLocaleString() : "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-accent">
                    {art.fob ? Number(art.fob).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {(!dossier.articles || dossier.articles.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground italic">
                    Aucun article spécifié pour ce dossier.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-muted/30 font-bold">
              <tr>
                <td colSpan={3} className="px-5 py-4 text-right uppercase text-xs">
                  Total Général
                </td>
                <td className="px-5 py-4 text-right">
                  {dossier.articles?.reduce((acc, a) => acc + a.quantite, 0) || 0}
                </td>
                <td className="px-5 py-4 text-right">
                  {(dossier.articles?.reduce((acc, a) => acc + a.poids, 0) || 0).toLocaleString()}{" "}
                  kg
                </td>
                <td className="px-5 py-4 text-right text-accent">
                  {(dossier.articles?.reduce((acc, a) => acc + a.fob, 0) || 0).toLocaleString()} USD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="hidden print:block mt-12 pt-8 border-t border-dashed border-border text-center">
        <p className="text-[10px] text-muted-foreground italic">
          “Document généré par le logiciel SGDT, exclusivité de la DGDA - RDC.”
        </p>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .rounded-xl { border-radius: 0 !important; border: none !important; box-shadow: none !important; }
          .shadow-sm, .shadow-md { box-shadow: none !important; }
          .bg-card { background: white !important; }
          .grid { display: grid !important; }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          section, div { page-break-inside: avoid; }
          .mt-6, .mt-4, .space-y-6, .space-y-5 { margin-top: 0.5rem !important; }
          header, nav, .sidebar, .no-print, .print\\:hidden { display: none !important; }
          .border-b { border-bottom: 1px solid #eee !important; }
          .print\\:border-none { border: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 1rem; }
          th, td { border: 1px solid #eee !important; padding: 8px !important; text-align: left; }
          th { background-color: #f8f9fa !important; }
          tfoot { font-weight: bold !important; background-color: #f8f9fa !important; }
          .text-accent { color: #000 !important; }
        }
      `,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   Composants utilitaires
   ══════════════════════════════════════════ */

function InfoSection({
  icon: Icon,
  iconColor,
  title,
  children,
  className = "",
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 ${iconColor}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5">{children}</div>
    </section>
  );
}

function InfoItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 truncate text-sm font-medium ${
          highlight ? "font-mono text-accent" : ""
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  source,
  children,
}: {
  title: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  source?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-muted/30 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-card shadow-sm border border-border ${iconColor}`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {source && (
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[11px] font-medium text-accent">
            📡 Source : {source}
          </span>
        )}
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function FilterField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="group rounded-lg border border-border/60 bg-gradient-to-br from-muted/20 to-transparent p-3.5 transition-all duration-200 hover:border-accent/20 hover:shadow-sm">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-base">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{value || "—"}</div>
        </div>
      </div>
    </div>
  );
}
