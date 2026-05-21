import { useState } from "react";
import {
  Building2,
  Users,
  Map,
  Plus,
  KeyRound,
  Copy,
  Settings2,
  Bell,
  CheckCircle2,
  XCircle,
  Edit,
  Eye,
  UserPlus,
} from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";
import {
  BUREAUX_DOUANIERS,
  DIRECTIONS_PROVINCIALES,
  ALERTS,
  ACCOUNTS,
  BUREAUX_REPR,
  type BureauRepresentation,
} from "@/lib/mock";
import { ROLE_LABELS } from "@/lib/roles";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function DirecteurDash() {
  const { lang } = useI18n();
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>([
    "fraude",
    "incoherence",
    "paiement",
    "retard",
  ]);

  const directeursProvinciaux = ACCOUNTS.filter((a) => a.role === "directeur_provincial");

  const generate = () => {
    setPwd(Math.random().toString(36).slice(2, 10) + "!");
  };

  const allowedRoles = ["directeur", "chef_bureau_repr", "operateur_saisie"] as const;

  return (
    <div>
      <DashHeader subtitle="Espace Directeur Général — bureaux douaniers, directions provinciales, comptes et notifications" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Bureaux douaniers" value={BUREAUX_DOUANIERS.length} />
        <StatCard
          icon={Map}
          label="Directions provinciales"
          value={DIRECTIONS_PROVINCIALES.length}
        />
        <StatCard
          icon={Users}
          label="Directeurs provinciaux"
          value={directeursProvinciaux.length}
        />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="bureaux">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="bureaux">Bureaux douaniers</TabsTrigger>
            <TabsTrigger value="representation">Bureaux de représentation</TabsTrigger>
            <TabsTrigger value="alertes">Alertes</TabsTrigger>
            <TabsTrigger value="comptes">Comptes</TabsTrigger>
            <TabsTrigger value="directions">Directions provinciales</TabsTrigger>
          </TabsList>

          {/* BUREAUX DOUANIERS */}
          <TabsContent value="bureaux" className="mt-4">
            <Panel
              title="Bureaux douaniers"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Ajouter un bureau
                    </Button>
                  }
                  title="Nouveau bureau douanier"
                  onSubmit={() => toast.success("Bureau douanier créé")}
                >
                  <FormGrid>
                    <Field label="Code bureau" required>
                      <Input placeholder="ex: 617B" />
                    </Field>
                    <Field label="Dénomination" required>
                      <Input placeholder="ex: KASINDI" />
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
                      <th className="px-3 py-2">ICB</th>
                      <th className="px-3 py-2">Province</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUREAUX_DOUANIERS.map((b) => (
                      <tr
                        key={b.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2 font-mono text-xs">
                          <Link
                            to="/app/bureaux/$bureauId"
                            params={{ bureauId: b.id }}
                            className="text-accent hover:underline"
                          >
                            {b.code}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <Link
                            to="/app/bureaux/$bureauId"
                            params={{ bureauId: b.id }}
                            className="text-accent hover:underline"
                          >
                            {b.denomination}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{b.icb ?? "—"}</td>
                        <td className="px-3 py-2">{b.province ?? "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="ghost">
                                Attribuer ICB
                              </Button>
                            }
                            title={`Attribuer ICB — ${b.denomination}`}
                            onSubmit={() => toast.success("ICB attribuée")}
                          >
                            <Field label="ICB (Inspection)" required>
                              <Input placeholder="ex: ICB Nord-Kivu" />
                            </Field>
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
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <Panel title="Configuration des alertes">
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground mb-4">
                    Choisissez les types d'alertes à surveiller sur l'ensemble des bureaux.
                  </p>
                  {[
                    { id: "fraude", label: "Fraude", color: "bg-destructive" },
                    { id: "incoherence", label: "Incohérence", color: "bg-warning" },
                    { id: "paiement", label: "Paiement", color: "bg-info" },
                    { id: "retard", label: "Retard", color: "bg-orange-500" },
                  ].map((type) => (
                    <div
                      key={type.id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={selectedAlertTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedAlertTypes([...selectedAlertTypes, type.id]);
                          else
                            setSelectedAlertTypes(selectedAlertTypes.filter((t) => t !== type.id));
                        }}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${type.color}`} />
                        <label
                          htmlFor={`type-${type.id}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {type.label}
                        </label>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() =>
                      setSelectedAlertTypes(["fraude", "incoherence", "paiement", "retard"])
                    }
                  >
                    Tout cocher
                  </Button>
                </div>
              </Panel>

              <Panel title="Alertes par bureau">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                      <tr>
                        <th className="px-3 py-2">Code Bureau</th>
                        <th className="px-3 py-2">Nom du Bureau</th>
                        <th className="px-3 py-2">Type d'alerte</th>
                        <th className="px-3 py-2">Message</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ALERTS.filter((a) => selectedAlertTypes.includes(a.type)).map((a) => (
                        <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-3 font-mono text-xs">{a.codeBureau || "—"}</td>
                          <td className="px-3 py-3 font-medium">{a.nomBureau || "Général"}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                                a.type === "fraude"
                                  ? "bg-destructive/15 text-destructive"
                                  : a.type === "incoherence"
                                    ? "bg-warning/15 text-warning"
                                    : a.type === "paiement"
                                      ? "bg-info/15 text-info"
                                      : "bg-orange-500/15 text-orange-600"
                              }`}
                            >
                              {a.type}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{a.title}</td>
                          <td className="px-3 py-3 text-xs whitespace-nowrap">{a.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </TabsContent>

          {/* COMPTES */}
          <TabsContent value="comptes" className="mt-4">
            <Panel
              title="Créer un compte subordonné"
              actions={
                <FormDialog
                  trigger={
                    <Button>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouveau compte
                    </Button>
                  }
                  title="Création de compte — Directeur Général"
                  onSubmit={() => toast.success("Compte créé. Identifiants attribués.")}
                >
                  <FormGrid>
                    <Field label="Nom" required>
                      <Input />
                    </Field>
                    <Field label="Post-nom" required>
                      <Input />
                    </Field>
                    <Field label="Numéro matricule" required>
                      <Input />
                    </Field>
                    <Field label="Poste" required>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un poste" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r][lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Identifiant">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="auto"
                      />
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
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Identifiant: ${username || "—"}\nMot de passe: ${pwd || "—"}`,
                        );
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
                      <th className="px-3 py-2">Matricule</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ACCOUNTS.filter((a) =>
                      ["directeur", "chef_bureau_repr", "operateur_saisie"].includes(a.role),
                    ).map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => {}}
                      >
                        <td className="px-3 py-2">
                          <Link
                            to="/app/comptes/$compteId"
                            params={{ compteId: a.id }}
                            className="text-accent hover:underline font-medium"
                          >
                            {a.fullName}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{ROLE_LABELS[a.role]?.[lang] ?? a.role}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                          >
                            {a.status}
                          </span>
                        </td>
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
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Ajouter
                    </Button>
                  }
                  title="Nouvelle direction provinciale"
                  onSubmit={() => toast.success("Direction provinciale créée")}
                >
                  <Field label="Dénomination (province)" required>
                    <Input placeholder="ex: NORD-KIVU" />
                  </Field>
                  <Field label="Directeur provincial">
                    <Input placeholder="Nom complet" />
                  </Field>
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
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">{d.numero}</td>
                        <td className="px-3 py-2">
                          <Link
                            to="/app/directions/$directionId"
                            params={{ directionId: d.id }}
                            className="text-accent hover:underline font-medium"
                          >
                            {d.denomination}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{d.nombreBureaux}</td>
                        <td className="px-3 py-2 text-muted-foreground">{d.directeur}</td>
                        <td className="px-3 py-2 text-right flex gap-1 justify-end">
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="outline" className="h-8">
                                + Entité
                              </Button>
                            }
                            title={`Ajouter une entité — ${d.denomination}`}
                            onSubmit={() => toast.success("Entité ajoutée")}
                          >
                            <FormGrid>
                              <Field label="Nom de l'entité" required>
                                <Input placeholder="ex: Bureau de contrôle" />
                              </Field>
                              <Field label="Responsable">
                                <Input />
                              </Field>
                            </FormGrid>
                          </FormDialog>
                          <FormDialog
                            trigger={
                              <Button size="sm" variant="outline" className="h-8">
                                + Directeur
                              </Button>
                            }
                            title={`Changer/Ajouter Directeur — ${d.denomination}`}
                            onSubmit={() => toast.success("Directeur mis à jour")}
                          >
                            <FormGrid>
                              <Field label="Nom complet" required>
                                <Input defaultValue={d.directeur} />
                              </Field>
                              <Field label="Matricule" required>
                                <Input />
                              </Field>
                              <Field label="Date de prise de fonction">
                                <Input type="date" />
                              </Field>
                            </FormGrid>
                          </FormDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* BUREAUX DE REPRÉSENTATION */}
          <TabsContent value="representation" className="mt-4">
            <Panel
              title="Gestion des Bureaux de Représentation"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Nouveau bureau
                    </Button>
                  }
                  title="Créer un nouveau bureau de représentation"
                  onSubmit={() => toast.success("Bureau de représentation créé")}
                >
                  <FormGrid>
                    <Field label="Code bureau" required>
                      <Input placeholder="ex: UGMPO" />
                    </Field>
                    <Field label="Dénomination" required>
                      <Input placeholder="ex: MPONDWE" />
                    </Field>
                    <Field label="Ville" required>
                      <Input placeholder="ex: Mpondwe" />
                    </Field>
                    <Field label="Pays" required>
                      <Input placeholder="ex: OUGANDA" />
                    </Field>
                  </FormGrid>
                </FormDialog>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Dénomination</th>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Ville</th>
                      <th className="px-3 py-2">Pays</th>
                      <th className="px-3 py-2">Statut</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUREAUX_REPR.map((b, idx) => (
                      <tr
                        key={b.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-3 text-muted-foreground font-mono text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3 font-semibold">{b.denomination}</td>
                        <td className="px-3 py-3 font-mono text-xs">{b.code}</td>
                        <td className="px-3 py-3">{b.ville}</td>
                        <td className="px-3 py-3">{b.pays}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              b.status === "actif"
                                ? "bg-success/15 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {b.status === "actif" ? (
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            ) : (
                              <XCircle className="h-2.5 w-2.5" />
                            )}
                            {b.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <FormDialog
                              trigger={
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-accent"
                                  title="Modifier"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              }
                              title={`Modifier le bureau — ${b.denomination}`}
                              onSubmit={() => toast.success("Bureau mis à jour")}
                            >
                              <FormGrid>
                                <Field label="Code bureau" required>
                                  <Input defaultValue={b.code} />
                                </Field>
                                <Field label="Dénomination" required>
                                  <Input defaultValue={b.denomination} />
                                </Field>
                                <Field label="Ville" required>
                                  <Input defaultValue={b.ville} />
                                </Field>
                                <Field label="Pays" required>
                                  <Input defaultValue={b.pays} />
                                </Field>
                              </FormGrid>
                            </FormDialog>

                            <FormDialog
                              trigger={
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-blue-500"
                                  title="Voir données"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              }
                              title={`Détails du bureau — ${b.denomination}`}
                              onSubmit={() => {}}
                            >
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Code
                                    </div>
                                    <div className="font-mono text-sm">{b.code}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Dénomination
                                    </div>
                                    <div className="font-semibold text-sm">{b.denomination}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Ville
                                    </div>
                                    <div className="text-sm">{b.ville}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Pays
                                    </div>
                                    <div className="text-sm">{b.pays}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Statut
                                    </div>
                                    <div className="text-sm capitalize">{b.status}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground uppercase">
                                      Type
                                    </div>
                                    <div className="text-sm capitalize">{b.type}</div>
                                  </div>
                                </div>
                                <div className="pt-4 border-t border-border">
                                  <h4 className="text-xs font-bold uppercase mb-2">
                                    Statistiques d'activité (simulées)
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-muted p-2 rounded text-center">
                                      <div className="text-lg font-bold">124</div>
                                      <div className="text-[10px] uppercase text-muted-foreground">
                                        Dossiers
                                      </div>
                                    </div>
                                    <div className="bg-muted p-2 rounded text-center">
                                      <div className="text-lg font-bold">8</div>
                                      <div className="text-[10px] uppercase text-muted-foreground">
                                        Alertes
                                      </div>
                                    </div>
                                    <div className="bg-muted p-2 rounded text-center">
                                      <div className="text-lg font-bold">98%</div>
                                      <div className="text-[10px] uppercase text-muted-foreground">
                                        Efficacité
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </FormDialog>
                            <FormDialog
                              trigger={
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-indigo-500"
                                  title="Ajouter chef / Créer compte"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              }
                              title={`Créer compte Chef de Bureau — ${b.denomination}`}
                              onSubmit={() => toast.success("Compte Chef de Bureau créé")}
                            >
                              <FormGrid>
                                <Field label="Nom complet" required>
                                  <Input />
                                </Field>
                                <Field label="Matricule" required>
                                  <Input />
                                </Field>
                                <Field label="Bureau" required>
                                  <Input value={b.denomination} readOnly />
                                </Field>
                                <Field label="Identifiant">
                                  <Input placeholder="auto-généré" />
                                </Field>
                              </FormGrid>
                            </FormDialog>
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`h-7 w-7 ${b.status === "actif" ? "text-destructive" : "text-success"}`}
                              title={b.status === "actif" ? "Désactiver" : "Activer"}
                              onClick={() =>
                                toast.info(
                                  `Bureau ${b.status === "actif" ? "désactivé" : "activé"}`,
                                )
                              }
                            >
                              {b.status === "actif" ? (
                                <XCircle className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
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
