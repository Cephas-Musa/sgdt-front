import { useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Eye,
  Calendar,
  ShieldCheck,
  Truck,
  FileText,
  User,
  CheckCheck,
  X,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { useApi, apiGetDossiersControle, apiCreateDossierControle } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type View = "dashboard" | "dossiers" | "detail";

interface DossierItem {
  id: number;
  barriere_id: number;
  brigadier_id: number;
  nom_importateur: string;
  plaque_avant: string | null;
  plaque_arriere: string | null;
  reference_douane: string;
  date_controle: string | null;
  reference_bon_sortie: string | null;
  balle: string | null;
  autorisation_speciale: boolean;
  type_autorisation: string | null;
  reference_autorisation: string | null;
  date_autorisation: string | null;
  created_at: string;
  updated_at: string;
  barriere?: { id: number; nom: string };
  brigadier?: { id: number; full_name: string };
  signataires?: { id: number; type_signataire: string }[];
}

const SIGNATAIRES_OPTIONS = [
  "Inspecteur Chef de Bureau",
  "Commandant Brigade",
  "Commande Recherche",
  "Receveur",
  "Commandant Recherche",
];

export default function BrigadierControleDash() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [selectedDossier, setSelectedDossier] = useState<DossierItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterImportateur, setFilterImportateur] = useState("");
  const [filterRefDouane, setFilterRefDouane] = useState("");

  const { data: rawData, reload: refetch } = useApi(apiGetDossiersControle);
  const dossiers = (rawData as any)?.data ?? (rawData as DossierItem[]) ?? [];
  const isPaginated = rawData && typeof rawData === "object" && "data" in rawData;
  const totalDossiers = isPaginated ? (rawData as any).total ?? dossiers.length : dossiers.length;
  const aujourdHui = dossiers.filter((d: DossierItem) => {
    if (!d.date_controle) return false;
    const today = new Date().toDateString();
    return new Date(d.date_controle).toDateString() === today;
  }).length;
  const avecAutorisation = dossiers.filter((d: DossierItem) => d.autorisation_speciale).length;

  const filteredDossiers = dossiers.filter((d: DossierItem) => {
    if (searchQuery && !d.reference_douane.toLowerCase().includes(searchQuery.toLowerCase()) && !d.nom_importateur.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterDate && d.date_controle) {
      const dDate = new Date(d.date_controle).toISOString().slice(0, 10);
      if (dDate !== filterDate) return false;
    }
    if (filterImportateur && !d.nom_importateur.toLowerCase().includes(filterImportateur.toLowerCase())) return false;
    if (filterRefDouane && !d.reference_douane.toLowerCase().includes(filterRefDouane.toLowerCase())) return false;
    return true;
  });

  const [autoSpeciale, setAutoSpeciale] = useState(false);

  const handleCreateControle = async () => {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value || "";
    const c = (id: string) => (document.getElementById(id) as HTMLInputElement)?.checked || false;

    try {
      const payload: Record<string, any> = {
        nom_importateur: g("bc-nom-importateur"),
        plaque_avant: g("bc-plaque-avant") || null,
        plaque_arriere: g("bc-plaque-arriere") || null,
        reference_douane: g("bc-reference-douane"),
        date_controle: g("bc-date-controle"),
        reference_bon_sortie: g("bc-reference-bon-sortie") || null,
        balle: g("bc-balle") || null,
        autorisation_speciale: c("bc-autorisation-speciale"),
      };

      if (payload.autorisation_speciale) {
        payload.type_autorisation = g("bc-type-autorisation") || null;
        payload.reference_autorisation = g("bc-reference-autorisation") || null;
        payload.date_autorisation = g("bc-date-autorisation") || null;
        payload.signataires = SIGNATAIRES_OPTIONS.filter((sig) => c(`bc-signataire-${sig}`));
      }

      await apiCreateDossierControle(payload);
      toast.success("Contrôle enregistré avec succès.");
      setAutoSpeciale(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Dossiers traités" value={totalDossiers} />
        <StatCard icon={Calendar} label="Aujourd'hui" value={aujourdHui} />
        <StatCard icon={ShieldCheck} label="Autorisation spéciale" value={avecAutorisation} />
        <StatCard icon={User} label="Brigadier" value={user?.full_name || "—"} />
      </div>

      <Panel title="Dossiers récents">
        {dossiers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">Aucun dossier traité.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">N°</th>
                  <th className="py-2 pr-4 font-medium">Importateur</th>
                  <th className="py-2 pr-4 font-medium">Réf Douane</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Réf BS</th>
                  <th className="py-2 pr-4 font-medium">Autorisation</th>
                  <th className="py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {dossiers.slice(0, 10).map((d: DossierItem, i: number) => (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2 pr-4">{i + 1}</td>
                    <td className="py-2 pr-4">{d.nom_importateur}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{d.reference_douane}</td>
                    <td className="py-2 pr-4">{d.date_controle ? new Date(d.date_controle).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className="py-2 pr-4">{d.reference_bon_sortie || "—"}</td>
                    <td className="py-2 pr-4">{d.autorisation_speciale ? <span className="text-yellow-600 font-medium">Oui</span> : "Non"}</td>
                    <td className="py-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedDossier(d); setView("detail"); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );

  const renderDossiers = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-60 pl-8"
            />
          </div>
          <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40" />
          <Input placeholder="Nom importateur" value={filterImportateur} onChange={(e) => setFilterImportateur(e.target.value)} className="w-48" />
          <Input placeholder="Réf douane" value={filterRefDouane} onChange={(e) => setFilterRefDouane(e.target.value)} className="w-40" />
        </div>
        <FormDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Contrôle
            </Button>
          }
          title="Nouveau Contrôle"
          onSubmit={handleCreateControle}
          submitLabel="Enregistrer"
        >
          <FormGrid>
            <Field label="Nom importateur" required>
              <Input id="bc-nom-importateur" placeholder="Nom de l'importateur" />
            </Field>
            <Field label="Plaque véhicule avant">
              <Input id="bc-plaque-avant" placeholder="Ex: 1234 AB" />
            </Field>
            <Field label="Plaque véhicule arrière">
              <Input id="bc-plaque-arriere" placeholder="Ex: 5678 CD" />
            </Field>
            <Field label="Référence douane" required>
              <Input id="bc-reference-douane" placeholder="Ex: RD-2026-00125" />
            </Field>
            <Field label="Date" required>
              <Input id="bc-date-controle" type="date" />
            </Field>
            <Field label="Référence bon de sortie">
              <Input id="bc-reference-bon-sortie" placeholder="Ex: BS-2026-001" />
            </Field>
            <Field label="Balle / Colis">
              <Input id="bc-balle" placeholder="Ex: 50" />
            </Field>
          </FormGrid>
          <div className="space-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="bc-autorisation-speciale"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={(e) => setAutoSpeciale(e.target.checked)}
              />
              <span className="text-sm">Autorisation spéciale</span>
            </label>
          </div>

          {autoSpeciale && (
            <div className="mt-4 space-y-3 border rounded-lg p-4 bg-muted/20">
              <p className="text-sm font-medium text-yellow-700">Détails de l'autorisation spéciale</p>
              <FormGrid>
                <Field label="Type autorisation">
                  <Input id="bc-type-autorisation" placeholder="Ex: Dérogation exceptionnelle" />
                </Field>
                <Field label="Référence autorisation">
                  <Input id="bc-reference-autorisation" placeholder="Ex: AUT-2026-001" />
                </Field>
                <Field label="Date autorisation">
                  <Input id="bc-date-autorisation" type="date" />
                </Field>
              </FormGrid>
              <div className="space-y-2">
                <p className="text-sm font-medium">Autorisation signée par</p>
                {SIGNATAIRES_OPTIONS.map((sig) => (
                  <label key={sig} className="flex items-center gap-2 cursor-pointer">
                    <input
                      id={`bc-signataire-${sig}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{sig}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </FormDialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">N°</th>
              <th className="py-2 pr-4 font-medium">Importateur</th>
              <th className="py-2 pr-4 font-medium">Réf Douane</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Réf BS</th>
              <th className="py-2 pr-4 font-medium">Balle</th>
              <th className="py-2 pr-4 font-medium">Autorisation Spéciale</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDossiers.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground italic">Aucun dossier trouvé.</td></tr>
            ) : (
              filteredDossiers.map((d: DossierItem, i: number) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 pr-4">{i + 1}</td>
                  <td className="py-2 pr-4">{d.nom_importateur}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{d.reference_douane}</td>
                  <td className="py-2 pr-4">{d.date_controle ? new Date(d.date_controle).toLocaleDateString("fr-FR") : "—"}</td>
                  <td className="py-2 pr-4">{d.reference_bon_sortie || "—"}</td>
                  <td className="py-2 pr-4">{d.balle || "—"}</td>
                  <td className="py-2 pr-4">{d.autorisation_speciale ? <span className="text-yellow-600 font-medium">Oui</span> : "Non"}</td>
                  <td className="py-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedDossier(d); setView("detail"); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedDossier) return null;
    const d = selectedDossier;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Détail du Contrôle</h3>
          <Button variant="outline" size="sm" onClick={() => { setView("dossiers"); setSelectedDossier(null); }}>
            <X className="h-4 w-4 mr-1" /> Fermer
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel title="Informations générales">
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Importateur :</span> {d.nom_importateur}</div>
              <div><span className="text-muted-foreground">Plaque avant :</span> {d.plaque_avant || "—"}</div>
              <div><span className="text-muted-foreground">Plaque arrière :</span> {d.plaque_arriere || "—"}</div>
              <div><span className="text-muted-foreground">Réf. douane :</span> {d.reference_douane}</div>
              <div><span className="text-muted-foreground">Réf. bon de sortie :</span> {d.reference_bon_sortie || "—"}</div>
              <div><span className="text-muted-foreground">Date :</span> {d.date_controle ? new Date(d.date_controle).toLocaleDateString("fr-FR") : "—"}</div>
              <div><span className="text-muted-foreground">Nombre de balles :</span> {d.balle || "—"}</div>
              <div><span className="text-muted-foreground">Autorisation spéciale :</span> {d.autorisation_speciale ? <span className="text-yellow-600 font-medium">Oui</span> : "Non"}</div>
            </div>
          </Panel>

          {d.autorisation_speciale && (
            <Panel title="Autorisation spéciale">
              <div className="space-y-2 text-sm">
                <div><span className="text-muted-foreground">Type :</span> {d.type_autorisation || "—"}</div>
                <div><span className="text-muted-foreground">Référence :</span> {d.reference_autorisation || "—"}</div>
                <div><span className="text-muted-foreground">Date :</span> {d.date_autorisation ? new Date(d.date_autorisation).toLocaleDateString("fr-FR") : "—"}</div>
                <div className="mt-2">
                  <span className="text-muted-foreground">Signataires :</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {d.signataires && d.signataires.length > 0
                      ? d.signataires.map((s) => <li key={s.id}>{s.type_signataire}</li>)
                      : <li className="text-muted-foreground italic">Aucun</li>}
                  </ul>
                </div>
              </div>
            </Panel>
          )}

          <Panel title="Traçabilité">
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Barrière de contrôle :</span> {d.barriere?.nom || "—"}</div>
              <div><span className="text-muted-foreground">Brigadier responsable :</span> {d.brigadier?.full_name || "—"}</div>
              <div><span className="text-muted-foreground">Date de création :</span> {d.created_at ? new Date(d.created_at).toLocaleString("fr-FR") : "—"}</div>
              <div><span className="text-muted-foreground">Dernière modification :</span> {d.updated_at ? new Date(d.updated_at).toLocaleString("fr-FR") : "—"}</div>
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Brigadier Contrôle — Gestion des contrôles de barrière" />

      <div className="flex items-center gap-2 border-b pb-2">
        <Button variant={view === "dashboard" ? "default" : "ghost"} size="sm" onClick={() => setView("dashboard")}>
          Tableau de bord
        </Button>
        <Button variant={view === "dossiers" ? "default" : "ghost"} size="sm" onClick={() => setView("dossiers")}>
          Dossiers
        </Button>
      </div>

      {view === "dashboard" && renderDashboard()}
      {view === "dossiers" && renderDossiers()}
      {view === "detail" && renderDetail()}
    </div>
  );
}
