import { useState } from "react";
import { 
  Building2, 
  Bell, 
  Users, 
  FolderKanban, 
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { 
  DOSSIERS, 
  ACCOUNTS, 
  BUREAUX_DOUANIERS, 
  ALERTS 
} from "@/lib/mock";
import { useApi, apiGetDossiers } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function DirecteurProvincialDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = rawDossiers as any[] || [];

  const bureaux = BUREAUX_DOUANIERS;
  const comptes = ACCOUNTS.filter(a => ["inspecteur_chef", "agent_controle", "chef_bureau_repr", "chef_barriere"].includes(a.role));

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Directeur Provincial — Supervision et analyse de l'activité provinciale" />
      
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={FolderKanban} 
          label="Dossiers Provinciaux" 
          value={activeDossiers.length} 
          hint="Volume total province"
        />
        <StatCard 
          icon={Building2} 
          label="Bureaux Actifs" 
          value={bureaux.length} 
          hint="Nord-Kivu"
        />
        <StatCard 
          icon={Activity} 
          label="Taux de Traitement" 
          value="88%" 
          hint="+2% cette semaine"
        />
        <StatCard 
          icon={Bell} 
          label="Alertes Critiques" 
          value={ALERTS.filter(a => a.level === 'urgent').length} 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bureaux Douaniers */}
        <Panel
          title="Bureaux douaniers de la province"
          actions={
            <Link to="/app/barrieres" className="text-xs text-accent font-bold hover:underline flex items-center gap-1">
              Tout voir <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {bureaux.slice(0, 6).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded bg-accent/10 flex items-center justify-center text-accent font-bold text-[10px]">
                      {b.code}
                   </div>
                   <div>
                      <div className="text-sm font-bold">{b.denomination}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">ICB: {b.icb || "—"}</div>
                   </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold">ACTIF</Badge>
              </div>
            ))}
          </div>
        </Panel>

        {/* Subordonnés Directs */}
        <Panel
          title="Supervision des Équipes"
          actions={
            <Link to="/app/comptes" className="text-xs text-accent font-bold hover:underline">
              Gérer les comptes
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {comptes.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {c.fullName.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                      <div className="text-sm font-bold">{c.fullName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">
                        {c.role.replace(/_/g, ' ')} · {c.bureau || "PROVINCE"}
                      </div>
                   </div>
                </div>
                <Badge 
                  className={`text-[9px] font-bold uppercase ${c.status === "actif" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}`}
                >
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Activity Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
         <Panel title="Tendances Mensuelles" className="lg:col-span-2">
            <div className="h-48 flex items-end gap-2 px-4 pb-4">
               {[40, 65, 55, 80, 95, 70, 85, 90, 100, 75, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-accent/20 rounded-t-sm hover:bg-accent transition-colors group relative" style={{ height: `${h}%` }}>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {h} dossiers
                     </div>
                  </div>
               ))}
            </div>
            <div className="flex justify-between px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest pt-2 border-t">
               <span>Jan</span>
               <span>Mai</span>
               <span>Déc</span>
            </div>
         </Panel>

         <Panel title="Sécurité & Accès">
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-3">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="h-5 w-5 text-accent" />
                     <p className="text-xs font-bold uppercase tracking-wider">Accès Provincial Sécurisé</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                     Votre profil de Directeur Provincial vous donne accès à la supervision de tous les bureaux de la province du Nord-Kivu.
                  </p>
               </div>
               <Button variant="outline" className="w-full h-9 text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                  Journal des audits
               </Button>
            </div>
         </Panel>
      </div>
    </div>
  );
}
