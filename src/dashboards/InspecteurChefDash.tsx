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
import { useApi, apiCreateWarehouse, apiGetDossiers } from "@/lib/api";
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
  const totalDossiers = activeDossiers.length;
  const enCours = activeDossiers.filter((d) => d.status === "en_cours").length;
  const apures = activeDossiers.filter((d) => d.status === "apure").length;



  return (
    <div className="space-y-6">
      <DashHeader subtitle="Inspecteur Chef de Bureau — Vision globale en temps réel" />

      {/* ── WIDGETS STATS ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Total dossiers"
          value={totalDossiers}
        />
        <StatCard
          icon={FileCheck}
          label="Apurés"
          value={apures}
        />
        <StatCard
          icon={DollarSign}
          label="Solde virtuel"
          value={`$${user?.walletBalance || 0}`}
        />
        <StatCard icon={Activity} label="Dossiers en cours" value={enCours} />
      </div>



      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── ACTIVITÉ RÉCENTE ── */}
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

        {/* ── ACCÈS RAPIDES ── */}
        <div className="space-y-4">
          <Panel title="Accès rapides">
            <div className="space-y-1">
              {[
                {
                  to: "/app/dossiers",
                  label: "Gérer les dossiers",
                  icon: FolderKanban,
                  desc: "Créer, payer, apurer",
                },
                {
                  to: "/app/appurement",
                  label: "Supervision apurements",
                  icon: FileCheck,
                  desc: "Gérer les soumissions",
                },
                {
                  to: "/app/secretariat",
                  label: "Mes secrétaires",
                  icon: Users,
                  desc: "Gérer les comptes",
                },
                {
                  to: "/app/alertes",
                  label: "Alertes",
                  icon: AlertTriangle,
                  desc: "Voir les alertes",
                },
                {
                  to: "/app/entrepots",
                  label: "Entrepôt",
                  icon: TrendingUp,
                  desc: "Flux & parking",
                },
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
            </div>
          </Panel>



        </div>
      </div>
    </div>
  );
}
