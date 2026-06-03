import { useState, useMemo } from "react";
import { FolderKanban, Package, History, Plus, Loader2, UserCheck } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetDossiers, apiGetColisageRapports, apiGetColisageAffectations, apiStoreColisageRapport } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function AgentPointageDash() {
  const { data: rawDossiers } = useApi(apiGetDossiers);
  const { data: rawAffectations } = useApi(apiGetColisageAffectations);
  const { data: rawRapports, refetch: refetchRapports } = useApi(apiGetColisageRapports);
  const allDossiers = (rawDossiers as any[]) || [];
  const affectations = (rawAffectations as any[]) || [];
  const rapports = (rawRapports as any[]) || [];

  // Only show dossiers assigned to this agent
  const assignedIds = new Set(affectations.map((a: any) => a.dossier_id));
  const activeDossiers = useMemo(() => allDossiers.filter((d) => assignedIds.has(d.id)), [allDossiers, affectations]);

  const direct = activeDossiers.filter((d) => d.type === "direct");
  const trans = activeDossiers.filter((d) => d.type === "transbordement");
  const lot = activeDossiers.filter((d) => d.type === "lot");
  const colis = activeDossiers.filter((d) => d.type === "colis");
  const dechargement = activeDossiers.filter((d) => d.type === "dechargement");
  const chargement = activeDossiers.filter((d) => d.type === "chargement");
  const petrolier = activeDossiers.filter((d) => d.type === "petrolier");

  const ColisageButton = ({ dossierId, dossierRef }: { dossierId: string; dossierRef: string }) => {
    const [loading, setLoading] = useState(false);
    return (
      <FormDialog
        trigger={
          <Button size="sm" variant="outline" disabled={loading}>
            {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Package className="mr-1 h-3.5 w-3.5" />}
            Colisage
          </Button>
        }
        title="Rapport de colisage"
        onSubmit={async (formData) => {
          setLoading(true);
          try {
            const nombreColis = parseInt(formData.get("nombreColis") as string) || 1;
            const poidsTotal = parseFloat(formData.get("poidsTotal") as string) || 0;
            const description = (formData.get("description") as string) || "";
            await apiStoreColisageRapport({
              dossier_id: dossierId,
              lignes: [{ description, quantite: nombreColis, poidsParColis: poidsTotal, poidsTotal }],
              total_quantite: nombreColis,
              total_poids: poidsTotal,
              notes: "",
            });
            toast.success("Colisage soumis avec succès");
            refetchRapports();
          } catch {
            toast.error("Erreur lors de la soumission du colisage");
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormGrid>
          <Field label="Référence dossier">
            <Input value={dossierRef} readOnly />
          </Field>
          <Field label="Nombre de colis" required>
            <Input name="nombreColis" type="number" min="1" defaultValue="1" />
          </Field>
          <Field label="Poids total (kg)" required>
            <Input name="poidsTotal" type="number" min="0" step="0.1" />
          </Field>
          <Field label="Description marchandise" required>
            <Input name="description" />
          </Field>
        </FormGrid>
      </FormDialog>
    );
  };

  return (
    <div>
      <DashHeader subtitle="Agent de Pointage — dossiers, colisage et historique" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserCheck} label="Affectations" value={affectations.length} hint="dossiers assignés" />
        <StatCard icon={FolderKanban} label="Dossiers à traiter" value={activeDossiers.length} />
        <StatCard icon={Package} label="Colisages soumis" value={rapports.length} />
        <StatCard
          icon={History}
          label="Validés"
          value={rapports.filter((c: any) => c.statut === "valide").length}
          hint="par le chef"
        />
      </div>

      <div className="mt-6">
        {affectations.length === 0 ? (
          <div className="rounded-2xl border border-accent/10 bg-background p-12 text-center">
            <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-bold text-lg mb-1">Aucune affectation</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Vous n&apos;avez pas encore reçu d&apos;affectation. Le Chef Entrepôt Douane vous assignera des dossiers dès que nécessaire.
            </p>
          </div>
        ) : (
        <Tabs defaultValue="direct">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="direct">Direct ({direct.length})</TabsTrigger>
            <TabsTrigger value="transbordement">Transbordement ({trans.length})</TabsTrigger>
            <TabsTrigger value="lot">Lot ({lot.length})</TabsTrigger>
            <TabsTrigger value="colis">Colis ({colis.length})</TabsTrigger>
            <TabsTrigger value="dechargement">Déchargement ({dechargement.length})</TabsTrigger>
            <TabsTrigger value="chargement">Chargement ({chargement.length})</TabsTrigger>
            <TabsTrigger value="petrolier">Produit pétrolier ({petrolier.length})</TabsTrigger>
            <TabsTrigger value="autres">Autres</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <Panel title="Liste des dossiers — Direct">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Importateur</th>
                      <th className="px-3 py-2">Réf. dossier</th>
                      <th className="px-3 py-2">Véhicule</th>
                      <th className="px-3 py-2">DRA</th>
                      <th className="px-3 py-2">T1</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {direct.slice(0, 15).map((d, i) => (
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            to="/app/dossiers/$dossierId"
                            params={{ dossierId: d.id }}
                            className="text-accent hover:underline font-medium"
                          >
                            {d.importateur}
                          </Link>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{d.reference}</td>
                        <td className="px-3 py-2">{d.vehicule}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2 text-right">
                          <ColisageButton dossierId={d.id} dossierRef={d.reference} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="transbordement" className="mt-4">
            <Panel title="Liste des dossiers — Transbordement">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nº</th>
                      <th className="px-3 py-2">Réf. dossier</th>
                      <th className="px-3 py-2">Transbordeur de</th>
                      <th className="px-3 py-2">À véhicule</th>
                      <th className="px-3 py-2">Réf. DRA</th>
                      <th className="px-3 py-2">Réf. T1</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trans.slice(0, 15).map((d, i) => (
                      <tr
                        key={d.id}
                        className="border-t border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            to="/app/dossiers/$dossierId"
                            params={{ dossierId: d.id }}
                            className="text-accent hover:underline font-mono text-xs"
                          >
                            {d.reference}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{d.vehiculeDe ?? d.vehicule}</td>
                        <td className="px-3 py-2">{d.vehiculeA ?? "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                        <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                        <td className="px-3 py-2 text-right">
                          <ColisageButton dossierId={d.id} dossierRef={d.reference} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          {/* Onglets génériques pour lot, colis, etc. */}
          {["lot", "colis", "dechargement", "chargement", "petrolier"].map((typ) => {
            const items = activeDossiers.filter((d) => d.type === typ);
            return (
              <TabsContent key={typ} value={typ} className="mt-4">
                <Panel title={`Liste des dossiers — ${typ.charAt(0).toUpperCase() + typ.slice(1)}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                        <tr>
                          <th className="px-3 py-2">Nº</th>
                          <th className="px-3 py-2">Importateur</th>
                          <th className="px-3 py-2">Réf. dossier</th>
                          <th className="px-3 py-2">Véhicule</th>
                          <th className="px-3 py-2">DRA</th>
                          <th className="px-3 py-2">T1</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, 15).map((d, i) => (
                          <tr
                            key={d.id}
                            className="border-t border-border hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">
                              <Link
                                to="/app/dossiers/$dossierId"
                                params={{ dossierId: d.id }}
                                className="text-accent hover:underline"
                              >
                                {d.importateur}
                              </Link>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">{d.reference}</td>
                            <td className="px-3 py-2">{d.vehicule}</td>
                            <td className="px-3 py-2 font-mono text-xs">{d.dra}</td>
                            <td className="px-3 py-2 font-mono text-xs">{d.t1}</td>
                            <td className="px-3 py-2 text-right">
                              <ColisageButton dossierId={d.id} dossierRef={d.reference} />
                            </td>
                          </tr>
                        ))}
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                              {allDossiers.length > 0 ? "Aucun dossier assigné pour cette catégorie." : "Aucune affectation reçue. En attente d\'un dossier..."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </TabsContent>
            );
          })}

          <TabsContent value="autres" className="mt-4">
            <Panel
              title="Autres types de dossier"
              actions={
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Nouveau type
                    </Button>
                  }
                  title="Ajouter un type de dossier"
                  onSubmit={() => toast.success("Type ajouté")}
                >
                  <Field label="Nom du type" required>
                    <Input placeholder="ex: Conteneur spécial" />
                  </Field>
                </FormDialog>
              }
            >
              <div className="py-4 text-center text-sm text-muted-foreground">
                Utilisez le bouton "Nouveau type" pour ajouter d'autres catégories de dossiers.
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Historique des colisages */}
      <div className="mt-6">
        <Panel
          title="Historique des colisages soumis"
          actions={
            <span className="text-xs text-muted-foreground">{rapports.length} colisages</span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-3 py-2">Réf. colisage</th>
                  <th className="px-3 py-2">Dossier</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Colis</th>
                  <th className="px-3 py-2">Poids (kg)</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((c: any) => {
                  const premiereLigne = c.lignes?.[0];
                  return (
                    <tr
                      key={c.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                      <td className="px-3 py-2">
                        <Link
                          to="/app/dossiers/$dossierId"
                          params={{ dossierId: c.dossier_id }}
                          className="text-accent hover:underline font-mono text-xs"
                        >
                          {c.dossier?.reference || c.dossier_id}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {c.date_soumission ? new Date(c.date_soumission).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-3 py-2">{c.total_quantite}</td>
                      <td className="px-3 py-2">{c.total_poids?.toLocaleString()}</td>
                      <td className="px-3 py-2 truncate max-w-[200px]">{premiereLigne?.description || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${c.statut === "valide" ? "bg-success/15 text-success" : c.statut === "rejete" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                        >
                          {c.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
