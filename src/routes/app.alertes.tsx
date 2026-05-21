import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Bell, 
  Plus, 
  Trash2, 
  DollarSign, 
  History, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Settings2,
  CheckCircle2
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "@/dashboards/_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { ALERTS, SOLDE_VIRTUEL, NOTIFICATIONS } from "@/lib/mock";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/alertes")({
  component: UnifiedAlertsPage,
});

function UnifiedAlertsPage() {
  const [filter, setFilter] = useState("all");
  
  const unreadNotifs = NOTIFICATIONS.filter(n => !n.read).length;
  const urgentAlerts = ALERTS.filter(a => a.level === 'urgent').length;

  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-300 max-w-[1400px] mx-auto w-full">
      <DashHeader subtitle="Supervision du solde, des alertes de sécurité et des notifications" />

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* TOP STATS - COMPACT */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 shrink-0">
          <StatCard
            icon={DollarSign}
            label="Solde Net"
            value={`$${SOLDE_VIRTUEL.soldeNet}`}
            hint={`${SOLDE_VIRTUEL.devise} — Prêt pour retrait`}
          />
          <StatCard
            icon={AlertCircle}
            label="Alertes Urgentes"
            value={urgentAlerts}
            hint="Nécessitent une action"
          />
          <StatCard
            icon={Bell}
            label="Notifications"
            value={unreadNotifs}
            hint="Messages non lus"
          />
        </div>

        {/* MAIN GRID - 3 PANELS */}
        <div className="flex-1 grid gap-6 lg:grid-cols-3 min-h-0 overflow-hidden">
          {/* COL 1: SOLDE HISTORIQUE */}
          <Panel 
            title="Historique Solde" 
            actions={
              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 font-bold uppercase tracking-wider">
                Détails
              </Button>
            }
          >
            <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
              <table className="w-full text-[11px]">
                <tbody className="divide-y divide-border/50">
                  {SOLDE_VIRTUEL.mouvements.map((mv) => (
                    <tr key={mv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5">
                        <div className="flex flex-col">
                          <span className="font-semibold truncate max-w-[140px]">{mv.libelle}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{mv.ref}</span>
                        </div>
                      </td>
                      <td className={`py-2.5 text-right font-bold ${mv.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {mv.type === 'credit' ? '+' : '-'}${mv.montant}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* COL 2: ALERTES LIST */}
          <Panel 
            title="Liste des Alertes"
            actions={
              <FormDialog
                trigger={
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-accent/10">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
                title="Alerte"
                onSubmit={() => toast.success("Alerte ajoutée")}
              >
                <FormGrid>
                  <Field label="Titre" required><Input placeholder="..." /></Field>
                  <Field label="Niveau" required>
                    <Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent></Select>
                  </Field>
                </FormGrid>
              </FormDialog>
            }
          >
            <div className="h-full overflow-y-auto pr-1 space-y-2 scrollbar-hide">
              {ALERTS.map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-6 w-6 rounded flex items-center justify-center shrink-0 ${a.level === 'urgent' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                      <AlertCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[10px] uppercase truncate">{a.title}</h3>
                        <Switch className="scale-[0.65] data-[state=checked]:bg-destructive" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-muted-foreground">{a.date}</span>
                        <button className="text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Détails</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* COL 3: NOTIFICATIONS */}
          <Panel 
            title="Notifications"
            actions={
              <Button variant="ghost" size="sm" className="h-7 text-[9px] font-bold uppercase" onClick={() => toast.success("Toutes lues")}>
                Tout lire
              </Button>
            }
          >
            <div className="h-full overflow-y-auto pr-1 divide-y divide-border/30 scrollbar-hide">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="py-3 first:pt-0 hover:bg-accent/[0.02] transition-colors group">
                  <div className="flex gap-3">
                    <div className={`h-7 w-7 rounded flex items-center justify-center shrink-0 border ${n.read ? 'bg-muted/20 border-border opacity-50' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                      {n.read ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5 animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={`text-[10px] font-bold uppercase truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</h4>
                        <span className="text-[8px] text-muted-foreground">{n.date.split(' ')[0]}</span>
                      </div>
                      <p className="text-[10px] leading-snug text-muted-foreground font-medium line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
