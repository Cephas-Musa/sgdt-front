import { 
  FolderKanban, 
  FileCheck, 
  DollarSign,
  Bell
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Link } from "@tanstack/react-router";
import { DOSSIER_ASSIGNMENTS, ALERTS, SOLDE_VIRTUEL } from "@/lib/mock";
import { SecretaryOperations } from "./inspecteur/SecretaryOperations";

export default function SecretaireInspecteurDash() {
  const totalDossiers = DOSSIER_ASSIGNMENTS.length;
  const apures = DOSSIER_ASSIGNMENTS.filter(
    (d) => d.status === "vérifié" || d.status === "apuré",
  ).length;

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden animate-in fade-in duration-500">
      <DashHeader 
        subtitle="Secrétaire Inspecteur — Gestion administrative & Apurement" 
      />

      {/* STATS QUICK VIEW */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 shrink-0">
        <StatCard 
          icon={FolderKanban} 
          label="Total dossiers" 
          value={totalDossiers} 
          trend="+2"
          compact
        />
        <StatCard 
          icon={FileCheck} 
          label="Dossiers apurés" 
          value={apures} 
          trend="85%"
          compact
        />
        <StatCard
          icon={DollarSign}
          label="Solde Net"
          value={`$${SOLDE_VIRTUEL.soldeNet}`}
          hint="Disponible"
          compact
        />
      </div>

      {/* MAIN OPERATIONS AREA */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <SecretaryOperations />
      </div>

      {/* BOTTOM PANELS */}
      <div className="grid gap-3 lg:grid-cols-5 shrink-0 h-40">
         <Panel title="Solde Virtuel" className="lg:col-span-2">
            <div className="text-[10px] space-y-2">
               <div className="flex justify-between items-center opacity-70">
                  <span>Brut accumulé</span>
                  <span className="font-bold font-mono">${SOLDE_VIRTUEL.soldeBrut}</span>
               </div>
               <div className="flex justify-between items-center text-destructive/80">
                  <span>Commissions (15%)</span>
                  <span className="font-bold font-mono">-${SOLDE_VIRTUEL.commissions}</span>
               </div>
               <div className="pt-2 border-t border-dashed">
                  <div className="flex justify-between items-end text-success">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Net disponible</span>
                    <span className="text-xl font-black font-mono tracking-tighter">${SOLDE_VIRTUEL.soldeNet}</span>
                  </div>
               </div>
            </div>
         </Panel>

         <Panel title="Alertes Récentes" className="lg:col-span-3">
            <div className="h-full overflow-y-auto pr-1 scrollbar-hide space-y-1.5">
               {ALERTS.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors">
                     <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${alert.level === 'urgent' ? 'bg-destructive' : 'bg-warning'}`} />
                     <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold truncate uppercase">{alert.title}</p>
                     </div>
                     <span className="text-[8px] font-mono text-muted-foreground">{alert.date}</span>
                  </div>
               ))}
               {ALERTS.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-4 italic">Aucune alerte</p>
               )}
            </div>
         </Panel>
      </div>
    </div>
  );
}

