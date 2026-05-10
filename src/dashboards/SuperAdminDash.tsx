import { useState } from "react";
import { FolderKanban, Users, DollarSign, Plus, Edit, Trash2, KeyRound, Copy, Handshake, Building2, Filter } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { PartnerFormDialog } from "@/components/PartnerFormDialog";
import { TYPES_DOSSIERS, PARTENAIRES, ACCOUNTS, BUREAUX_DOUANIERS, DOSSIERS, EMPTY_MANIFESTS, calcPartenaireStats, type TypeDossier, type DossierShareAllocation, type ChefBarriereOuganda, type ChefBarriereCommission, type EmptyManifestBatchBilling, DOSSIER_SHARE_ALLOCATIONS, EMPTY_MANIFEST_BATCH_BILLINGS, CHEF_BARRIERE_OUGANDA, TYPES_DOSSIERS as TYPES } from "@/lib/mock";
import { ROLE_LABELS } from "@/lib/roles";
import { getCreatableRoles } from "@/lib/hierarchy";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function SuperAdminDash() {
  const { lang } = useI18n();
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [filterBureau, setFilterBureau] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const generate = () => setPwd(Math.random().toString(36).slice(2, 10) + "!");
  const allRoles = getCreatableRoles("super_admin");

  const [types, setTypes] = useState<TypeDossier[]>(TYPES_DOSSIERS);
  const [newType, setNewType] = useState({ code: "", libelle: "", tarif: 50, devise: "USD", actif: true });
  const [editingType, setEditingType] = useState<TypeDossier | null>(null);
  const [editType, setEditType] = useState({ code: "", libelle: "", tarif: 50, devise: "USD", actif: true });

  const totalTypeTarif = types.reduce((sum, t) => sum + t.tarif, 0);

  const resetNewType = () => setNewType({ code: "", libelle: "", tarif: 50, devise: "USD", actif: true });

  const [allocations, setAllocations] = useState<DossierShareAllocation[]>(DOSSIER_SHARE_ALLOCATIONS);
  const [chefBarriere, setChefBarriere] = useState<ChefBarriereOuganda>(CHEF_BARRIERE_OUGANDA);
  const [newCommission, setNewCommission] = useState({ typeDossierId: "", typeCommission: "pourcentage" as const, valeurCommission: 0 });

  const [batches, setBatches] = useState<EmptyManifestBatchBilling[]>(EMPTY_MANIFEST_BATCH_BILLINGS);
  const [pendingManifests, setPendingManifests] = useState<typeof EMPTY_MANIFESTS>([]);

  const addCommissionToChef = () => {
    if (!newCommission.typeDossierId) {
      toast.error("Sélectionnez un type de dossier.");
      return false;
    }
    if (chefBarriere.commissions.some(c => c.typeDossierId === newCommission.typeDossierId)) {
      toast.error("Ce type de dossier a déjà une commission assignée.");
      return false;
    }
    if (newCommission.valeurCommission <= 0) {
      toast.error("La valeur de commission doit être > 0.");
      return false;
    }

    setChefBarriere((prev) => ({
      ...prev,
      commissions: [...prev.commissions, { typeDossierId: newCommission.typeDossierId, typeCommission: newCommission.typeCommission, valeurCommission: newCommission.valeurCommission }],
    }));

    setNewCommission({ typeDossierId: "", typeCommission: "pourcentage", valeurCommission: 0 });
    toast.success("Commission ajoutée au Chef Barrière Ouganda");
    return undefined;
  };

  const updateCommissionForChef = (typeDossierId: string, patch: Partial<ChefBarriereCommission>) => {
    setChefBarriere((prev) => ({
      ...prev,
      commissions: prev.commissions.map((c) => (c.typeDossierId === typeDossierId ? { ...c, ...patch } : c)),
    }));
    toast.success("Commission mise à jour");
  };

  const removeCommissionFromChef = (typeDossierId: string) => {
    setChefBarriere((prev) => ({
      ...prev,
      commissions: prev.commissions.filter((c) => c.typeDossierId !== typeDossierId),
    }));
    toast.success("Commission supprimée");
  };

  const createBatchBilling = () => {
    const availableManifests = EMPTY_MANIFESTS.filter(m => !batches.flatMap(b => b.manifests).includes(m.id) && m.status !== "payé");
    if (availableManifests.length === 0) {
      toast.error("Aucun manifest disponible pour facturation en masse.");
      return false;
    }

    const total = availableManifests.reduce((sum, m) => sum + m.montant, 0);
    const batchNumber = `BATCH/2025/${String(batches.length + 1).padStart(3, "0")}`;

    setBatches((prev) => [
      ...prev,
      {
        id: `embb${prev.length + 1}`,
        batchNumber,
        nombreManifests: availableManifests.length,
        montantTotal: total,
        montantParUnit: 25,
        statut: "à facturer",
        dateCreation: new Date().toISOString().slice(0, 10),
        manifests: availableManifests.map(m => m.id),
        responsable: "Super Admin",
        observation: "Lot de facturation en masse — tous les manifests.",
      },
    ]);

    toast.success(`Facture groupée créée : ${availableManifests.length} manifests`);
    return undefined;
  };

  const updateBatchStatus = (id: string, statut: EmptyManifestBatchBilling["statut"]) => {
    setBatches((prev) => prev.map((batch) => (batch.id === id ? { ...batch, statut, dateFacturation: statut === "facturé" ? new Date().toISOString().slice(0, 10) : batch.dateFacturation, datePaiement: statut === "payé" ? new Date().toISOString().slice(0, 10) : batch.datePaiement } : batch)));
    toast.success(`Lot de facturation mis à jour : ${statut}`);
  };

  const handleCreateType = () => {
    if (!newType.code.trim() || !newType.libelle.trim()) {
      toast.error("Le code et le libellé sont obligatoires.");
      return false;
    }
    setTypes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        code: newType.code.trim().toUpperCase(),
        libelle: newType.libelle.trim(),
        tarif: newType.tarif,
        devise: newType.devise,
        actif: newType.actif,
        dateCreation: new Date().toISOString().slice(0, 10),
      },
    ]);
    resetNewType();
    toast.success("Type de dossier créé");
    return undefined;
  };

  const handleUpdateType = () => {
    if (!editingType) return false;
    if (!editType.code.trim() || !editType.libelle.trim()) {
      toast.error("Le code et le libellé sont obligatoires.");
      return false;
    }
    setTypes((prev) =>
      prev.map((t) =>
        t.id === editingType.id
          ? {
            ...t,
            code: editType.code.trim().toUpperCase(),
            libelle: editType.libelle.trim(),
            tarif: editType.tarif,
            devise: editType.devise,
            actif: editType.actif,
          }
          : t
      )
    );
    setEditingType(null);
    toast.success("Type de dossier modifié");
    return undefined;
  };

  const handleDeleteType = (typeId: string) => {
    setTypes((prev) => prev.filter((t) => t.id !== typeId));
    toast.success("Type de dossier supprimé");
  };

  const toggleTypeActive = (typeId: string) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === typeId ? { ...t, actif: !t.actif } : t))
    );
  };

  const revenue = DOSSIERS.reduce((s, d) => s + d.montant, 0);

  const revenueByBureau = BUREAUX_DOUANIERS.map(b => {
    const bDossiers = DOSSIERS.filter(d =>
      (filterBureau === "all" || d.bureauRepr === b.denomination) &&
      (!filterDate || d.date >= filterDate)
    );
    return { ...b, count: bDossiers.length, revenu: bDossiers.reduce((s, d) => s + d.montant, 0) };
  }).filter(b => filterBureau === "all" || b.denomination === filterBureau);

  const getBureauName = (id: string) => BUREAUX_DOUANIERS.find(b => b.id === id)?.denomination ?? id;

  return (
    <div>
      <DashHeader subtitle="Super Admin — gestion centrale, types de dossiers, partenaires, comptes, manifest" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Types de dossiers" value={types.filter(t => t.actif).length} />
        <StatCard icon={DollarSign} label="Total facturation" value={`$${totalTypeTarif.toLocaleString()}`} />
        <StatCard icon={Handshake} label="Partenaires" value={PARTENAIRES.length} />
        <StatCard icon={Users} label="Comptes" value={ACCOUNTS.length} />
      </div>

      <div className="mt-6">
        <Tabs defaultValue="types">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="types">Types de dossiers</TabsTrigger>
            <TabsTrigger value="partenaires">Partenaires</TabsTrigger>
            <TabsTrigger value="comptes">Comptes & Bureaux</TabsTrigger>
            <TabsTrigger value="attributions">Attributions</TabsTrigger>
            <TabsTrigger value="facturation">Facturation</TabsTrigger>
            <TabsTrigger value="revenus">Revenus</TabsTrigger>
          </TabsList>

          {/* === TYPES DE DOSSIERS === */}
          <TabsContent value="types" className="mt-4">
            <Panel title="Gestion des types de dossiers (CRUD)" actions={
              <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau type</Button>} title="Créer un type de dossier" onSubmit={handleCreateType}>
                <FormGrid>
                  <Field label="Code" required>
                    <Input value={newType.code} onChange={(e) => setNewType((prev) => ({ ...prev, code: e.target.value }))} placeholder="ex: DIRECT" />
                  </Field>
                  <Field label="Libellé" required>
                    <Input value={newType.libelle} onChange={(e) => setNewType((prev) => ({ ...prev, libelle: e.target.value }))} placeholder="ex: Direct" />
                  </Field>
                  <Field label="Tarification ($)" required>
                    <Input type="number" value={newType.tarif} onChange={(e) => setNewType((prev) => ({ ...prev, tarif: Number(e.target.value) }))} placeholder="50" />
                  </Field>
                  <Field label="Devise">
                    <Select value={newType.devise} onValueChange={(value) => setNewType((prev) => ({ ...prev, devise: value }))}>
                      <SelectTrigger><SelectValue placeholder="USD" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="CDF">CDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FormGrid>
              </FormDialog>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Libellé</th><th className="px-3 py-2">Tarif</th><th className="px-3 py-2">Devise</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Créé le</th><th className="px-3 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {types.map(t => (
                      <tr key={t.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs">{t.code}</td>
                        <td className="px-3 py-2 font-medium">{t.libelle}</td>
                        <td className="px-3 py-2 font-semibold">${t.tarif}</td>
                        <td className="px-3 py-2">{t.devise}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${t.actif ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{t.actif ? "Actif" : "Inactif"}</span></td>
                        <td className="px-3 py-2 text-muted-foreground">{t.dateCreation}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            <FormDialog trigger={<Button size="sm" variant="ghost" onClick={() => {
                              setEditingType(t);
                              setEditType({ code: t.code, libelle: t.libelle, tarif: t.tarif, devise: t.devise, actif: t.actif });
                            }}><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${t.libelle}`} onSubmit={handleUpdateType}>
                              <FormGrid>
                                <Field label="Code"><Input value={editType.code} onChange={(e) => setEditType((prev) => ({ ...prev, code: e.target.value }))} /></Field>
                                <Field label="Libellé"><Input value={editType.libelle} onChange={(e) => setEditType((prev) => ({ ...prev, libelle: e.target.value }))} /></Field>
                                <Field label="Tarif ($)"><Input type="number" value={editType.tarif} onChange={(e) => setEditType((prev) => ({ ...prev, tarif: Number(e.target.value) }))} /></Field>
                                <Field label="Devise">
                                  <Select value={editType.devise} onValueChange={(value) => setEditType((prev) => ({ ...prev, devise: value }))}>
                                    <SelectTrigger><SelectValue placeholder="USD" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="USD">USD</SelectItem>
                                      <SelectItem value="EUR">EUR</SelectItem>
                                      <SelectItem value="CDF">CDF</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Field>
                                <Field label="Actif">
                                  <Select value={editType.actif ? "active" : "inactive"} onValueChange={(value) => setEditType((prev) => ({ ...prev, actif: value === "active" }))}>
                                    <SelectTrigger><SelectValue placeholder={t.actif ? "Actif" : "Inactif"} /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Actif</SelectItem>
                                      <SelectItem value="inactive">Inactif</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Field>
                              </FormGrid>
                            </FormDialog>
                            <Button size="sm" variant="outline" onClick={() => toggleTypeActive(t.id)}>{t.actif ? "Désactiver" : "Activer"}</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteType(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* === PARTENAIRES TERRAIN (AVANCÉ) === */}
          <TabsContent value="partenaires" className="mt-4">
            <Panel title="Partenaires terrain — Gestion avancée" actions={
              <PartnerFormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau partenaire</Button>} title="Créer un partenaire" />
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Contact</th><th className="px-3 py-2">Bureaux</th><th className="px-3 py-2 text-right">Solde</th><th className="px-3 py-2 text-center">Dossiers</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {PARTENAIRES.map(p => {
                      const stats = calcPartenaireStats(p.id);
                      return (
                        <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 font-medium">{p.nom}</td>
                          <td className="px-3 py-2">{p.contact}<div className="text-xs text-muted-foreground">{p.telephone}</div></td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {p.bureaux.map(b => (
                                <span key={b.bureauId} className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                                  <Building2 className="h-2.5 w-2.5" />{getBureauName(b.bureauId)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-success">${stats.solde}</td>
                          <td className="px-3 py-2 text-center">{stats.dossiersTraites}</td>
                          <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "actif" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{p.status}</span></td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex gap-1 justify-end">
                              <PartnerFormDialog trigger={<Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${p.nom}`} initial={p} />
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.success("Partenaire supprimé")}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Revenue breakdown */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PARTENAIRES.filter(p => p.status === "actif").map(p => {
                  const stats = calcPartenaireStats(p.id);
                  return (
                    <div key={p.id} className="rounded-lg border border-border p-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm truncate">{p.nom}</span>
                        <span className="text-xs text-success font-semibold">${stats.solde}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap mb-2">
                        {p.bureaux.map(b => (
                          <span key={b.bureauId} className="text-[9px] bg-muted px-1.5 py-0.5 rounded">{getBureauName(b.bureauId)}: {b.commissions.length} types</span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">{stats.dossiersTraites} dossiers · Moy: ${stats.commissionMoyenne}/dossier</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 rounded-lg border border-dashed border-border bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Accès partenaire (restreint)</h4>
                <p className="text-xs text-muted-foreground">Chaque partenaire ne voit que : son solde et le nombre de dossiers traités. Aucun accès aux autres données du système.</p>
              </div>
            </Panel>
          </TabsContent>

          {/* === COMPTES & BUREAUX === */}
          <TabsContent value="comptes" className="mt-4 space-y-4">
            <Panel title="Créer un compte (tous rôles)" actions={
              <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau compte</Button>} title="Créer un compte" onSubmit={() => toast.success("Compte créé")}>
                <FormGrid>
                  <Field label="Nom" required><Input /></Field>
                  <Field label="Post-nom" required><Input /></Field>
                  <Field label="Prénom"><Input /></Field>
                  <Field label="Matricule" required><Input /></Field>
                  <Field label="Téléphone"><Input /></Field>
                  <Field label="Bureau douanier">
                    <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{BUREAUX_DOUANIERS.map(b => <SelectItem key={b.id} value={b.code}>{b.code} · {b.denomination}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Rôle" required>
                    <Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{allRoles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r][lang]}</SelectItem>)}</SelectContent>
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
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Nom</th><th className="px-3 py-2">Rôle</th><th className="px-3 py-2">Bureau</th><th className="px-3 py-2">Matricule</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
                  <tbody>{ACCOUNTS.slice(0, 12).map(a => (
                    <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2"><Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline">{a.fullName}</Link></td>
                      <td className="px-3 py-2 text-xs">{ROLE_LABELS[a.role]?.[lang] ?? a.role}</td>
                      <td className="px-3 py-2">{a.bureau ?? "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                      <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span></td>
                      <td className="px-3 py-2 text-right"><div className="flex gap-1 justify-end"><FormDialog trigger={<Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${a.fullName}`} onSubmit={() => toast.success("Modifié")}><FormGrid><Field label="Nom"><Input defaultValue={a.fullName} /></Field><Field label="Téléphone"><Input defaultValue={a.phone} /></Field></FormGrid></FormDialog><Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.success("Supprimé")}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Bureaux douaniers" actions={
              <FormDialog trigger={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Nouveau bureau</Button>} title="Créer un bureau" onSubmit={() => toast.success("Bureau créé")}>
                <FormGrid><Field label="Code" required><Input /></Field><Field label="Dénomination" required><Input /></Field><Field label="ICB"><Input /></Field><Field label="Province"><Input /></Field></FormGrid>
              </FormDialog>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Dénomination</th><th className="px-3 py-2">ICB</th><th className="px-3 py-2">Province</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
                  <tbody>{BUREAUX_DOUANIERS.map(b => (
                    <tr key={b.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs"><Link to="/app/bureaux/$bureauId" params={{ bureauId: b.id }} className="text-accent hover:underline">{b.code}</Link></td>
                      <td className="px-3 py-2 font-medium">{b.denomination}</td>
                      <td className="px-3 py-2 text-muted-foreground">{b.icb ?? "—"}</td>
                      <td className="px-3 py-2">{b.province ?? "—"}</td>
                      <td className="px-3 py-2 text-right"><div className="flex gap-1 justify-end"><FormDialog trigger={<Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${b.denomination}`} onSubmit={() => toast.success("Bureau modifié")}><FormGrid><Field label="Code"><Input defaultValue={b.code} /></Field><Field label="Dénomination"><Input defaultValue={b.denomination} /></Field><Field label="ICB"><Input defaultValue={b.icb ?? ""} /></Field></FormGrid></FormDialog><Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.success("Bureau supprimé")}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* === CHEF BARRIÈRE OUGANDA — COMMISSIONS PAR TYPE DOSSIER === */}
          <TabsContent value="attributions" className="mt-4">
            <Panel title="Chef Barrière Ouganda — Configuration des commissions" actions={
              <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Ajouter commission</Button>} title="Attribuer commission par type de dossier" onSubmit={addCommissionToChef}>
                <FormGrid>
                  <Field label="Type de dossier" required>
                    <Select value={newCommission.typeDossierId} onValueChange={(value) => setNewCommission((prev) => ({ ...prev, typeDossierId: value }))}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                      <SelectContent>
                        {TYPES.filter(t => t.actif).map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.libelle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Type de commission" required>
                    <Select value={newCommission.typeCommission} onValueChange={(value) => setNewCommission((prev) => ({ ...prev, typeCommission: value as "fixe" | "pourcentage" }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pourcentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="fixe">Montant fixe ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={newCommission.typeCommission === "pourcentage" ? "Pourcentage" : "Montant ($)"} required>
                    <Input type="number" min={0} value={newCommission.valeurCommission} onChange={(e) => setNewCommission((prev) => ({ ...prev, valeurCommission: Number(e.target.value) }))} />
                  </Field>
                </FormGrid>
              </FormDialog>
            }>
              <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><div className="text-xs text-muted-foreground mb-1">Statut</div><div className="font-semibold text-success">{chefBarriere.statut === "actif" ? "Actif" : "Inactif"}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">Commissions configurées</div><div className="font-semibold">{chefBarriere.commissions.length}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">Depuis</div><div className="font-mono text-xs">{chefBarriere.dateCreation}</div></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Type dossier</th><th className="px-3 py-2">Type commission</th><th className="px-3 py-2 text-right">Valeur</th><th className="px-3 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {chefBarriere.commissions.map((comm) => {
                      const typeLabel = TYPES.find(t => t.id === comm.typeDossierId)?.libelle ?? comm.typeDossierId;
                      return (
                        <tr key={comm.typeDossierId} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{typeLabel}</td>
                          <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${comm.typeCommission === "pourcentage" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>{comm.typeCommission === "pourcentage" ? "Pourcentage" : "Fixe"}</span></td>
                          <td className="px-3 py-2 text-right font-semibold">{comm.valeurCommission}{comm.typeCommission === "pourcentage" ? "%" : "$"}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeCommissionFromChef(comm.typeDossierId)}>Supprimer</Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {chefBarriere.commissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucune commission configurée. Ajoutez-en une pour commencer.</div>
              )}
            </Panel>
          </TabsContent>

          {/* === FACTURATION EN MASSE EMPTY MANIFESTS === */}
          <TabsContent value="facturation" className="mt-4">
            <Panel title="Facturation en masse — Empty Manifests (droit exclusif Super Admin)" actions={
              <Button onClick={createBatchBilling}><Plus className="mr-1.5 h-4 w-4" />Créer lot de facturation</Button>
            }>
              <div className="grid gap-3 mb-4">
                <div className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-2">Manifests disponibles pour facturation</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-warning">{EMPTY_MANIFESTS.filter(m => !batches.flatMap(b => b.manifests).includes(m.id)).length}</span>
                    <span className="text-sm text-muted-foreground">à regrouper dans un lot</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr><th className="px-3 py-2">Lot</th><th className="px-3 py-2">Manifests</th><th className="px-3 py-2">Montant total</th><th className="px-3 py-2">Statut</th><th className="px-3 py-2">Créé le</th><th className="px-3 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{batch.batchNumber}</td>
                        <td className="px-3 py-2">{batch.nombreManifests} manifests</td>
                        <td className="px-3 py-2 text-right font-semibold">${batch.montantTotal}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${batch.statut === "payé" ? "bg-success/15 text-success" : batch.statut === "facturé" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"}`}>{batch.statut}</span></td>
                        <td className="px-3 py-2 text-muted-foreground">{batch.dateCreation}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex gap-1 justify-end">
                            {batch.statut === "à facturer" && (
                              <Button size="sm" variant="outline" onClick={() => updateBatchStatus(batch.id, "facturé")}>Facturer</Button>
                            )}
                            {batch.statut !== "payé" && (
                              <Button size="sm" variant="outline" onClick={() => updateBatchStatus(batch.id, "payé")}>Marquer payé</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {batches.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Aucun lot de facturation créé. Cliquez sur "Créer lot de facturation" pour commencer.</div>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="revenus" className="mt-4">
            <Panel title="Revenus par bureau" actions={
              <div className="flex gap-2 flex-wrap">
                <Select value={filterBureau} onValueChange={setFilterBureau}>
                  <SelectTrigger className="w-45"><SelectValue placeholder="Tous les bureaux" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Tous les bureaux</SelectItem>{BUREAUX_DOUANIERS.map(b => <SelectItem key={b.id} value={b.denomination}>{b.denomination}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-40" />
                <Button variant="outline" size="sm" onClick={() => { setFilterBureau("all"); setFilterDate(""); }}>Réinitialiser</Button>
              </div>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50"><tr><th className="px-3 py-2">Code</th><th className="px-3 py-2">Bureau</th><th className="px-3 py-2">Dossiers</th><th className="px-3 py-2 text-right">Revenu</th></tr></thead>
                  <tbody>
                    {revenueByBureau.map(b => (
                      <tr key={b.id} className="border-t border-border hover:bg-muted/30"><td className="px-3 py-2 font-mono text-xs">{b.code}</td><td className="px-3 py-2">{b.denomination}</td><td className="px-3 py-2">{b.count}</td><td className="px-3 py-2 text-right font-semibold">${b.revenu}</td></tr>
                    ))}
                    <tr className="border-t-2 border-border font-semibold bg-muted/30"><td className="px-3 py-2" colSpan={2}>TOTAL</td><td className="px-3 py-2">{revenueByBureau.reduce((s, b) => s + b.count, 0)}</td><td className="px-3 py-2 text-right text-success">${revenueByBureau.reduce((s, b) => s + b.revenu, 0)}</td></tr>
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
