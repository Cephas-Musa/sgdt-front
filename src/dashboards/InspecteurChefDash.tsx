import {
  FolderKanban,
  Clock,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Users,
  ChevronRight,
  Plus,
  Warehouse,
  ShieldCheck,
  Eye,
  Edit3,
  XCircle,
  BarChart3,
  List,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import {
  DOSSIERS,
  ALERTS,
  SOLDE_VIRTUEL,
  ACTIVITES_RECENTES,
  APUREMENT_SUBMISSIONS,
  SECRETAIRES_INSPECTEUR,
} from "@/lib/mock";
import {
  useApi,
  apiCreateWarehouse,
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

const typeIcon = (t: string) => {
  if (t === "creation") return <ArrowUpRight className="h-3.5 w-3.5 text-accent" />;
  if (t === "paiement") return <DollarSign className="h-3.5 w-3.5 text-success" />;
  if (t === "apurement") return <CheckCircle2 className="h-3.5 w-3.5 text-info" />;
  if (t === "alerte") return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
  if (t === "verification") return <FileCheck className="h-3.5 w-3.5 text-accent" />;
  return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
};

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
        <div className="lg:col-span-2">
          <Panel title="Activité récente (Timeline)">
            <div className="space-y-0">
              {ACTIVITES_RECENTES.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0"
                >
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 shrink-0">
                    {typeIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{act.action}</span>
                      <span className="font-mono text-xs text-accent">{act.reference}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {act.user} · {act.date} à {act.heure}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        <Panel title={`Activités — ${activitiesData.barriere}`}>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
            <StatCard icon={ClipboardList} label="Dossiers traités" value={activitiesData.total_dossiers} />
            <StatCard icon={Calendar} label="Aujourd'hui" value={activitiesData.dossiers_du_jour} />
            <StatCard icon={Calendar} label="Cette semaine" value={activitiesData.dossiers_semaine} />
            <StatCard icon={ShieldCheck} label="Autorisation spéciale" value={activitiesData.dossiers_autorisation_speciale} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Brigadier : {activitiesData.brigadier || "Non affecté"}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowActivities(false)}>
            Fermer
          </Button>
        </Panel>
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
