import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft, Loader2,
  FileText, ShieldCheck, Truck, Package,
  Globe, Flag, Building2, ClipboardList,
  CheckCircle2, LogOut, Warehouse,
  ChevronRight, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { DOSSIERS, type Dossier } from "@/lib/mock";

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
  { key: "barriereEtranger", label: "Barrière étranger", icon: Globe, color: "text-blue-500", source: "Typing Operator" },
  { key: "barrierePays", label: "Barrière pays", icon: Flag, color: "text-emerald-500", source: "Brigadier Barrière" },
  { key: "donneesRepresentation", label: "Données représentation", icon: Building2, color: "text-violet-500", source: "Opérateur de Saisie" },
  { key: "rapportColisage", label: "Rapport colisage", icon: ClipboardList, color: "text-amber-500", source: "Chef Entrepôt Logistique" },
  { key: "verification", label: "Vérification", icon: CheckCircle2, color: "text-cyan-500", source: "Vérificateur" },
  { key: "sortie", label: "Sortie", icon: LogOut, color: "text-orange-500", source: "Rapport de sortie" },
  { key: "rapportDechargement", label: "Rapport de déchargement", icon: Warehouse, color: "text-rose-500", source: "Chef Entrepôt Logistique" },
];

/* ── Rôles autorisés ── */
const ALLOWED_ROLES = ["directeur", "directeur_provincial", "agent_controle", "inspecteur_chef"];

function DossierDetailPage() {
  const { dossierId } = useParams({ from: "/app/dossiers/$dossierId" });
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("barriereEtranger");
  const [isLoading, setIsLoading] = useState(true);
  const [filterTransition, setFilterTransition] = useState(false);
  const { t } = useI18n();
  const { user } = useAuth();

  const dossier = DOSSIERS.find((d) => d.id === dossierId);

  // Simuler un état de chargement
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Transition douce entre les filtres
  const handleFilterChange = (key: FilterKey) => {
    if (key === activeFilter) return;
    setFilterTransition(true);
    setTimeout(() => {
      setActiveFilter(key);
      setFilterTransition(false);
    }, 150);
  };

  /* ── Dossier non trouvé ── */
  if (!dossier) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Info className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Dossier non trouvé</h1>
          <p className="text-sm text-muted-foreground">Le dossier demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux dossiers
          </Button>
        </div>
      </div>
    );
  }

  /* ── État de chargement ── */
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

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.history.back()}
            className="shrink-0 transition-all duration-200 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
              DOSSIER RÉFÉRENCE {dossier.reference}
            </h1>
            <p className="text-sm text-muted-foreground">
              Importateur : {dossier.importateur}
            </p>
          </div>
        </div>
        <StatusBadge status={dossier.status} />
      </div>

      {/* ── INFORMATIONS DÉTAILLÉES DU DOSSIER ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Informations générales */}
        <InfoSection
          icon={FileText}
          iconColor="text-accent"
          title="Informations générales"
        >
          <InfoItem label="Référence dossier" value={dossier.reference} highlight />
          <InfoItem label="Type dossier" value={t(`type.${dossier.type}`)} />
          <InfoItem label={dossier.type === "export" ? "Exportateur" : "Importateur"} value={dossier.type === "export" ? (dossier.exportateur || dossier.importateur) : dossier.importateur} />
          {dossier.type === "export" && <InfoItem label="Importateur" value={dossier.importateur} />}
          <InfoItem label="Véhicule" value={dossier.vehicule} />
          <InfoItem label="Date création" value={dossier.date} />
          <InfoItem label="Statut" value={t(`status.${dossier.status}`)} />
        </InfoSection>

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
        <InfoSection
          icon={Truck}
          iconColor="text-blue-500"
          title="Informations transport"
        >
          <InfoItem label="Véhicule" value={dossier.vehicule} />
          <InfoItem label="Plaque" value={dossier.plaque} />
          <InfoItem label="Provenance" value={dossier.provenance} />
          <InfoItem label="Destination" value={dossier.destination} />
          <InfoItem label="Localisation" value={dossier.localisation} />
        </InfoSection>

        {/* Informations marchandises */}
        <InfoSection
          icon={Package}
          iconColor="text-amber-500"
          title="Informations marchandises"
        >
          <InfoItem label="Type marchandises" value={dossier.typeMarchandises} />
          <InfoItem label="Quantité" value={`${dossier.quantite}`} />
          <InfoItem label="Poids" value={`${dossier.poids} kg`} />
          <InfoItem label="Colis" value={`${dossier.colis}`} />
        </InfoSection>

        {/* Détails spécifiques : Trafic */}
        {dossier.type === "trafic" && dossier.trafic && (
          <InfoSection icon={Truck} iconColor="text-indigo-500" title="Détails Trafic Transfrontalier">
            <InfoItem label="Moyen de transport" value={dossier.trafic.moyenTransport} />
            <InfoItem label="Lieu entreposage" value={dossier.trafic.lieuEntreposage} />
            <InfoItem label="Entrepôt" value={dossier.trafic.entrepot} />
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Évaluateurs</div>
              <div className="flex flex-wrap gap-1">
                {dossier.trafic.evaluateurs.map((ev, i) => (
                  <span key={i} className="bg-muted px-2 py-0.5 rounded text-xs">{ev}</span>
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
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documents joints</div>
              <div className="grid gap-2">
                {dossier.export.docsJoints.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/40 text-xs">
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

      {/* ── SECTION FILTRES D'ANALYSE ── */}
      <div className="space-y-5">
        {/* Barre de filtres */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
              <ClipboardList className="h-3.5 w-3.5 text-accent" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              Filtres d'analyse
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  className={`
                    group relative flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium
                    transition-all duration-200 ease-out
                    ${isActive
                      ? "border-accent/40 bg-accent/10 text-accent shadow-sm shadow-accent/10"
                      : "border-border bg-card text-muted-foreground hover:border-accent/20 hover:bg-accent/5 hover:text-foreground"
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? filter.color : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{filter.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 text-accent/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu du filtre actif */}
        <div
          className={`transition-all duration-200 ease-out ${filterTransition ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
            }`}
        >
          {activeFilter === "barriereEtranger" && (
            <FilterSection
              title="Barrière étranger"
              subtitle="Entrée du dossier au niveau frontière étrangère"
              icon={Globe}
              iconColor="text-blue-500"
              source="Typing Operator"
            >
              <FilterField label="Entrée frontière" value={dossier.barriereEtranger.entree} icon="🌍" />
              <FilterField label="Données de traversée" value={dossier.barriereEtranger.traversee} icon="🚧" />
              <FilterField label="Validation étrangère" value={dossier.barriereEtranger.validation} icon="✅" />
              <FilterField label="Informations transport" value={dossier.barriereEtranger.transport} icon="🚛" />
            </FilterSection>
          )}

          {activeFilter === "barrierePays" && (
            <FilterSection
              title="Barrière pays"
              subtitle="Entrée au niveau frontière nationale"
              icon={Flag}
              iconColor="text-emerald-500"
              source="Brigadier Barrière"
            >
              <FilterField label="Entrée frontière nationale" value={dossier.barrierePays.entree} icon="🏛️" />
              <FilterField label="Poste douanier" value={dossier.barrierePays.posteDouanier} icon="🏢" />
              <FilterField label="Validation entrée" value={dossier.barrierePays.validation} icon="✅" />
              <FilterField label="Mouvements internes" value={dossier.barrierePays.mouvementsInternes} icon="🔄" />
            </FilterSection>
          )}

          {activeFilter === "donneesRepresentation" && (
            <FilterSection
              title="Données représentation"
              subtitle="Informations créées au bureau de représentation"
              icon={Building2}
              iconColor="text-violet-500"
              source="Opérateur de Saisie"
            >
              <FilterField label="Bureau de représentation" value={dossier.donneesRepresentation.bureau} icon="🏛️" />
              <FilterField label="Importateur" value={dossier.donneesRepresentation.importateur} icon="👤" />
              <FilterField label="Référence DRA" value={dossier.donneesRepresentation.referenceDra} icon="📋" />
              <FilterField label="Référence T1" value={dossier.donneesRepresentation.referenceT1} icon="📄" />
              <FilterField label="Type de dossier" value={dossier.donneesRepresentation.typeDossier} icon="📁" />
            </FilterSection>
          )}

          {activeFilter === "rapportColisage" && (
            <FilterSection
              title="Rapport colisage"
              subtitle="Détails des colis et rapports de pointage"
              icon={ClipboardList}
              iconColor="text-amber-500"
              source="Chef Entrepôt Logistique"
            >
              <FilterField label="Détails colis" value={`${dossier.rapportColisage.colis} colis`} icon="📦" />
              <FilterField label="Dénombrement" value={dossier.rapportColisage.denombrement} icon="🔢" />
              <FilterField label="Rapport de pointage" value={dossier.rapportColisage.pointage} icon="📊" />
              <FilterField label="Quantités" value={dossier.rapportColisage.quantites} icon="📐" />
            </FilterSection>
          )}

          {activeFilter === "verification" && (
            <FilterSection
              title="Vérification"
              subtitle="Résultats de vérification et observations"
              icon={CheckCircle2}
              iconColor="text-cyan-500"
              source="Vérificateur"
            >
              <FilterField label="Résultat vérification" value={dossier.verificationRapport.resultat} icon="✅" />
              <FilterField label="Observations" value={dossier.verificationRapport.observations} icon="👁️" />
              <FilterField label="Anomalies" value={dossier.verificationRapport.anomalies} icon="⚠️" />
              <FilterField label="Commentaires" value={dossier.verificationRapport.commentaires} icon="💬" />
            </FilterSection>
          )}

          {activeFilter === "sortie" && (
            <FilterSection
              title="Sortie"
              subtitle="Autorisation et informations de sortie"
              icon={LogOut}
              iconColor="text-orange-500"
              source="Rapport de sortie"
            >
              <FilterField label="Autorisation sortie" value={dossier.sortie.autorisation} icon="🔓" />
              <FilterField label="Bon de sortie" value={dossier.sortie.bonSortie} icon="📃" />
              <FilterField label="Date sortie" value={dossier.sortie.dateSortie} icon="📅" />
              <FilterField label="Destination finale" value={dossier.sortie.destinationFinale} icon="📍" />
            </FilterSection>
          )}

          {activeFilter === "rapportDechargement" && (
            <FilterSection
              title="Rapport de déchargement"
              subtitle="Informations d'entrepôt et statut final"
              icon={Warehouse}
              iconColor="text-rose-500"
              source="Chef Entrepôt Logistique"
            >
              <FilterField label="Entrepôt" value={dossier.rapportDechargement.entrepot} icon="🏭" />
              <FilterField label="Déchargement" value={dossier.rapportDechargement.dechargement} icon="📥" />
              <FilterField label="Emplacement" value={dossier.rapportDechargement.emplacement} icon="📌" />
              <FilterField label="Statut final" value={dossier.rapportDechargement.statutFinal} icon="🏁" />
            </FilterSection>
          )}
        </div>
      </div>
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
}: {
  icon: any;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 ${iconColor}`}>
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
        className={`mt-0.5 truncate text-sm font-medium ${highlight ? "font-mono text-accent" : ""
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
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-card shadow-sm border border-border ${iconColor}`}>
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
