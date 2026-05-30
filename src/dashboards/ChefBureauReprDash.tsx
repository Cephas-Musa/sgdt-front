import { useState } from "react";
import {
  FolderKanban,
  Users,
  Globe,
  Bell,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  DollarSign,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { useApi, apiGetDossiers, apiGetUsers, apiGetAlertes, apiGetRepresentationStats } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export default function ChefBureauReprDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const activeDossiers = (rawDossiers as any[]) || [];

  const { data: rawUsers } = useApi(apiGetUsers);
  const allUsers = (rawUsers as any[]) || [];
  const operators = allUsers.filter((u) => u.role === "operateur_saisie");

  const { data: rawAlertes } = useApi(apiGetAlertes);
  const alertes = (rawAlertes as any[]) || [];

  const { data: reprStats } = useApi(apiGetRepresentationStats);
  const stats = reprStats as any;

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Chef Bureau Représentation — Supervision des opérations et des équipes" />
      
      {/* Quick Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={FolderKanban} 
          label="Dossiers du bureau" 
          value={activeDossiers.length} 
          hint="En attente de validation"
        />
        <StatCard 
          icon={Users} 
          label="Opérateurs Actifs" 
          value={operators.length} 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Représentations du jour" 
          value={stats?.today ?? 0}
          hint={`Total: ${stats?.total ?? 0}`}
        />
        <StatCard 
          icon={Bell} 
          label="Alertes" 
          value={alertes.length}
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
                    {activeDossiers.slice(0, 8).map((d) => (
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
                              {(op.full_name || op.fullName || 'O').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                           </div>
                           <div className="text-xs font-medium">{op.full_name || op.fullName}</div>
                        </div>
                        <Badge variant={op.status === 'actif' || op.status === 'active' ? 'success' : 'destructive'} className="text-[8px]">
                           {op.status || 'actif'}
                        </Badge>
                     </div>
                  ))}
                  {operators.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Aucun opérateur actif</p>
                  )}
                </div>
            </Panel>

         </div>
      </div>
    </div>
  );
}


