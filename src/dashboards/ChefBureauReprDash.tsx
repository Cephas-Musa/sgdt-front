import { useState } from "react";
import { FolderKanban, Users, Settings, Globe, Plus, KeyRound, Copy, DollarSign } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, BUREAUX_DOUANIERS, ACCOUNTS, LOCODES, PAYS, DEVISES, BUREAUX_REPR } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function ChefBureauReprDash() {
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const generate = () => setPwd(Math.random().toString(36).slice(2, 10) + "!");
  const operateurs = ACCOUNTS.filter(a => a.role === "operateur_saisie");

  return (
    <div>
      <DashHeader subtitle="Chef Bureau Représentation — dossiers, comptes, configuration, locode, pays, devises" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard icon={Users} label="Opérateurs" value={operateurs.length} />
        <StatCard icon={Globe} label="Locodes" value={LOCODES.length} />
        <StatCard icon={DollarSign} label="Devises" value={DEVISES.length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="comptes">Comptes</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="locode">Locode</TabsTrigger>
            <TabsTrigger value="pays">Pays</TabsTrigger>
            <TabsTrigger value="devises">Devises</TabsTrigger>
          </TabsList>

          <TabsContent value="dossiers" className="mt-4">
            <Panel title="Dossiers (facturés par dossier & par bureau)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th><th className="px-3 py-2">Réf.</th><th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Bureau repr.</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Montant</th><th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOSSIERS.slice(0, 15).map((d, i) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2"><Link to="/app/dossiers/$dossierId" params={{ dossierId: d.id }} className="text-accent hover:underline font-mono text-xs">{d.reference}</Link></td>
                        <td className="px-3 py-2">{d.importateur}</td>
                        <td className="px-3 py-2">{d.bureauRepr}</td>
                        <td className="px-3 py-2 capitalize">{d.type}</td>
                        <td className="px-3 py-2 font-medium">${d.montant}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${d.status === "paye" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{d.status.replace("_"," ")}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="comptes" className="mt-4">
            <Panel title="Comptes opérateurs" actions={
              <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau compte</Button>} title="Créer un opérateur de saisie" onSubmit={() => toast.success("Compte créé")}>
                <FormGrid>
                  <Field label="Nom" required><Input /></Field>
                  <Field label="Post-nom" required><Input /></Field>
                  <Field label="Prénom"><Input /></Field>
                  <Field label="Matricule" required><Input /></Field>
                  <Field label="Poste"><Input value="Opérateur saisie" readOnly /></Field>
                  <Field label="Bureau douanier" required>
                    <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{BUREAUX_DOUANIERS.map(b => <SelectItem key={b.id} value={b.code}>{b.code} · {b.denomination}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Identifiant"><Input value={username} onChange={e => setUsername(e.target.value)} /></Field>
                  <Field label="Mot de passe">
                    <div className="flex gap-2"><Input value={pwd} readOnly /><Button type="button" variant="outline" size="sm" onClick={generate}><KeyRound className="mr-1 h-3.5 w-3.5" />Générer</Button></div>
                  </Field>
                </FormGrid>
                <div className="flex justify-end mt-2"><Button type="button" variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(`ID: ${username}\nMDP: ${pwd}`); toast.success("Copiés"); }}><Copy className="mr-1 h-3.5 w-3.5" />Copier identifiants</Button></div>
              </FormDialog>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Bureau</th><th className="px-3 py-2">Matricule</th><th className="px-3 py-2">Statut</th></tr></thead>
                  <tbody>{operateurs.map(a => (<tr key={a.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2"><Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline">{a.fullName}</Link></td><td className="px-3 py-2">{a.bureau ?? "—"}</td><td className="px-3 py-2 font-mono text-xs">{a.matricule}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span></td></tr>))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="config" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Bureau sortie (pays étranger)" actions={<FormDialog trigger={<Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Ajouter</Button>} title="Bureau de sortie" onSubmit={() => toast.success("Ajouté")}><FormGrid><Field label="Code" required><Input placeholder="UGMPO" /></Field><Field label="Dénomination" required><Input placeholder="MPONDWE" /></Field></FormGrid></FormDialog>}>
                <div className="space-y-2">{BUREAUX_REPR.filter(b => b.type === "sortie").map(b => (<div key={b.id} className="flex gap-2 rounded border border-border p-3"><Input value={b.code} readOnly className="max-w-[100px] font-mono" /><Input value={b.denomination} readOnly /></div>))}</div>
              </Panel>
              <Panel title="Bureau entrée pays (RDC)" actions={<FormDialog trigger={<Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Ajouter</Button>} title="Bureau d'entrée" onSubmit={() => toast.success("Ajouté")}><FormGrid><Field label="Code" required><Input placeholder="617B" /></Field><Field label="Dénomination" required><Input placeholder="KASINDI" /></Field></FormGrid></FormDialog>}>
                <div className="space-y-2">{BUREAUX_REPR.filter(b => b.type === "entree").map(b => (<div key={b.id} className="flex gap-2 rounded border border-border p-3"><Input value={b.code} readOnly className="max-w-[100px] font-mono" /><Input value={b.denomination} readOnly /></div>))}</div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="locode" className="mt-4">
            <Panel title="Locodes" actions={<FormDialog trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>} title="Locode" onSubmit={() => toast.success("Ajouté")}><FormGrid><Field label="Code" required><Input /></Field><Field label="Désignation" required><Input /></Field><Field label="Code pays" required><Input /></Field><Field label="Dénomination" required><Input /></Field></FormGrid></FormDialog>}>
              <table className="w-full text-sm"><thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Désignation</th><th className="px-3 py-2">Code pays</th><th className="px-3 py-2">Dénomination</th></tr></thead>
              <tbody>{LOCODES.map(l => (<tr key={l.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{l.code}</td><td className="px-3 py-2">{l.designation}</td><td className="px-3 py-2 font-mono">{l.codePays}</td><td className="px-3 py-2">{l.denomination}</td></tr>))}</tbody></table>
            </Panel>
          </TabsContent>

          <TabsContent value="pays" className="mt-4">
            <Panel title="Pays" actions={<FormDialog trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>} title="Pays" onSubmit={() => toast.success("Ajouté")}><FormGrid><Field label="Code" required><Input /></Field><Field label="Désignation" required><Input /></Field></FormGrid></FormDialog>}>
              <table className="w-full text-sm"><thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Désignation</th></tr></thead>
              <tbody>{PAYS.map(p => (<tr key={p.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{p.code}</td><td className="px-3 py-2">{p.designation}</td></tr>))}</tbody></table>
            </Panel>
          </TabsContent>

          <TabsContent value="devises" className="mt-4">
            <Panel title="Devises" actions={<FormDialog trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>} title="Devise" onSubmit={() => toast.success("Ajouté")}><FormGrid><Field label="Code pays" required><Input /></Field><Field label="Code devise" required><Input /></Field><Field label="Dénomination" required><Input /></Field></FormGrid></FormDialog>}>
              <table className="w-full text-sm"><thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Code pays</th><th className="px-3 py-2">Code devise</th><th className="px-3 py-2">Dénomination</th></tr></thead>
              <tbody>{DEVISES.map(d => (<tr key={d.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono">{d.codePays}</td><td className="px-3 py-2 font-mono">{d.codeDevise}</td><td className="px-3 py-2">{d.denomination}</td></tr>))}</tbody></table>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
