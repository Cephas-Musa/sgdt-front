import { useState } from "react";
import { Building2, Users, Map, Plus, KeyRound, Copy } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { BUREAUX_DOUANIERS, DIRECTIONS_PROVINCIALES, ALERTS, ACCOUNTS, BUREAUX_REPR } from "@/lib/mock";
import { ROLE_LABELS } from "@/lib/roles";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function DirecteurDash() {
  const { lang } = useI18n();
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const directeursProvinciaux = ACCOUNTS.filter(a => a.role === "directeur_provincial");

  const generate = () => { setPwd(Math.random().toString(36).slice(2, 10) + "!"); };

  const allowedRoles = ["directeur_provincial", "inspecteur_chef", "agent_controle"] as const;

  return (
    <div>
      <DashHeader subtitle="Espace Directeur Général — bureaux douaniers, directions provinciales, comptes et notifications" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Bureaux douaniers" value={BUREAUX_DOUANIERS.length} />
        <StatCard icon={Map} label="Directions provinciales" value={DIRECTIONS_PROVINCIALES.length} />
        <StatCard icon={Users} label="Directeurs provinciaux" value={directeursProvinciaux.length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="bureaux">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="bureaux">Bureaux douaniers</TabsTrigger>
            <TabsTrigger value="alertes">Alertes</TabsTrigger>
            <TabsTrigger value="comptes">Comptes</TabsTrigger>
            <TabsTrigger value="directions">Directions provinciales</TabsTrigger>
            <TabsTrigger value="representation">Données représentation</TabsTrigger>
          </TabsList>

          {/* BUREAUX DOUANIERS */}
          <TabsContent value="bureaux" className="mt-4">
            <Panel
              title="Bureaux douaniers"
              actions={
                <FormDialog
                  trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter un bureau</Button>}
                  title="Nouveau bureau douanier"
                  onSubmit={() => toast.success("Bureau douanier créé")}
                >
                  <FormGrid>
                    <Field label="Code bureau" required><Input placeholder="ex: 617B" /></Field>
                    <Field label="Dénomination" required><Input placeholder="ex: KASINDI" /></Field>
                  </FormGrid>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Dénomination</th>
                      <th className="px-3 py-2">ICB</th>
                      <th className="px-3 py-2">Province</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUREAUX_DOUANIERS.map((b) => (
                      <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs">
                          <Link to="/app/bureaux/$bureauId" params={{ bureauId: b.id }} className="text-accent hover:underline">{b.code}</Link>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <Link to="/app/bureaux/$bureauId" params={{ bureauId: b.id }} className="text-accent hover:underline">{b.denomination}</Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{b.icb ?? "—"}</td>
                        <td className="px-3 py-2">{b.province ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <FormDialog
                            trigger={<Button size="sm" variant="ghost">Attribuer ICB</Button>}
                            title={`Attribuer ICB — ${b.denomination}`}
                            onSubmit={() => toast.success("ICB attribuée")}
                          >
                            <Field label="ICB (Inspection)" required><Input placeholder="ex: ICB Nord-Kivu" /></Field>
                          </FormDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* ALERTES */}
          <TabsContent value="alertes" className="mt-4">
            <Panel title="Alertes">
              <ul className="divide-y divide-border text-sm">
                {ALERTS.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3 px-2 hover:bg-muted/30 rounded-md transition-colors cursor-pointer">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.type} · {a.date}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${a.level === "urgent" ? "bg-destructive/15 text-destructive" : a.level === "important" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"}`}>{a.level}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </TabsContent>

          {/* COMPTES */}
          <TabsContent value="comptes" className="mt-4">
            <Panel
              title="Créer un compte subordonné"
              actions={
                <FormDialog
                  trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau compte</Button>}
                  title="Création de compte — Directeur Général"
                  onSubmit={() => toast.success("Compte créé. Identifiants attribués.")}
                >
                  <FormGrid>
                    <Field label="Nom" required><Input /></Field>
                    <Field label="Post-nom" required><Input /></Field>
                    <Field label="Numéro matricule" required><Input /></Field>
                    <Field label="Poste" required>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Sélectionner un poste" /></SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map(r => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r][lang]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Identifiant"><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="auto" /></Field>
                    <Field label="Mot de passe">
                      <div className="flex gap-2">
                        <Input value={pwd} readOnly placeholder="—" />
                        <Button type="button" variant="outline" size="sm" onClick={generate}><KeyRound className="mr-1 h-3.5 w-3.5" />Générer</Button>
                      </div>
                    </Field>
                  </FormGrid>
                  <div className="flex justify-end mt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      navigator.clipboard.writeText(`Identifiant: ${username || "—"}\nMot de passe: ${pwd || "—"}`);
                      toast.success("Identifiants copiés");
                    }}><Copy className="mr-1 h-3.5 w-3.5" />Copier les identifiants</Button>
                  </div>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Rôle</th><th className="px-3 py-2">Matricule</th><th className="px-3 py-2">Statut</th></tr>
                  </thead>
                  <tbody>
                    {ACCOUNTS.filter(a => ["directeur_provincial", "inspecteur_chef", "agent_controle"].includes(a.role)).map(a => (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { }}>
                        <td className="px-3 py-2">
                          <Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline font-medium">{a.fullName}</Link>
                        </td>
                        <td className="px-3 py-2">{ROLE_LABELS[a.role]?.[lang] ?? a.role}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* DIRECTIONS PROVINCIALES */}
          <TabsContent value="directions" className="mt-4">
            <Panel
              title="Directions provinciales"
              actions={
                <FormDialog
                  trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Ajouter</Button>}
                  title="Nouvelle direction provinciale"
                  onSubmit={() => toast.success("Direction provinciale créée")}
                >
                  <Field label="Dénomination (province)" required><Input placeholder="ex: NORD-KIVU" /></Field>
                  <Field label="Directeur provincial"><Input placeholder="Nom complet" /></Field>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Dénomination</th>
                      <th className="px-3 py-2">Nombre bureaux</th>
                      <th className="px-3 py-2">Directeur</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {DIRECTIONS_PROVINCIALES.map((d) => (
                      <tr key={d.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">{d.numero}</td>
                        <td className="px-3 py-2">
                          <Link to="/app/directions/$directionId" params={{ directionId: d.id }} className="text-accent hover:underline font-medium">{d.denomination}</Link>
                        </td>
                        <td className="px-3 py-2">{d.nombreBureaux}</td>
                        <td className="px-3 py-2 text-muted-foreground">{d.directeur}</td>
                        <td className="px-3 py-2 text-right flex gap-1 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => toast.info("Ajout entité")}>+ Entité</Button>
                          <Button size="sm" variant="ghost" onClick={() => toast.info("Ajout directeur")}>+ Directeur</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* DONNÉES REPRÉSENTATION */}
          <TabsContent value="representation" className="mt-4">
            <Panel title="Données de bureau de représentation">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Dénomination</th><th className="px-3 py-2">Type</th></tr>
                  </thead>
                  <tbody>
                    {BUREAUX_REPR.map((b) => (
                      <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{b.code}</td>
                        <td className="px-3 py-2">{b.denomination}</td>
                        <td className="px-3 py-2 capitalize">{b.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
