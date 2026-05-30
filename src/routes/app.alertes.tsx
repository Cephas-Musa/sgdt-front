import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Bell, 
  Plus, 
  DollarSign, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  Loader2
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
import { useApi, apiGetAlertes, apiGetTransactions } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/app/alertes")({
  component: UnifiedAlertsPage,
});

function UnifiedAlertsPage() {
  const [filter, setFilter] = useState("all");

  const { data: rawAlertes, loading: alertesLoading } = useApi(apiGetAlertes);
  const { data: rawTransactions, loading: transLoading } = useApi(apiGetTransactions);

  type Alerte = { id: number; title?: string; message?: string; type: string; is_read: boolean; created_at: string };
  type Transaction = { id: number; reference: string; type: string; amount: number; currency?: string; created_at: string; description?: string };

  const alertes = (rawAlertes as Alerte[] ?? []);
  const transactions = (rawTransactions as Transaction[] ?? []);

  const urgentAlerts = alertes.filter(a => a.type === "urgent" || a.type === "litige").length;
  const unreadNotifs = alertes.filter(a => !a.is_read).length;

  // Solde calculé depuis les transactions
  const soldeNet = transactions.reduce((s, t) => t.type === "credit" ? s + Number(t.amount) : s - Number(t.amount), 0);

  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-300 max-w-[1400px] mx-auto w-full">
      <DashHeader subtitle="Supervision du solde et des alertes de sécurité" />

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* TOP STATS */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 shrink-0">
          <StatCard
            icon={DollarSign}
            label="Solde Net"
            value={transLoading ? "…" : `$${soldeNet.toLocaleString()}`}
            hint="USD — Prêt pour retrait"
          />
          <StatCard
            icon={AlertCircle}
            label="Alertes Urgentes"
            value={alertesLoading ? "…" : urgentAlerts}
            hint="Nécessitent une action"
          />
        </div>

        {/* MAIN GRID - 3 PANELS */}
        <div className="flex-1 grid gap-6 lg:grid-cols-2 min-h-0 overflow-hidden">
          {/* COL 1: HISTORIQUE TRANSACTIONS */}
          <Panel 
            title="Historique Transactions" 
            actions={
              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 font-bold uppercase tracking-wider">
                Détails
              </Button>
            }
          >
            <div className="h-full overflow-y-auto pr-1 scrollbar-hide">
              {transLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Aucune transaction</p>
              ) : (
                <table className="w-full text-[11px]">
                  <tbody className="divide-y divide-border/50">
                    {transactions.slice(0, 20).map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span className="font-semibold truncate max-w-[140px]">{t.description ?? t.reference}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">{t.reference}</span>
                          </div>
                        </td>
                        <td className={`py-2.5 text-right font-bold ${t.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                          {t.type === 'credit' ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
                          ${Number(t.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
              {alertesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : alertes.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">Aucune alerte</p>
              ) : (
                alertes.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-6 w-6 rounded flex items-center justify-center shrink-0 ${a.type === 'urgent' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                        <AlertCircle className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-[10px] uppercase truncate">{a.title ?? a.message ?? "—"}</h3>
                          <Switch className="scale-[0.65] data-[state=checked]:bg-destructive" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground">{a.created_at?.split("T")[0]}</span>
                          <button className="text-[9px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Détails</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
