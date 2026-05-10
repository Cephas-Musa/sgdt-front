import { useState } from "react";
import { createFileRoute, useNavigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import {
  Search, FolderKanban, Calendar, Hash, Loader2,
  FileText, Truck, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { DOSSIERS, type Dossier } from "@/lib/mock";
import { toast } from "sonner";
import {
  DirectForm, TransbordementForm, VracForm, LotForm,
  PetrolierForm, DechargementForm, TraficForm, ExportForm, AutresForm, PaiementModule,
} from "@/dashboards/inspecteur/DossierForms";

export const Route = createFileRoute("/app/dossiers")({
  component: DossiersLayout,
});

/* ── Layout : affiche soit la liste, soit la page enfant (détail) ── */
function DossiersLayout() {
  const matchRoute = useMatchRoute();
  const isChildActive = matchRoute({ to: "/app/dossiers/$dossierId", fuzzy: true });

  // Si une route enfant est active (ex: /app/dossiers/D-0001), on rend l'Outlet
  if (isChildActive) {
    return <Outlet />;
  }

  // Sinon, on affiche la page liste
  return <DossiersPage />;
}

/* ── Rôles autorisés selon le cahier de charges ── */
const ALLOWED_ROLES = [
  "directeur",              // Directeur Général
  "directeur_provincial",   // Directeur Provincial
  "agent_controle",         // Agent de Cellule de Contrôle
  "inspecteur_chef",        // Inspecteur
] as const;

/* ── Validation : on vérifie que la partie après RD- contient 1-4 chiffres ── */
function isValidRefNumber(val: string): boolean {
  if (!val) return true;
  return /^\d{1,4}$/.test(val);
}

function DossiersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  // L'utilisateur ne saisit que la partie numérique (le préfixe RD- est fixe)
  const [searchRefNumber, setSearchRefNumber] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [activeReference, setActiveReference] = useState("");
  const [activeDate, setActiveDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const refError = searchRefNumber.length > 0 && !isValidRefNumber(searchRefNumber);
  const isAllowed = ALLOWED_ROLES.includes(user?.role as any);

  /* ── Filtrage des dossiers ── */
  const getFilteredDossiers = (): Dossier[] => {
    let dossiers = [...DOSSIERS];

    // Filtrage provincial pour le Directeur Provincial
    if (user?.role === "directeur_provincial") {
      const userProvince = "NORD-KIVU"; // En prod : user.province
      dossiers = dossiers.filter((d) => d.province === userProvince);
    }

    // Filtrage par référence complète (RD-XXXX)
    if (activeReference) {
      dossiers = dossiers.filter((d) =>
        d.reference.toLowerCase().includes(activeReference.toLowerCase())
      );
    }
    if (activeDate) {
      dossiers = dossiers.filter((d) => d.date.includes(activeDate));
    }

    return dossiers;
  };

  const filteredDossiers = getFilteredDossiers();

  /* ── Recherche avec état de chargement ── */
  const handleSearch = () => {
    if (refError) {
      toast.error("Entrez un numéro valide (1 à 4 chiffres) après RD-");
      return;
    }
    setIsLoading(true);
    setHasSearched(true);

    // Construire la référence complète RD-XXXX
    const fullRef = searchRefNumber.trim() ? `RD-${searchRefNumber.trim()}` : "";

    // Simuler un état de chargement (en prod : appel API)
    setTimeout(() => {
      setActiveReference(fullRef);
      setActiveDate(searchDate.trim());
      setIsLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setSearchRefNumber("");
    setSearchDate("");
    setActiveReference("");
    setActiveDate("");
    setHasSearched(false);
  };

  /* ── Accès restreint ── */
  if (!isAllowed) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("nav.dossiers")}
          description="Accès réservé aux directeurs, inspecteurs et agents de contrôle."
        />
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive">Accès restreint</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous n'avez pas les droits nécessaires pour consulter le module DOSSIERS.
            Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
      </div>
    );
  }

  /* ── Colonnes du tableau ── */
  const columns: Column<Dossier>[] = [
    {
      key: "id",
      header: "Nº",
      render: (_, index) => (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
          {(index ?? 0) + 1}
        </span>
      ),
    },
    {
      key: "importateur",
      header: "Importateur",
      render: (r) => (
        <div>
          <div className="font-medium">{r.importateur}</div>
          <div className="text-xs text-muted-foreground">{r.declarant}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type de dossier",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-xs font-medium capitalize">
          <FileText className="h-3 w-3 text-muted-foreground" />
          {t(`type.${r.type}`)}
        </span>
      ),
    },
    {
      key: "vehicule",
      header: "Véhicule",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{r.vehicule}</span>
        </div>
      ),
    },
    {
      key: "dra",
      header: "Référence DRA",
      render: (r) => <span className="font-mono text-xs font-medium text-accent">{r.dra}</span>,
    },
    {
      key: "t1",
      header: "Référence T1",
      render: (r) => <span className="font-mono text-xs">{r.t1}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r: Dossier) => (
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 transition-all duration-200"
          onClick={(event) => {
            event.stopPropagation();
            navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: r.id } });
          }}
        >
          AFFICHER
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.dossiers")}
        description="Consultation, recherche et suivi des dossiers douaniers."
      />

      {/* ── CRÉATION DE DOSSIERS (Inspecteur uniquement) ── */}
      {user?.role === "inspecteur_chef" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
              Créer un nouveau dossier
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <DirectForm />
            <TransbordementForm />
            <VracForm />
            <LotForm />
            <PetrolierForm />
            <DechargementForm />
            <TraficForm />
            <ExportForm />
            <AutresForm />
          </div>
        </div>
      )}

      {/* ── SECTION RECHERCHE ── */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Search className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Recherche de dossier
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          {/* Référence dossier — préfixe RD- fixe */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Hash className="h-3 w-3" />
              Référence dossier
            </label>
            <div className={`flex items-center rounded-md border transition-colors ${refError ? "border-destructive ring-destructive/20 ring-2" : "border-input focus-within:ring-accent/20 focus-within:ring-2 focus-within:border-accent/40"}`}>
              <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/60 px-3 text-sm font-semibold text-foreground select-none">
                RD-
              </span>
              <input
                id="search-reference"
                type="text"
                inputMode="numeric"
                value={searchRefNumber}
                onChange={(e) => {
                  // N'accepter que des chiffres (max 4)
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setSearchRefNumber(val);
                }}
                placeholder="0001"
                className="h-9 w-full flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            {refError && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                Entrez 1 à 4 chiffres après RD-
              </p>
            )}
          </div>

          {/* Année / Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Année / Date
            </label>
            <Input
              id="search-date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              placeholder="2025 ou 2025-10-01"
              className="focus:ring-accent/20 focus:ring-2 focus:border-accent/40 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Boutons */}
          <div className="flex items-end gap-2">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="gap-2 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 transition-all duration-200 h-9"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Rechercher
            </Button>
            {hasSearched && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-9 transition-all duration-200"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── BARRE DE RÉSULTATS ── */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-accent" />
          <span className="font-medium">{filteredDossiers.length} dossier{filteredDossiers.length !== 1 ? "s" : ""} trouvé{filteredDossiers.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>Réf : <strong className="text-foreground">{activeReference || "Toutes"}</strong></span>
          <span className="text-border">|</span>
          <span>Date : <strong className="text-foreground">{activeDate || "Toutes"}</strong></span>
          {user?.role === "directeur_provincial" && (
            <>
              <span className="text-border">|</span>
              <span>Province : <strong className="text-foreground">NORD-KIVU</strong></span>
            </>
          )}
        </div>
      </div>

      {/* ── TABLEAU / CHARGEMENT ── */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm">Recherche en cours…</p>
          </div>
        </div>
      ) : (
        <DataTable
          data={filteredDossiers}
          columns={columns}
          searchable={false}
          empty="Aucun dossier ne correspond aux critères de recherche."
          onRowClick={(dossier) =>
            navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: dossier.id } })
          }
        />
      )}
    </div>
  );
}
