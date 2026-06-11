import {
  FolderKanban,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  Warehouse,
  ShieldCheck,
  Edit3,
  XCircle,
  BarChart3,
  List,
  X,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import {
  useApi,
  apiGetDossiers,
  apiGetBarrieresControle,
  apiCreateBarriereControle,
  apiUpdateBarriereControle,
  apiDeleteBarriereControle,
  apiGetUsers,
  apiGetBarriereControleActivities,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function InspecteurChefDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];
  const { user } = useAuth();
  const { data: rawBarrieres, reload: refetchBarrieres } = useApi(apiGetBarrieresControle);
  const barrieres = (rawBarrieres as any[]) || [];
  const { data: rawUsers, reload: refetchUsers } = useApi(apiGetUsers);

  const [view, setView] = useState<"dashboard" | "barrieres">("dashboard");
  const [selectedBarriere, setSelectedBarriere] = useState<any | null>(null);
  const [activitiesData, setActivitiesData] = useState<any | null>(null);
  const [showActivities, setShowActivities] = useState(false);
  const [editingBarriere, setEditingBarriere] = useState<any | null>(null);
  const [activitiesTab, setActivitiesTab] = useState<"tous" | "today" | "week" | "autorisation">("tous");

  const totalDossiers = activeDossiers.length;
  const enCours = activeDossiers.filter((d) => d.status === "en_cours").length;
  const apures = activeDossiers.filter((d) => d.status === "apure").length;

  const brigadiers = (rawUsers as any[] || []).filter((u: any) => u.role === "brigadier_controle");

  const handleCreateBarriere = async () => {
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value || "";
    const brigadierVal = g("bc-brigadier-id");
    try {
      await apiCreateBarriereControle({
        nom: g("bc-nom"),
        entite: g("bc-entite"),
        brigadier_id: brigadierVal ? parseInt(brigadierVal) : null,
      });
      toast.success("Barrière créée avec succès.");
      refetchBarrieres();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la création.");
    }
  };

  const handleUpdateBarriere = async () => {
    if (!editingBarriere) return;
    const g = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement)?.value || "";
    const brigadierVal = g("bc-brigadier-id-edit");
    try {
      await apiUpdateBarriereControle(editingBarriere.id, {
        nom: g("bc-nom-edit"),
        entite: g("bc-entite-edit"),
        brigadier_id: brigadierVal ? parseInt(brigadierVal) : null,
        status: g("bc-status-edit"),
      });
      toast.success("Barrière mise à jour.");
      setEditingBarriere(null);
      refetchBarrieres();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteBarriere = async (id: number) => {
    try {
      await apiDeleteBarriereControle(id);
      toast.success("Barrière désactivée.");
      refetchBarrieres();
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la désactivation.");
    }
  };

  const handleViewActivities = async (id: number) => {
    try {
      const data = await apiGetBarriereControleActivities(id);
      setActivitiesData(data);
      setShowActivities(true);
    } catch (e: any) {
      toast.error("Erreur lors du chargement des activités.");
    }
  };

  const renderDashboard = () => (
    <>
      <DashHeader subtitle="Inspecteur Chef de Bureau — Vision globale en temps réel" />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total dossiers" value={totalDossiers} />
        <StatCard icon={FileCheck} label="Apurés" value={apures} />
        <StatCard icon={DollarSign} label="Solde virtuel" value={`$${user?.walletBalance || 0}`} />
        <StatCard icon={Activity} label="Dossiers en cours" value={enCours} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Barrières de Contrôle — Résumé">
            {barrieres.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                Aucune barrière de contrôle configurée.
              </p>
            ) : (
              <div className="space-y-3">
                {barrieres.slice(0, 5).map((b: any) => {
                  const totalDoss = b.dossiers?.length ?? 0;
                  const autorisation = b.dossiers?.filter((d: any) => d.autorisation_speciale).length ?? 0;
                  return (
                    <div key={b.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center gap-3">
                        <Warehouse className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{b.nom}</div>
                          <div className="text-xs text-muted-foreground">{b.entite}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-right">
                        <div>
                          <div className="font-semibold">{totalDoss}</div>
                          <div className="text-muted-foreground">Dossiers</div>
                        </div>
                        {autorisation > 0 && (
                          <div className="text-amber-600">
                            <div className="font-semibold">{autorisation}</div>
                            <div className="text-muted-foreground">Autorisation</div>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleViewActivities(b.id)}>
                          Voir
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Accès rapides">
            <div className="space-y-1">
              {[
                { to: "/app/dossiers", label: "Gérer les dossiers", icon: FolderKanban, desc: "Créer, payer, apurer" },
                { to: "/app/appurement", label: "Supervision apurements", icon: FileCheck, desc: "Gérer les soumissions" },
                { to: "/app/secretariat", label: "Mes secrétaires", icon: Users, desc: "Gérer les comptes" },
                { to: "/app/alertes", label: "Alertes", icon: AlertTriangle, desc: "Voir les alertes" },
                { to: "/app/entrepots", label: "Entrepôt", icon: TrendingUp, desc: "Flux & parking" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              ))}
              <button
                onClick={() => setView("barrieres")}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-500 shrink-0">
                  <Warehouse className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium">Barrières Contrôle</div>
                  <div className="text-xs text-muted-foreground">Gérer les barrières</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );

  const renderBarrieres = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Barrières de Contrôle</h2>
          <p className="text-sm text-muted-foreground">Gérer les barrières et leurs brigadiers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("dashboard")}>
            ← Retour
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Warehouse} label="Total barrières" value={barrieres.length} />
        <StatCard icon={Users} label="Brigadiers" value={brigadiers.length} />
        <StatCard icon={BarChart3} label="Active" value={barrieres.filter((b: any) => b.status === "active").length} />
      </div>

      <div className="flex items-center justify-between">
        <FormDialog
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle barrière
            </Button>
          }
          title="Créer une Barrière de Contrôle"
          onSubmit={handleCreateBarriere}
          submitLabel="Créer la barrière"
        >
          <FormGrid>
            <Field label="Nom de la barrière" required>
              <Input id="bc-nom" placeholder="Ex: Barrière Kanyosha" />
            </Field>
            <Field label="Brigadier affecté">
              <select id="bc-brigadier-id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Non affecté (attribuer plus tard)</option>
                {brigadiers.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.full_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Entité / Localisation" required>
              <Input id="bc-entite" placeholder="Ex: Kobero, Gatumba, Aéroport International" />
            </Field>
          </FormGrid>
        </FormDialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Nom</th>
              <th className="py-2 pr-4 font-medium">Entité</th>
              <th className="py-2 pr-4 font-medium">Brigadier Affecté</th>
              <th className="py-2 pr-4 font-medium">Dossiers Traités</th>
              <th className="py-2 pr-4 font-medium">Statut</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {barrieres.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                  Aucune barrière de contrôle créée.
                </td>
              </tr>
            ) : (
              barrieres.map((b: any) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-2 pr-4 font-medium">{b.nom}</td>
                  <td className="py-2 pr-4">{b.entite}</td>
                  <td className="py-2 pr-4">{b.brigadier?.full_name || "—"}</td>
                  <td className="py-2 pr-4">{b.dossiers?.length || 0}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {b.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewActivities(b.id)} title="Voir activités">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBarriere(b)} title="Voir dossiers">
                        <List className="h-4 w-4" />
                      </Button>
                      <FormDialog
                        trigger={
                          <Button variant="ghost" size="sm" title="Modifier">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        }
                        title={`Modifier — ${b.nom}`}
                        onSubmit={handleUpdateBarriere}
                        submitLabel="Enregistrer"
                        onOpenChange={(open: boolean) => { if (open) setEditingBarriere(b); }}
                      >
                        <FormGrid>
                          <Field label="Nom de la barrière" required>
                            <Input id="bc-nom-edit" defaultValue={b.nom} placeholder="Ex: Barrière Kanyosha" />
                          </Field>
                          <Field label="Brigadier affecté">
                            <select id="bc-brigadier-id-edit" defaultValue={b.brigadier_id || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="">Non affecté</option>
                              {brigadiers.map((br: any) => (
                                <option key={br.id} value={br.id}>{br.full_name}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Entité / Localisation" required>
                            <Input id="bc-entite-edit" defaultValue={b.entite} placeholder="Ex: Kobero, Gatumba" />
                          </Field>
                          <Field label="Statut">
                            <select id="bc-status-edit" defaultValue={b.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </Field>
                        </FormGrid>
                      </FormDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBarriere(b.id)}
                        title="Désactiver"
                        className="text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showActivities && activitiesData && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                Activités — {activitiesData.barriere}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Brigadier : {activitiesData.brigadier || "Non affecté"}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowActivities(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ActivitiesTabView data={activitiesData} tab={activitiesTab} onTabChange={setActivitiesTab} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {view === "dashboard" && renderDashboard()}
      {view === "barrieres" && renderBarrieres()}
    </div>
  );
}

/* ═══ Activités Tab View ═══ */
function ActivitiesTabView({ data, tab, onTabChange }: { data: any; tab: string; onTabChange: (t: "tous" | "today" | "week" | "autorisation") => void }) {
  const tabs = [
    { key: "tous" as const, label: "Tous", count: data.total_dossiers },
    { key: "today" as const, label: "Aujourd'hui", count: data.dossiers_du_jour },
    { key: "week" as const, label: "Cette semaine", count: data.dossiers_semaine },
    { key: "autorisation" as const, label: "Autorisation spéciale", count: data.dossiers_autorisation_speciale },
  ];

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const dossiers = data.dossiers || [];
  const filtered = dossiers.filter((d: any) => {
    if (tab === "today") return d.created_at?.split("T")[0] === today;
    if (tab === "week") return d.created_at?.split("T")[0] >= weekStartStr;
    if (tab === "autorisation") return d.autorisation_speciale;
    return true;
  });

  return (
    <div className="p-5">
      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.key
                ? "bg-accent text-accent-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label} <span className="ml-1 opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {dossiers.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground italic">Aucun dossier de contrôle.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[10px] font-bold uppercase text-muted-foreground">
                <th className="py-2 pr-3">N°</th>
                <th className="py-2 pr-3">Réf. Douane</th>
                <th className="py-2 pr-3">Importateur</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Brigadier</th>
                <th className="py-2 pr-3">Autorisation Spéciale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-xs text-muted-foreground italic">Aucun dossier trouvé pour ce filtre.</td></tr>
              ) : (
                filtered.map((d: any, i: number) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="py-2 pr-3 text-xs">{i + 1}</td>
                    <td className="py-2 pr-3 font-mono text-xs font-bold text-accent">{d.reference_douane || "—"}</td>
                    <td className="py-2 pr-3">{d.nom_importateur || "—"}</td>
                    <td className="py-2 pr-3 text-xs">{d.created_at?.split("T")[0] || "—"}</td>
                    <td className="py-2 pr-3 text-xs">{d.brigadier?.full_name || "—"}</td>
                    <td className="py-2 pr-3">
                      {d.autorisation_speciale ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          <ShieldCheck className="h-3 w-3" /> Oui
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Non</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
