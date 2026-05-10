import {
  FolderKanban, Clock, CheckCircle2, FileCheck, AlertTriangle, DollarSign,
  Activity, ArrowUpRight, TrendingUp, Users, ChevronRight,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import {
  DOSSIERS, ALERTS, SOLDE_VIRTUEL, ACTIVITES_RECENTES,
  APUREMENT_SUBMISSIONS, SECRETAIRES_INSPECTEUR,
} from "@/lib/mock";

const typeIcon = (t: string) => {
  if (t === "creation") return <ArrowUpRight className="h-3.5 w-3.5 text-accent" />;
  if (t === "paiement") return <DollarSign className="h-3.5 w-3.5 text-success" />;
  if (t === "apurement") return <CheckCircle2 className="h-3.5 w-3.5 text-info" />;
  if (t === "alerte") return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
  if (t === "verification") return <FileCheck className="h-3.5 w-3.5 text-accent" />;
  return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
};

export default function InspecteurChefDash() {
  const totalDossiers = DOSSIERS.length;
  const attentePaiement = DOSSIERS.filter(d => d.status === "attente_paiement").length;
  const enCours = DOSSIERS.filter(d => d.status === "en_cours").length;
  const verifies = DOSSIERS.filter(d => d.status === "verifie").length;
  const apures = DOSSIERS.filter(d => d.status === "apure").length;
  const alertesCritiques = ALERTS.filter(a => a.level === "urgent").length;
  const apurementsSoumis = APUREMENT_SUBMISSIONS.filter(a => a.status === "soumis").length;
  const secActifs = SECRETAIRES_INSPECTEUR.filter(s => s.status === "actif").length;

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Inspecteur Chef de Bureau — Vision globale en temps réel" />

      {/* ── WIDGETS STATS ── */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total dossiers" value={totalDossiers} hint={`+${enCours} en cours`} />
        <StatCard icon={Clock} label="Attente paiement" value={attentePaiement} hint="Non visibles tant qu'impayés" />
        <StatCard icon={Activity} label="Dossiers en cours" value={enCours} />
        <StatCard icon={CheckCircle2} label="Validés" value={verifies} />
        <StatCard icon={FileCheck} label="Apurés" value={apures} hint={`${apurementsSoumis} en attente`} />
        <StatCard icon={AlertTriangle} label="Alertes critiques" value={alertesCritiques} hint="Action requise" />
        <StatCard icon={DollarSign} label="Solde virtuel" value={`$${SOLDE_VIRTUEL.soldeNet}`} hint={`Encaissé: $${SOLDE_VIRTUEL.totalEncaisse}`} />
        <StatCard icon={Users} label="Secrétaires actifs" value={secActifs} hint={`${SECRETAIRES_INSPECTEUR.length} total`} />
      </div>

      {/* ── TARIFICATION ── */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Tarification active</span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="rounded-md bg-accent/10 px-3 py-1">Direct — <strong>50$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Transbordement — <strong>50$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Pétrolier — <strong>50$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Vrac — <strong>10$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Lot / Colis — <strong>10$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Déchargement — <strong>10$</strong></span>
          <span className="rounded-md bg-accent/10 px-3 py-1">Autres — <strong>10$</strong></span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── ACTIVITÉ RÉCENTE ── */}
        <div className="lg:col-span-2">
          <Panel title="Activité récente (Timeline)">
            <div className="space-y-0">
              {ACTIVITES_RECENTES.slice(0, 8).map(act => (
                <div key={act.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 shrink-0">
                    {typeIcon(act.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{act.action}</span>
                      <span className="font-mono text-xs text-accent">{act.reference}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{act.user} · {act.date} à {act.heure}</div>
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
                { to: "/app/dossiers", label: "Gérer les dossiers", icon: FolderKanban, desc: "Créer, payer, apurer" },
                { to: "/app/appurement", label: "Supervision apurements", icon: FileCheck, desc: `${apurementsSoumis} en attente` },
                { to: "/app/secretariat", label: "Mes secrétaires", icon: Users, desc: `${secActifs} actifs` },
                { to: "/app/alertes", label: "Alertes", icon: AlertTriangle, desc: `${alertesCritiques} critiques` },
                { to: "/app/entrepots", label: "Entrepôt", icon: TrendingUp, desc: "Flux & parking" },
              ].map(item => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors group">
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

          {/* Mini solde */}
          <div className="rounded-lg border border-border bg-gradient-to-br from-accent/5 to-transparent p-4">
            <div className="text-xs uppercase text-muted-foreground mb-1">Solde net</div>
            <div className="text-2xl font-bold text-accent">${SOLDE_VIRTUEL.soldeNet}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Reçu: ${SOLDE_VIRTUEL.totalEncaisse} · Commissions: ${SOLDE_VIRTUEL.totalCommissions}
            </div>
            <Link to="/app/secretariat" className="text-xs text-accent hover:underline mt-2 inline-block">
              Voir historique →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
