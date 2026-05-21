import { useState } from "react";
import {
  FolderKanban,
  Users,
  Globe,
  Bell,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { 
  DOSSIERS, 
  ACCOUNTS, 
  ALERTS 
} from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export default function ChefBureauReprDash() {
  const operators = ACCOUNTS.filter((a) => a.role === "operateur_saisie");

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Chef Bureau Représentation — Supervision des opérations et des équipes" />
      
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={FolderKanban} 
          label="Dossiers du bureau" 
          value={DOSSIERS.length} 
          hint="En attente de validation"
        />
        <StatCard 
          icon={Users} 
          label="Opérateurs Actifs" 
          value={operators.length} 
        />
        <StatCard 
          icon={Activity} 
          label="Performance" 
          value="94%" 
          hint="Taux de traitement"
        />
        <StatCard 
          icon={Bell} 
          label="Notifications" 
          value={ALERTS.length} 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* Main Summary */}
         <div className="lg:col-span-2 space-y-6">
            <Panel 
              title="Dossiers Récents"
              actions={
                <Link to="/app/dossiers" className="text-xs text-accent font-bold hover:underline flex items-center gap-1">
                  Gérer tout <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-3">Réf.</th>
                      <th className="px-3 py-3">Importateur</th>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {DOSSIERS.slice(0, 8).map((d) => (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs text-accent font-bold">{d.reference}</td>
                        <td className="px-3 py-3 font-medium">{d.importateur}</td>
                        <td className="px-3 py-3 text-xs">{d.date}</td>
                        <td className="px-3 py-3">
                          <Badge variant={d.status === 'paye' ? 'success' : 'warning'} className="text-[9px] uppercase">
                            {d.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
         </div>

         {/* Side Info */}
         <div className="space-y-6">
            <Panel 
              title="État des Opérateurs"
              actions={
                <Link to="/app/comptes" className="text-xs text-accent font-bold hover:underline">
                  Voir tout
                </Link>
              }
            >
               <div className="space-y-4">
                  {operators.slice(0, 4).map(op => (
                     <div key={op.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-[10px]">
                              {op.fullName.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className="text-xs font-medium">{op.fullName}</div>
                        </div>
                        <Badge variant={op.status === 'actif' ? 'success' : 'destructive'} className="text-[8px]">
                           {op.status}
                        </Badge>
                     </div>
                  ))}
               </div>
            </Panel>

            <Panel title="Système">
               <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-3">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="h-5 w-5 text-accent" />
                     <p className="text-xs font-bold uppercase tracking-wider">Sécurité OK</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                     Votre session est sécurisée. Toutes les modifications de données de référence (Locodes, Pays) sont tracées par le système provincial.
                  </p>
               </div>
            </Panel>
         </div>
      </div>
    </div>
  );
}


