import { useState } from "react";
import { FileText, Users, Building2, DollarSign, Plus, Copy, KeyRound } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { EMPTY_MANIFESTS, ENTITES, MEMBRES, ACCOUNTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function ChefManifestDash() {
  const [pwd, setPwd] = useState("");

  const generate = () => {
    const p = Math.random().toString(36).slice(2, 10) + "!";
    setPwd(p);
  };

  const percepteurs = ACCOUNTS.filter((a) => a.role === "percepteur");

  return (
    <div>
      <DashHeader subtitle="Chef Manifest (ACCAD) — manifest, membres, entités, cotisations" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Empty Manifests" value={EMPTY_MANIFESTS.length} />
        <StatCard icon={Users} label="Membres" value={MEMBRES.length} />
        <StatCard icon={Building2} label="Entités" value={ENTITES.length} />
        <StatCard
          icon={DollarSign}
          label="Cotisations"
          value={MEMBRES.filter((m) => m.cotisationPayee).length}
          hint="payées"
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="manifest">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="manifest">Empty Manifest</TabsTrigger>
            <TabsTrigger value="comptes">Comptes utilisateur</TabsTrigger>
            <TabsTrigger value="membres">Membres</TabsTrigger>
            <TabsTrigger value="cotisations">Cotisations</TabsTrigger>
            <TabsTrigger value="honoraires">Honoraires</TabsTrigger>
            <TabsTrigger value="taxes">Taxes provinces</TabsTrigger>
            <TabsTrigger value="agence">Agence en douane</TabsTrigger>
            <TabsTrigger value="petrolier">Produit pétrolier</TabsTrigger>
            <TabsTrigger value="entites">Entités</TabsTrigger>
          </TabsList>

          <TabsContent value="manifest" className="mt-4">
            <Panel title="Liste des Empty Manifests">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Référence</th>
                      <th className="px-3 py-2">Déclarant</th>
                      <th className="px-3 py-2">Véhicule</th>
                      <th className="px-3 py-2">Destination</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EMPTY_MANIFESTS.map((m) => (
                      <tr
                        key={m.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/manifest/$manifestId"
                            params={{ manifestId: m.id }}
                            className="text-accent hover:underline font-mono text-xs"
                          >
                            {m.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{m.declarant}</td>
                        <td className="px-3 py-2">{m.vehicule}</td>
                        <td className="px-3 py-2">{m.destination}</td>
                        <td className="px-3 py-2">{m.date}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              m.status === "payé"
                                ? "bg-success/15 text-success"
                                : m.status === "sortie Ouganda"
                                  ? "bg-info/15 text-info"
                                  : "bg-warning/15 text-warning"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="comptes" className="mt-4">
            <Panel
              title="Agents percepteurs"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouveau percepteur
                    </Button>
                  }
                  title="Créer un agent percepteur"
                  onSubmit={() => toast.success("Agent percepteur créé. Identifiants envoyés.")}
                >
                  <FormGrid>
                    <Field label="Nom" required>
                      <Input />
                    </Field>
                    <Field label="Post-nom" required>
                      <Input />
                    </Field>
                    <Field label="Prénom">
                      <Input />
                    </Field>
                    <Field label="Fonction" required>
                      <Input placeholder="Percepteur" />
                    </Field>
                    <Field label="Taxe">
                      <Input />
                    </Field>
                    <Field label="Numéro de téléphone">
                      <Input />
                    </Field>
                    <Field label="Mot de passe">
                      <div className="flex gap-2">
                        <Input value={pwd} readOnly placeholder="—" />
                        <Button type="button" variant="outline" size="sm" onClick={generate}>
                          <KeyRound className="mr-1 h-3.5 w-3.5" />
                          Générer
                        </Button>
                      </div>
                    </Field>
                  </FormGrid>
                  <div className="flex justify-end mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`Mot de passe: ${pwd || "—"}`);
                        toast.success("Identifiants copiés");
                      }}
                    >
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copier les identifiants
                    </Button>
                  </div>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Rôle</th>
                      <th className="px-3 py-2">Téléphone</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {percepteurs.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/comptes/$compteId"
                            params={{ compteId: p.id }}
                            className="text-accent hover:underline font-medium"
                          >
                            {p.fullName}
                          </Link>
                        </td>
                        <td className="px-3 py-2">Percepteur</td>
                        <td className="px-3 py-2">{p.phone}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${p.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="membres" className="mt-4">
            <Panel
              title="Liste des membres"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouveau membre
                    </Button>
                  }
                  title="Ajouter un membre"
                  onSubmit={() => toast.success("Membre ajouté")}
                >
                  <FormGrid>
                    <Field label="Nom" required>
                      <Input />
                    </Field>
                    <Field label="Post-nom">
                      <Input />
                    </Field>
                    <Field label="Prénom">
                      <Input />
                    </Field>
                    <Field label="Téléphone">
                      <Input />
                    </Field>
                    <Field label="Agence">
                      <Input />
                    </Field>
                  </FormGrid>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Agence</th>
                      <th className="px-3 py-2">Téléphone</th>
                      <th className="px-3 py-2">Cotisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBRES.map((m) => (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">
                          {m.nom} {m.postNom} {m.prenom}
                        </td>
                        <td className="px-3 py-2">{m.agence}</td>
                        <td className="px-3 py-2">{m.telephone}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${m.cotisationPayee ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                          >
                            {m.cotisationPayee ? "Payée" : "Impayée"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="cotisations" className="mt-4">
            <Panel title="Cotisations membres">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Membre</th>
                      <th className="px-3 py-2">Montant</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBRES.map((m) => (
                      <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2">
                          {m.nom} {m.prenom}
                        </td>
                        <td className="px-3 py-2">${m.montantCotisation}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${m.cotisationPayee ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                          >
                            {m.cotisationPayee ? "Payée" : "Impayée"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="honoraires" className="mt-4">
            <Panel title="Paiement honoraires">
              <div className="py-6 text-center text-sm text-muted-foreground">
                Gestion des paiements d'honoraires — données en cours de chargement
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="taxes" className="mt-4">
            <Panel title="Taxes provinces">
              <div className="py-6 text-center text-sm text-muted-foreground">
                Suivi des taxes provinciales — données en cours de chargement
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="agence" className="mt-4">
            <Panel title="Agences en douane">
              <div className="py-6 text-center text-sm text-muted-foreground">
                Liste des agences en douane — données en cours de chargement
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="petrolier" className="mt-4">
            <Panel title="Produit pétrolier">
              <div className="py-6 text-center text-sm text-muted-foreground">
                Suivi des produits pétroliers — données en cours de chargement
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="entites" className="mt-4">
            <Panel
              title="Entités"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouvelle entité
                    </Button>
                  }
                  title="Créer une entité"
                  onSubmit={() => toast.success("Entité créée")}
                >
                  <FormGrid>
                    <Field label="Code entité" required>
                      <Input placeholder="ENT-XX-01" />
                    </Field>
                    <Field label="Dénomination" required>
                      <Input placeholder="Entité Nord-Kivu…" />
                    </Field>
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
                      <th className="px-3 py-2">Agents percepteurs</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ENTITES.map((e) => (
                      <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{e.code}</td>
                        <td className="px-3 py-2 font-medium">{e.denomination}</td>
                        <td className="px-3 py-2">{e.agentsPercepteurs.length} agent(s)</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.info("Fonctionnalité d'ajout de percepteur")}
                          >
                            + Percepteur
                          </Button>
                        </td>
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
