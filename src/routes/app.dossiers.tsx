import { useState } from "react";
import { createFileRoute, useNavigate, Outlet, useMatchRoute } from "@tanstack/react-router";
import {
  Search,
  FolderKanban,
  Calendar,
  Hash,
  Loader2,
  FileText,
  Truck,
  ArrowRight,
  Building2,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useApi, apiGetDossiers, apiGetBureauxRepresentation, apiGetAlertes, apiGetTypesDossiers, apiUpdateDossier, type ApiError } from "@/lib/api";
import type { Dossier, DossierStatus, DossierType } from "@/lib/mock";
import { toast } from "sonner";
import {
  DirectForm,
  TransbordementForm,
  VracForm,
  LotForm,
  PetrolierForm,
  DechargementForm,
  TraficForm,
  ExportForm,
  AutresForm,
  PaiementModule,
  CommonFields,
  DynamicDeclarations,
  DynamicTitres,
  LocalisationField,
  useWarehouses,
} from "@/dashboards/inspecteur/DossierForms";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";

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
  "directeur", // Directeur Général
  "directeur_provincial", // Directeur Provincial
  "agent_controle", // Agent de Cellule de Contrôle
  "inspecteur_chef", // Inspecteur
  "secretaire_inspecteur", // Secrétaire Inspecteur
  "chef_bureau_repr", // Chef Bureau Représentation
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

  // Filtres
  const [searchRefNumber, setSearchRefNumber] = useState("");
  const [searchDra, setSearchDra] = useState("");
  const [searchBureau, setSearchBureau] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activeReference, setActiveReference] = useState("");
  const [activeDra, setActiveDra] = useState("");
  const [activeBureau, setActiveBureau] = useState("");
  const [activeStartDate, setActiveStartDate] = useState("");
  const [activeEndDate, setActiveEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const refError = searchRefNumber.length > 0 && !isValidRefNumber(searchRefNumber);
  const isAllowed = user?.role ? (ALLOWED_ROLES as readonly string[]).includes(user.role) : false;

  /* ── Données API ── */
  const { data: rawDossiers, loading: dossiersLoading } = useApi(
    () => apiGetDossiers(),
    []
  );
  const { data: rawBureauxRepr } = useApi(apiGetBureauxRepresentation);
  const { data: rawAlertes } = useApi(apiGetAlertes);

  type BureauRepr = { id: number; code: string; denomination: string };
  const allDossiers = (rawDossiers as Dossier[] ?? []);
  const bureauxRepr = (rawBureauxRepr as BureauRepr[] ?? []);
  const alertes = (rawAlertes as Array<{ type: string; reference?: string; code_bureau?: string }> ?? []);

  /* ── Filtrage des dossiers ── */
  const getFilteredDossiers = (): Dossier[] => {
    let dossiers = [...allDossiers];

    // Filtrage provincial pour le Directeur Provincial
    if (user?.role === "directeur_provincial" && user?.province) {
      dossiers = dossiers.filter((d) => d.province === user.province);
    }

    // Filtrage par référence complète (RD-XXXX)
    if (activeReference) {
      dossiers = dossiers.filter((d) =>
        d.reference.toLowerCase().includes(activeReference.toLowerCase()),
      );
    }
    // Filtrage par DRA
    if (activeDra) {
      dossiers = dossiers.filter((d) => d.dra.toLowerCase().includes(activeDra.toLowerCase()));
    }
    // Filtrage par Bureau
    if (activeBureau) {
      dossiers = dossiers.filter((d) => d.bureauRepr === activeBureau);
    }
    // Filtrage par intervalle de dates
    if (activeStartDate) {
      dossiers = dossiers.filter((d) => d.date >= activeStartDate);
    }
    if (activeEndDate) {
      dossiers = dossiers.filter((d) => d.date <= activeEndDate);
    }

    // On exclut de la liste principale les dossiers créés par le bureau de représentation
    // (ils ont leur propre onglet dédié)
    dossiers = dossiers.filter((d) => {
      const roleCreator = d.creator?.role;
      return roleCreator !== "operateur_saisie" && roleCreator !== "chef_bureau_repr";
    });

    return dossiers;
  };

  const filteredDossiers = getFilteredDossiers();

  /* ── Recherche avec état de chargement ── */
  const handleSearch = () => {
    if (refError) {
      toast.error("Entrez un numéro valide (1 à 4 chiffres) après RD-");
      return;
    }
    setIsLoading(false);
    setActiveReference(searchRefNumber.trim() ? `RD-${searchRefNumber.trim()}` : "");
    setActiveDra(searchDra.trim());
    setActiveBureau(searchBureau);
    setActiveStartDate(startDate);
    setActiveEndDate(endDate);
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchRefNumber("");
    setSearchDra("");
    setSearchBureau("");
    setStartDate("");
    setEndDate("");
    setActiveReference("");
    setActiveDra("");
    setActiveBureau("");
    setActiveStartDate("");
    setActiveEndDate("");
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
            Vous n'avez pas les droits nécessaires pour consulter le module DOSSIERS. Contactez
            votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
      </div>
    );
  }

  /* ── Vue dédiée : Secrétaire Inspecteur ── */
  if (user?.role === "secretaire_inspecteur") {
    return <SecretaireDossiersView />;
  }

  /* ── Vue dédiée : Chef Bureau Représentation ── */
  if (user?.role === "chef_bureau_repr") {
    return <ChefReprDossiersView />;
  }

  /* ── Vue dédiée : Inspecteur ── */
  if (user?.role === "inspecteur_chef" || user?.role === "inspecteur") {
    return <InspecteurDossiersView />;
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
        <div className="min-w-[120px]">
          <div className="font-semibold text-xs">{r.importateur}</div>
          <div className="text-[10px] text-muted-foreground uppercase">{r.declarant}</div>
        </div>
      ),
    },
    {
      key: "nif",
      header: "NIF",
      render: (r) => <span className="font-mono text-[10px]">{r.nif}</span>,
    },
    {
      key: "dra",
      header: "Référence DRA",
      render: (r) => <span className="font-mono text-xs font-bold text-accent">{r.dra}</span>,
    },
    {
      key: "reference",
      header: "Appel",
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.reference}</span>,
    },
    {
      key: "vehicule",
      header: "Véhicule",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{r.vehicule}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{r.plaque}</span>
        </div>
      ),
    },
    {
      key: "colis",
      header: "Nombre colis",
      render: (r) => <span className="font-medium">{r.colis}</span>,
    },
    {
      key: "status",
      header: "Statut",
      render: (r) => {
        const hasAlert = alertes.some(
          (a) => a.reference?.includes(r.reference) || a.code_bureau === r.bureauRepr,
        );
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={r.status} />
            {hasAlert && (
              <span
                className="flex h-2 w-2 rounded-full bg-destructive animate-pulse"
                title="Alerte active"
              />
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Afficher",
      render: (r: Dossier) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-accent/20 text-accent hover:bg-accent hover:text-white transition-all duration-200"
          onClick={(event) => {
            event.stopPropagation();
            navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: String(r.id) } });
          }}
        >
          Afficher
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.dossiers")}
        description={user?.role === 'directeur_provincial' ? "Supervision provinciale des dossiers douaniers." : "Consultation, recherche et suivi des dossiers douaniers."}
      />

      {/* Les dossiers de l'inspecteur sont gérés par la vue InspecteurDossiersView */}

      {/* ── SECTION RECHERCHE / FILTRES PROVINCIAUX ── */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Search className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            {user?.role === 'directeur_provincial' ? "Filtres de supervision provinciale" : "Recherche de dossier"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Référence dossier */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Hash className="h-3 w-3" />
              Référence dossier
            </label>
            <div
              className={`flex items-center rounded-md border transition-colors ${refError ? "border-destructive ring-destructive/20 ring-2" : "border-input focus-within:ring-accent/20 focus-within:ring-2 focus-within:border-accent/40"}`}
            >
              <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/60 px-3 text-sm font-semibold text-foreground select-none">
                RD-
              </span>
              <input
                id="search-reference"
                type="text"
                inputMode="numeric"
                value={searchRefNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setSearchRefNumber(val);
                }}
                placeholder="0001"
                className="h-9 w-full flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          {/* Bureau Douanier */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3 w-3" />
              Bureau Douanier
            </label>
            <select
              value={searchBureau}
              onChange={(e) => setSearchBureau(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Tous les bureaux</option>
              {bureauxRepr.map((b) => (
                <option key={b.id} value={b.denomination}>
                  {b.denomination}
                </option>
              ))}
            </select>
          </div>

          {/* Date Début */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Date Début
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Date Fin */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Date Fin
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Boutons */}
          <div className="flex items-end gap-2 lg:col-span-1">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full gap-2 bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 transition-all duration-200 h-9 font-bold uppercase"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Appliquer
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={handleReset} className="h-9">
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── BARRE DE RÉSULTATS ── */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-accent" />
          <span className="font-bold uppercase text-[11px] tracking-tight text-muted-foreground">
            {filteredDossiers.length} dossier{filteredDossiers.length !== 1 ? "s" : ""} rattaché{filteredDossiers.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-3 text-[10px] font-bold uppercase text-muted-foreground">
          <span>Bureau : <strong className="text-foreground">{activeBureau || "TOUS"}</strong></span>
          <span className="text-border">|</span>
          <span>Période : <strong className="text-foreground">{activeStartDate || "Début"} → {activeEndDate || "Maintenant"}</strong></span>
        </div>
      </div>

      {/* ── TABLEAU / CHARGEMENT ── */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm">Mise à jour des données provinciales…</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[10px] font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-4">Bureau</th>
                <th className="px-4 py-4">Dossier</th>
                <th className="px-4 py-4">Importateur</th>
                <th className="px-4 py-4 text-center">Véhicules</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Montant</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDossiers.slice(0, 20).map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4"><Badge variant="outline" className="text-[10px] font-bold text-accent">{d.bureauRepr || "BOMA"}</Badge></td>
                  <td className="px-4 py-4 font-mono text-xs font-bold">{d.reference}</td>
                  <td className="px-4 py-4 font-medium">{d.importateur}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-muted text-[10px] font-bold">12</span>
                  </td>
                  <td className="px-4 py-4 text-xs">{d.date}</td>
                  <td className="px-4 py-4 font-bold text-success">${d.montant}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {d.created_by === user?.id && (
                        <EditDossierDialog dossier={d} onSuccess={reload} />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: String(d.id) } })}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   Vue dédiée Secrétaire Inspecteur — Dossiers
   Sections 1→4 du cahier des charges
════════════════════════════════════════════════════════════ */
function SecretaireDossiersView() {
  const { t } = useI18n();
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const allDossiers = (rawDossiers || []) as Dossier[];

  /* ── Recherche ── */
  const [searchRD, setSearchRD] = useState("");
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [results, setResults] = useState<Dossier[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ── Formulaire "Ajouter information" par dossier ── */
  const [infoTarget, setInfoTarget] = useState<Dossier | null>(null);
  const [infoRefTitre, setInfoRefTitre] = useState("");
  const [infoDateTitre, setInfoDateTitre] = useState("");
  const [infoTA, setInfoTA] = useState("");
  const [infoDateTA, setInfoDateTA] = useState("");
  const [infoImportateur, setInfoImportateur] = useState("");

  const handleSearch = () => {
    setIsLoading(true);
    setSearched(true);
    setTimeout(() => {
      const rd = searchRD.trim().toUpperCase();
      const year = searchYear.trim();
      const found = allDossiers.filter((d) => {
        const matchRD = rd ? d.reference.toUpperCase().includes(rd) : true;
        const matchYear = year ? d.date.startsWith(year) : true;
        return matchRD && matchYear;
      });
      setResults(found);
      setIsLoading(false);
      if (found.length === 0) toast.error("Aucun dossier trouvé.");
      else toast.success(`${found.length} dossier(s) trouvé(s).`);
    }, 500);
  };

  const openInfoForm = (d: Dossier) => {
    setInfoTarget(d);
    setInfoRefTitre("");
    setInfoDateTitre("");
    setInfoTA("");
    setInfoDateTA("");
    setInfoImportateur(d.importateur);
  };

  const handleAddInfo = () => {
    toast.success(`Informations ajoutées pour ${infoTarget?.reference} ✓`);
    setInfoTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("nav.dossiers")}
        description="Recherche et complétion des informations de dossier."
      />

      {/* ── RECHERCHE ── */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Search className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Recherche de dossier
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Référence dossier (RD)
            </label>
            <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent/40">
              <span className="flex h-9 items-center rounded-l-md border-r border-input bg-muted/60 px-3 text-sm font-semibold select-none">
                RD-
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={searchRD.replace(/^RD-/i, "")}
                onChange={(e) => setSearchRD("RD-" + e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0001"
                className="h-9 w-32 flex-1 rounded-r-md bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/50"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Année
            </label>
            <Input
              type="number"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              placeholder="2026"
              className="w-28 h-9"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="gap-2 h-9">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Rechercher
          </Button>
          {searched && (
            <Button variant="outline" className="h-9" onClick={() => { setResults([]); setSearched(false); setSearchRD(""); setSearchYear(new Date().getFullYear().toString()); }}>
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* ── FORMULAIRE AJOUTER INFORMATION (inline panel) ── */}
      {infoTarget && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-accent" />
              Ajouter information — <span className="font-mono text-accent">{infoTarget.reference}</span>
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setInfoTarget(null)} className="h-7 w-7 p-0 text-muted-foreground">✕</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Référence titre</label>
              <Input placeholder="T1-XXXXX" value={infoRefTitre} onChange={(e) => setInfoRefTitre(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date (titre)</label>
              <Input type="date" value={infoDateTitre} onChange={(e) => setInfoDateTitre(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">T1</label>
              <Input placeholder="T1-001" value={infoTA} onChange={(e) => setInfoTA(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date (T1)</label>
              <Input type="date" value={infoDateTA} onChange={(e) => setInfoDateTA(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Importateur</label>
              <Input value={infoImportateur} onChange={(e) => setInfoImportateur(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleAddInfo} className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Ajouter
            </Button>
            <Button variant="outline" onClick={() => setInfoTarget(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* ── TABLEAU RÉSULTATS ── */}
      {searched && !isLoading && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <FolderKanban className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">{results.length} dossier(s) trouvé(s)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2 w-10">N°</th>
                  <th className="px-3 py-2">Importateur</th>
                  <th className="px-3 py-2">Référence dossier</th>
                  <th className="px-3 py-2 text-center">Nombre titre</th>
                  <th className="px-3 py-2">Référence titre</th>
                  <th className="px-3 py-2 text-center">Nombre déclarations</th>
                  <th className="px-3 py-2">Type dossier</th>
                  <th className="px-3 py-2 text-center">Direct</th>
                  <th className="px-3 py-2">Ajouter information</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                      Aucun dossier ne correspond aux critères.
                    </td>
                  </tr>
                ) : (
                  results.map((d, idx) => (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-semibold text-accent">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium text-xs">{d.importateur}</td>
                      <td className="px-3 py-2 font-mono text-xs font-bold text-accent">{d.reference}</td>
                      <td className="px-3 py-2 text-center text-xs">{d.nbTitres ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.t1 || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs">{d.nbDeclarations ?? d.nombreDeclarations}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{d.type}</span>
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {d.type === "direct" ? (
                          <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-xs">Oui</span>
                        ) : (
                          <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs">Non</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 text-xs border-accent/30 text-accent hover:bg-accent hover:text-white"
                          onClick={() => openInfoForm(d)}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          Ajouter info
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Vue dédiée Chef Bureau Représentation — Dossiers
   (Sections 1.1 à 1.6 du cahier des charges)
   ════════════════════════════════════════════════════════════ */
function ChefReprDossiersView() {
  const { user } = useAuth();
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const allDossiers = (rawDossiers || []) as Dossier[];
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [hasSearched, setHasSearched] = useState(false);

  const filteredDossiers = allDossiers.filter(d => {
    const matchesRef = d.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = (!dateRange.start || d.date >= dateRange.start) && (!dateRange.end || d.date <= dateRange.end);
    return matchesRef && matchesDate;
  });

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title="Gestion des Dossiers (Bureau)"
        description="Supervision, alertes et consultation des dossiers douaniers."
      />

      <div className="flex flex-wrap gap-3 items-end bg-card/50 p-4 rounded-xl border shrink-0">
        <div className="w-48">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Recherche par dossier</label>
          <div className="flex items-center rounded-lg border bg-background h-9 focus-within:ring-2 focus-within:ring-accent/20">
            <Search className="ml-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              className="flex-1 bg-transparent px-2 text-xs outline-none"
              placeholder="RD-..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-36">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Début</label>
          <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
        </div>
        <div className="w-36">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date Fin</label>
          <input type="date" className="w-full h-9 rounded-lg border bg-background px-2 text-xs" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
        </div>
        <Button size="sm" className="h-9 px-4 font-black uppercase tracking-widest text-[10px]" onClick={() => { setHasSearched(true); toast.success("Filtres appliqués"); }}>Rechercher</Button>
        {hasSearched && <Button variant="ghost" size="sm" className="h-9 px-4 text-[10px]" onClick={() => { setSearchTerm(""); setDateRange({ start: "", end: "" }); setHasSearched(false); }}>Reset</Button>}
      </div>

      <div className="flex-1 min-h-0 bg-card rounded-xl border overflow-hidden shadow-sm">
        <div className="h-full overflow-y-auto scrollbar-hide">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b text-[9px] font-black uppercase tracking-widest text-muted-foreground z-10">
              <tr>
                <th className="py-4 px-3">N°</th>
                <th className="py-4 px-3">Importateur</th>
                <th className="py-4 px-3">DRA Réf</th>
                <th className="py-4 px-3">Date</th>
                <th className="py-4 px-3">T1 Réf</th>
                <th className="py-4 px-3">Date</th>
                <th className="py-4 px-3">Véhicule</th>
                <th className="py-4 px-3">Action</th>
                <th className="py-4 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredDossiers.map((d, i) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="py-3 px-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-3 px-3 font-bold">{d.importateur}</td>
                  <td className="py-3 px-3 font-mono font-bold text-accent">{d.dra || "E-0000"}</td>
                  <td className="py-3 px-3 font-mono text-[10px]">{d.date}</td>
                  <td className="py-3 px-3 font-mono">{d.t1 || "—"}</td>
                  <td className="py-3 px-3 font-mono text-[10px]">{d.date}</td>
                  <td className="py-3 px-3 text-muted-foreground">{d.vehicule}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      <FormDialog
                        trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-accent hover:bg-accent/10">Afficher</Button>}
                        title={`Détails Articles — ${d.reference}`}
                      >
                        <div className="space-y-4">
                          <table className="w-full text-[11px] border-collapse">
                            <thead>
                              <tr className="border-b text-muted-foreground uppercase font-black text-[9px] tracking-widest">
                                <th className="py-2 text-left">Article</th>
                                <th className="py-2 text-right">Poids (kg)</th>
                                <th className="py-2 text-right">Quantité</th>
                                <th className="py-2 text-right">FOB ($)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {d.articles?.map(art => (
                                <tr key={art.id}>
                                  <td className="py-2 font-bold">{art.designation}</td>
                                  <td className="py-2 text-right font-mono">{art.poids}</td>
                                  <td className="py-2 text-right">{art.quantite}</td>
                                  <td className="py-2 text-right font-black text-success">{art.fob?.toLocaleString()}</td>
                                </tr>
                              )) || (
                                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground italic">Aucun article listé</td></tr>
                                )}
                            </tbody>
                          </table>
                        </div>
                      </FormDialog>
                      <FormDialog
                        trigger={<Button variant="ghost" size="sm" className="h-7 px-2 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10">Alerter</Button>}
                        title="Activer une Alerte de Sécurité"
                        onSubmit={() => toast.success("Alerte activée")}
                      >
                        <div className="space-y-4">
                          <Field label="Description de l'alerte" required>
                            <textarea className="w-full min-h-[100px] rounded-lg border bg-background p-3 text-xs outline-none focus:ring-1 focus:ring-destructive/30" placeholder="Motif de l'alerte..." />
                          </Field>
                          <Button className="w-full h-11 bg-destructive hover:bg-destructive/90 text-white font-black uppercase tracking-widest text-[10px]">Activer Alerte</Button>
                        </div>
                      </FormDialog>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {i % 7 === 0 ? (
                      <Badge variant="destructive" className="text-[8px] font-black uppercase py-0 px-2 animate-pulse">Alerte</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[8px] font-black uppercase py-0 px-2 text-success border-success/30">Normal</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditDossierDialog({ dossier, onSuccess }: { dossier: Dossier; onSuccess: () => void }) {
  const warehouses = useWarehouses();
  const [formData, setFormData] = useState<any>({
    importateur: dossier.importateur || "",
    declarant: dossier.declarant || "",
    localisation: dossier.localisation || "",
    dra: dossier.dra || "",
    t1: dossier.t1 || "",
    nif: dossier.nif || "",
    type_marchandises: dossier.type_marchandises || "",
    nombre_titres: dossier.extra_data?.nombre_titres || 0,
    nombre_declarations_attendues: dossier.extra_data?.nombre_declarations_attendues || 0,
    declarations_details: dossier.extra_data?.declarations_details || [],
    titres_details: dossier.extra_data?.titres_details || [],
    reference_titre: dossier.extra_data?.reference_titre || "",
    date_titre: dossier.extra_data?.date_titre || "",
    reference_t1: dossier.extra_data?.reference_t1 || "",
    date_t1: dossier.extra_data?.date_t1 || "",
    reference_douane: dossier.extra_data?.reference_douane || "",
    date_reference_douane: dossier.extra_data?.date_reference_douane || "",
    date_debut: dossier.extra_data?.date_debut || "",
    date_fin: dossier.extra_data?.date_fin || "",
  });

  const handleChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async () => {
    try {
      await apiUpdateDossier(dossier.id, {
        importateur: formData.importateur,
        declarant: formData.declarant,
        localisation: formData.localisation,
        dra: formData.dra,
        t1: formData.t1,
        nif: formData.nif,
        type_marchandises: formData.type_marchandises,
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
          date_fin: formData.date_fin,
        },
      });
      toast.success("Dossier modifié avec succès !");
      onSuccess();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    }
  };

  return (
    <FormDialog
      trigger={
        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
          <Edit className="h-4 w-4" />
        </Button>
      }
      title={`Modifier Dossier — ${dossier.reference}`}
      submitLabel="Enregistrer"
      onSubmit={handleSubmit}
    >
      <FormGrid>
        <CommonFields formData={formData} setFormData={setFormData} />
        <Field label="Importateur" required><Input value={formData.importateur} onChange={e => handleChange('importateur', e.target.value)} /></Field>
        <Field label="Nom déclarant" required><Input value={formData.declarant} onChange={e => handleChange('declarant', e.target.value)} /></Field>
        <Field label="NIF"><Input value={formData.nif} onChange={e => handleChange('nif', e.target.value)} /></Field>
        <Field label="Type Marchandises"><Input value={formData.type_marchandises} onChange={e => handleChange('type_marchandises', e.target.value)} /></Field>
        <Field label="Nombre déclarations attendues"><Input type="number" min={0} value={formData.nombre_declarations_attendues} onChange={e => handleChange('nombre_declarations_attendues', e.target.value)} /></Field>
        <Field label="Nombre de titres"><Input type="number" min={0} value={formData.nombre_titres} onChange={e => handleChange('nombre_titres', e.target.value)} /></Field>
        <DynamicDeclarations count={formData.nombre_declarations_attendues} formData={formData} setFormData={setFormData} />
        <DynamicTitres count={formData.nombre_titres} formData={formData} setFormData={setFormData} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence titre (E-XXX)"><Input placeholder="E-001" value={formData.reference_titre} onChange={e => handleChange('reference_titre', e.target.value)} /></Field>
          <Field label="Sa date"><Input type="date" value={formData.date_titre} onChange={e => handleChange('date_titre', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence T1"><Input placeholder="T1-…" value={formData.reference_t1} onChange={e => handleChange('reference_t1', e.target.value)} /></Field>
          <Field label="Sa date"><Input type="date" value={formData.date_t1} onChange={e => handleChange('date_t1', e.target.value)} /></Field>
        </div>
        <LocalisationField warehouses={warehouses} value={formData.localisation} onChange={(v: string) => handleChange("localisation", v)} />
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Référence douane (E-XXX)"><Input placeholder="E-001" value={formData.reference_douane} onChange={e => handleChange('reference_douane', e.target.value)} /></Field>
          <Field label="Date référence douane"><Input type="date" value={formData.date_reference_douane} onChange={e => handleChange('date_reference_douane', e.target.value)} /></Field>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Field label="Date début"><Input type="date" value={formData.date_debut} onChange={e => handleChange('date_debut', e.target.value)} /></Field>
          <Field label="Date fin"><Input type="date" value={formData.date_fin} onChange={e => handleChange('date_fin', e.target.value)} /></Field>
        </div>
      </FormGrid>
    </FormDialog>
  );
}

function InspecteurDossiersView() {
  const { data: rawDossiers, reload } = useApi(apiGetDossiers);
  const { data: rawTypesDossiers } = useApi(apiGetTypesDossiers);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [searchRef, setSearchRef] = useState("");
  const [searchDra, setSearchDra] = useState("");
  const [searchT1, setSearchT1] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filterStatus, setFilterStatus] = useState("tous");

  const allDossiers = (rawDossiers || []) as Dossier[];
  const typesDossiers = (rawTypesDossiers || []) as any[];

  // Le backend renvoie tous les dossiers accessibles.
  // L'Inspecteur a accès aux dossiers "Bureau Représentation" pour consultation dans l'onglet dédié.
  // On doit donc les exclure de son onglet "Dossiers" principal.
  const inspecteurDossiers = allDossiers.filter((d) => {
    const roleCreator = d.creator?.role;
    return roleCreator !== "operateur_saisie" && roleCreator !== "chef_bureau_repr";
  });

  const getFilteredDossiers = () => {
    let filtered = [...inspecteurDossiers];
    if (searchRef) filtered = filtered.filter((d) => d.reference.toLowerCase().includes(searchRef.toLowerCase()));
    if (searchDra) filtered = filtered.filter((d) => d.dra?.toLowerCase().includes(searchDra.toLowerCase()));
    if (searchT1) filtered = filtered.filter((d) => d.t1?.toLowerCase().includes(searchT1.toLowerCase()));
    if (startDate) filtered = filtered.filter((d) => (d.date ?? d.created_at) >= startDate);
    if (endDate) filtered = filtered.filter((d) => (d.date ?? d.created_at) <= endDate);
    if (filterStatus !== "tous") filtered = filtered.filter((d) => d.status === filterStatus);
    return filtered;
  };

  const filteredDossiers = getFilteredDossiers();

  const handleSearch = () => {
    let rawRef = searchRef.trim().replace(/^RD-/i, '');
    let finalRef = '';

    if (rawRef) {
      // pad with zeros up to 4 digits if needed
      if (/^\d{1,4}$/.test(rawRef)) {
        rawRef = rawRef.padStart(4, '0');
      }
      finalRef = `RD-${rawRef}`;
      setSearchRef(rawRef); // Keep only the numbers in the input
    }

    setHasSearched(true);
    
    // We calculate manually with finalRef so toast shows the correct number immediately
    let count = [...inspecteurDossiers];
    if (finalRef) count = count.filter((d) => d.reference.toLowerCase().includes(finalRef.toLowerCase()));
    if (searchDra) count = count.filter((d) => d.dra?.toLowerCase().includes(searchDra.toLowerCase()));
    if (searchT1) count = count.filter((d) => d.t1?.toLowerCase().includes(searchT1.toLowerCase()));
    if (startDate) count = count.filter((d) => (d.date ?? d.created_at) >= startDate);
    if (endDate) count = count.filter((d) => (d.date ?? d.created_at) <= endDate);
    if (filterStatus !== "tous") count = count.filter((d) => d.status === filterStatus);

    toast.success(count.length + " dossier(s) trouvé(s).");
  };
  const handleReset = () => { setSearchRef(""); setSearchDra(""); setSearchT1(""); setStartDate(""); setEndDate(""); setFilterStatus("tous"); setHasSearched(false); };

  return (
    <div className="space-y-6">
      <PageHeader title="Historique Personnel" description="Mes dossiers traités et récemment consultés." />

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Créer un nouveau dossier</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {typesDossiers.length > 0 ? (
              typesDossiers.map(t => {
                const formMap: Record<string, React.FC<any>> = {
                  direct: DirectForm,
                  dir: DirectForm,
                  transbordement: TransbordementForm,
                  trans: TransbordementForm,
                  vrac: VracForm,
                  lot: LotForm,
                  petrolier: PetrolierForm,
                  petro: PetrolierForm,
                  dechargement: DechargementForm,
                  decharge: DechargementForm,
                  trafic: TraficForm,
                  export: ExportForm,
                  autres: AutresForm,
                };
                const code = t.code?.toLowerCase() || "";
                const libelle = t.libelle?.toLowerCase() || "";
                const FormComponent = formMap[code] || formMap[libelle] || formMap["autres"] || AutresForm;
                return <FormComponent key={t.id} type={t} onSuccess={() => { reload(); toast.success("Dossier créé avec succès !"); }} />;
              })
            ) : (
              <p className="text-sm text-muted-foreground italic">Aucun type de dossier n'a été créé par l'administrateur.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-gradient-to-br from-card via-card to-accent/[0.03] p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <div className="xl:col-span-1">
              <label className="text-xs text-muted-foreground">Réf. dossier</label>
              <div className="relative mt-1.5 flex items-center">
                <span className="absolute left-3 text-sm font-semibold text-muted-foreground pointer-events-none">
                  RD-
                </span>
                <Input value={searchRef} onChange={e => setSearchRef(e.target.value.replace(/^RD-/i, ''))} placeholder="0045" className="h-9 pl-9 font-mono" />
              </div>
            </div>
            <div className="xl:col-span-1"><label className="text-xs text-muted-foreground">Référence E-</label><Input value={searchDra} onChange={e => setSearchDra(e.target.value)} placeholder="E-XXXX" className="h-9 mt-1.5" /></div>
            <div className="xl:col-span-1"><label className="text-xs text-muted-foreground">T1</label><Input value={searchT1} onChange={e => setSearchT1(e.target.value)} placeholder="T1" className="h-9 mt-1.5" /></div>
            <div className="xl:col-span-1"><label className="text-xs text-muted-foreground">Date Début</label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9 mt-1.5" /></div>
            <div className="xl:col-span-1"><label className="text-xs text-muted-foreground">Date Fin</label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9 mt-1.5" /></div>
            <div className="xl:col-span-1"><label className="text-xs text-muted-foreground">Statut</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex h-9 w-full mt-1.5 rounded-md border border-input bg-background px-3 text-sm"><option value="tous">Tous</option><option value="brouillon">Brouillon</option><option value="complet">Complet</option><option value="appure">Appuré</option></select></div>
            <div className="flex items-end gap-2 xl:col-span-1"><Button onClick={handleSearch} className="w-full h-9 bg-accent font-bold">Chercher</Button></div>
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[10px] font-bold uppercase text-muted-foreground">
              <tr><th className="px-4 py-4">N°</th><th className="px-4 py-4">Importateur</th><th className="px-4 py-4">Référence</th><th className="px-4 py-4">Statut</th><th className="px-4 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDossiers.map((d, i) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{d.importateur}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.reference}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                    {d.created_by === user?.id && (
                      <EditDossierDialog dossier={d} onSuccess={reload} />
                    )}
                    <Button size="sm" variant="outline" className="h-8 border-accent text-accent hover:bg-accent hover:text-white" onClick={() => navigate({ to: "/app/dossiers/$dossierId", params: { dossierId: String(d.id) } })}>Ouvrir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
