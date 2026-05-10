import { useState } from "react";
import { FileText, Users, DollarSign, Plus, KeyRound, Search } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, EMPTY_MANIFESTS, ACCOUNTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function ChefBarriereDash() {
  const { user } = useAuth();
  const [pwd, setPwd] = useState("");
  const generate = () => setPwd(Math.random().toString(36).slice(2, 10) + "!");
  const typingOps = ACCOUNTS.filter(a => a.role === "typing_operator");
  const canSeeAmount = user?.role === "super_admin";
  const dossiersTotal = DOSSIERS.reduce((s, d) => s + d.montant, 0);
  const emptyManifestTotal = canSeeAmount ? EMPTY_MANIFESTS.reduce((s, m) => s + m.montant, 0) : 0;
  const totalGain = canSeeAmount ? dossiersTotal + emptyManifestTotal : 0;

  return (
    <div>
      <DashHeader subtitle="Chef Barrière Ouganda — docs, empty manifest, balance, utilisateurs" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Docs" value={DOSSIERS.length} />
        <StatCard icon={FileText} label="Empty manifests" value={EMPTY_MANIFESTS.length} />
        <StatCard icon={DollarSign} label="Balance totale" value={canSeeAmount ? `$${totalGain}` : "Confidentiel"} />
        <StatCard icon={Users} label="Typing operators" value={typingOps.length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="docs">
          <TabsList>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="mt-4">
            <Panel title="Documents">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Réf.</th><th className="px-3 py-2">Importateur</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Montant</th><th className="px-3 py-2">Date</th></tr></thead>
                  <tbody>{DOSSIERS.slice(0, 12).map(d => (<tr key={d.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2"><Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline font-mono text-xs">{d.reference}</Link></td><td className="px-3 py-2">{d.importateur}</td><td className="px-3 py-2 capitalize">{d.type}</td><td className="px-3 py-2">${d.montant}</td><td className="px-3 py-2">{d.date}</td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="manifest" className="mt-4">
            <Panel title="Empty Manifests">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Réf.</th><th className="px-3 py-2">Déclarant</th><th className="px-3 py-2">Véhicule</th><th className="px-3 py-2">Montant</th><th className="px-3 py-2">Statut</th></tr></thead>
                  <tbody>{EMPTY_MANIFESTS.map(m => (<tr key={m.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2"><Link to="/app/manifest/$manifestId" params={{ manifestId: m.id }} className="text-accent hover:underline font-mono text-xs">{m.reference}</Link></td><td className="px-3 py-2">{m.declarant}</td><td className="px-3 py-2">{m.vehicule}</td><td className="px-3 py-2">{canSeeAmount ? `$${m.montant}` : <span className="text-muted-foreground">Confidentiel</span>}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{m.status}</span></td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            <Panel title="Balance — total des gains">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4 text-center"><div className="text-xs text-muted-foreground uppercase">Dossiers</div><div className="mt-1 text-2xl font-bold">${dossiersTotal}</div><div className="text-xs text-muted-foreground">{DOSSIERS.length} dossiers</div></div>
                <div className="rounded-lg border border-border p-4 text-center"><div className="text-xs text-muted-foreground uppercase">Empty Manifests</div><div className="mt-1 text-2xl font-bold">{canSeeAmount ? `$${emptyManifestTotal}` : "Confidentiel"}</div><div className="text-xs text-muted-foreground">{EMPTY_MANIFESTS.length} manifests</div></div>
                <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center"><div className="text-xs text-success uppercase">Total gains</div><div className="mt-1 text-2xl font-bold text-success">{canSeeAmount ? `$${totalGain}` : "Confidentiel"}</div><div className="text-xs text-muted-foreground">Pourcentage applicable</div></div>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <Panel title="Typing Operators" actions={
              <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Create</Button>} title="Create Typing Operator" onSubmit={() => toast.success("Typing operator created")}>
                <FormGrid>
                  <Field label="Name" required><Input /></Field>
                  <Field label="Middle name"><Input /></Field>
                  <Field label="Last name" required><Input /></Field>
                  <Field label="Number"><Input /></Field>
                  <Field label="Password">
                    <div className="flex gap-2"><Input value={pwd} readOnly /><Button type="button" variant="outline" size="sm" onClick={generate}><KeyRound className="mr-1 h-3.5 w-3.5" />Generate</Button></div>
                  </Field>
                </FormGrid>
              </FormDialog>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Matricule</th><th className="px-3 py-2">Statut</th></tr></thead>
                  <tbody>{typingOps.map(a => (<tr key={a.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2"><Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline">{a.fullName}</Link></td><td className="px-3 py-2 font-mono text-xs">{a.matricule}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span></td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
