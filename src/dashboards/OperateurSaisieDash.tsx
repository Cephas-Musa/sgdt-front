import { useState } from "react";
import { FolderKanban, Globe, MapPin, DollarSign, Bell, Plus, Search } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, LOCODES, PAYS, DEVISES, NOTIFICATIONS, BUREAUX_REPR } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function OperateurSaisieDash() {
  const [searchRef, setSearchRef] = useState("");
  const [expandedDossier, setExpandedDossier] = useState<string | null>(null);
  const filtered = DOSSIERS.filter(d => !searchRef || d.reference.toLowerCase().includes(searchRef.toLowerCase()));

  return (
    <div>
      <DashHeader subtitle="Opérateur Saisie — dossiers, locode, pays, devises, notifications" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers" value={DOSSIERS.length} />
        <StatCard icon={Globe} label="Locodes" value={LOCODES.length} />
        <StatCard icon={DollarSign} label="Devises" value={DEVISES.length} />
        <StatCard icon={Bell} label="Notifications" value={NOTIFICATIONS.filter(n => !n.read).length} />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="dossiers">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="nouveau">Nouveau dossier</TabsTrigger>
            <TabsTrigger value="locode">Locode</TabsTrigger>
            <TabsTrigger value="pays">Pays</TabsTrigger>
            <TabsTrigger value="devises">Devises</TabsTrigger>
            <TabsTrigger value="notifs">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="dossiers" className="mt-4 space-y-4">
            <div className="flex gap-3"><Input placeholder="Recherche par référence…" value={searchRef} onChange={e => setSearchRef(e.target.value)} className="max-w-xs" /><Button variant="outline" onClick={() => setSearchRef("")}>Réinitialiser</Button></div>
            <Panel title={`Liste des dossiers (${filtered.length})`}>
              <div className="space-y-3">
                {filtered.slice(0, 15).map((d, index) => (
                  <div key={d.id} className="border border-border rounded-lg overflow-hidden hover:bg-muted/30 transition">
                    {/* Dossier Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-muted/20 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">N°</span>
                        <p className="font-mono font-semibold text-accent">{index + 1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Bureau</span>
                        <p className="font-semibold">{d.bureauRepr}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Importateur</span>
                        <p className="font-semibold">{d.importateur}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">DRA</span>
                        <p className="font-semibold">{d.dra}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">T1</span>
                        <p className="font-semibold">{d.t1}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Date</span>
                        <p className="font-semibold">{d.date}</p>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 p-3 text-sm border-t border-border">
                      <div>
                        <span className="text-xs text-muted-foreground">Véhicule</span>
                        <p className="font-semibold">{d.vehicule}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Devise</span>
                        <p className="font-semibold">{d.devise}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Marchandise</span>
                        <p className="font-semibold">{d.typeMarchandises}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Contenaire</span>
                        <p className="font-semibold">{d.colis}x{d.poids > 500 ? "40" : "20"}</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <FormDialog
                          trigger={
                            <Button size="sm" className="w-full">
                              <Plus className="mr-1.5 h-4 w-4" />
                              Ajouter article
                            </Button>
                          }
                          title="Ajouter un article"
                          onSubmit={() => toast.success("Article ajouté")}
                        >
                          <FormGrid>
                            <Field label="Désignation" required><Input /></Field>
                            <Field label="Position tarifaire" required><Input /></Field>
                            <Field label="Quantité" required><Input type="number" /></Field>
                            <Field label="Poids (kg)" required><Input type="number" /></Field>
                            <Field label="FOB" required><Input type="number" /></Field>
                          </FormGrid>
                        </FormDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>

          {/* SEGMENT GÉNÉRAL — formulaire opérateur saisie */}
          <TabsContent value="nouveau" className="mt-4">
            <Panel title="Segment général — Nouveau dossier">
              <form onSubmit={e => { e.preventDefault(); toast.success("Dossier enregistré"); }} className="space-y-4">
                <FormGrid>
                  <Field label="Importateur" required><Input placeholder="Nom de l'importateur" /></Field>
                  <Field label="NIF" required><Input placeholder="NIF de l'importateur" /></Field>
                  <Field label="Code bureau étranger" required>
                    <div className="flex gap-2">
                      <Input placeholder="Code (ex: UGMPO)" className="max-w-[120px]" />
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence DRA (E-XXX)" required><Input placeholder="E-001" /></Field>
                    <Field label="Sa date" required><Input type="date" /></Field>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <Field label="Référence T1" required><Input placeholder="T1-…" /></Field>
                    <Field label="Sa date" required><Input type="date" /></Field>
                  </div>
                  <Field label="Immatriculation avant" required><Input placeholder="AA 0000 XY" /></Field>
                  <Field label="Immatriculation arrière"><Input placeholder="BB 0000 ZA" /></Field>
                  <Field label="Devise" required>
                    <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{DEVISES?.map(d => <SelectItem key={d.id} value={d.codeDevise}>{d.codeDevise} — {d.denomination}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Pays de provenance" required>
                    <div className="flex gap-2">
                      <Select><SelectTrigger className="max-w-[100px]"><SelectValue placeholder="Code" /></SelectTrigger>
                        <SelectContent>{PAYS?.map(p => <SelectItem key={p.id} value={p.code}>{p.code}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                  <Field label="Numéro centenaire"><Input /></Field>
                  <Field label="Conteneur">
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> 1x40</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> 1x20</label>
                    </div>
                  </Field>
                  <Field label="Incoterm"><Input placeholder="FOB, CIF, etc." /></Field>
                  <Field label="Bureau de sortie" required>
                    <div className="flex gap-2">
                      <Select><SelectTrigger className="max-w-[120px]"><SelectValue placeholder="Code" /></SelectTrigger>
                        <SelectContent>{BUREAUX_REPR?.filter(b => b.type === "sortie").map(b => <SelectItem key={b.id} value={b.code}>{b.code}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Dénomination (auto)" readOnly className="bg-muted/30" />
                    </div>
                  </Field>
                </FormGrid>
                <Button type="submit">Enregistrer</Button>
              </form>
            </Panel>

            {/* Articles */}
            <div className="mt-4">
              <Panel title="Articles du dossier" actions={
                <FormDialog trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter article</Button>} title="Ajouter un article" onSubmit={() => toast.success("Article ajouté")}>
                  <FormGrid>
                    <Field label="Désignation" required><Input /></Field>
                    <Field label="Position tarifaire" required><Input /></Field>
                    <Field label="Quantité" required><Input type="number" /></Field>
                    <Field label="Poids (kg)" required><Input type="number" /></Field>
                    <Field label="FoB" required><Input type="number" /></Field>
                  </FormGrid>
                </FormDialog>
              }>
                <div className="py-4 text-center text-sm text-muted-foreground">Aucun article. Utilisez le bouton "Ajouter article" pour commencer.</div>
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

          <TabsContent value="notifs" className="mt-4">
            <Panel title="Notifications">
              <ul className="divide-y divide-border text-sm">{NOTIFICATIONS.map(n => (<li key={n.id} className="flex items-start gap-3 py-3 px-2"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-accent"}`} /><div><div className="font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.message} · {n.date}</div></div></li>))}</ul>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
