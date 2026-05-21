import { FolderKanban, Package, History, Plus } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { DOSSIERS, COLISAGES } from "@/lib/mock";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export default function AgentPointageDash() {
  const direct = DOSSIERS.filter((d) => d.type === "direct");
  const trans = DOSSIERS.filter((d) => d.type === "transbordement");
  const lot = DOSSIERS.filter((d) => d.type === "lot");
  const colis = DOSSIERS.filter((d) => d.type === "colis");
  const dechargement = DOSSIERS.filter((d) => d.type === "dechargement");
  const chargement = DOSSIERS.filter((d) => d.type === "chargement");
  const petrolier = DOSSIERS.filter((d) => d.type === "petrolier");

  const ColisageButton = ({ dossierId }: { dossierId: string }) => (
    <FormDialog
      trigger={
        <Button size="sm" variant="outline">
          <Package className="mr-1 h-3.5 w-3.5" />
          Colisage
        </Button>
      }
      title="Rapport de colisage"
      onSubmit={() => toast.success("Colisage soumis avec succès")}
    >
      <FormGrid>
        <Field label="Référence dossier">
          <Input value={dossierId} readOnly />
        </Field>
        <Field label="Date" required>
          <Input type="date" />
        </Field>
        <Field label="Nombre de colis" required>
          <Input type="number" />
        </Field>
        <Field label="Poids total (kg)" required>
          <Input type="number" />
        </Field>
        <Field label="Description marchandise" required>
          <Input />
        </Field>
      </FormGrid>
    </FormDialog>
  );

  return (
    <div>
      <DashHeader subtitle="Agent de Pointage — dossiers, colisage et historique" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Dossiers directs" value={direct.length} />
        <StatCard icon={FolderKanban} label="Transbordements" value={trans.length} />
        <StatCard icon={Package} label="Colisages soumis" value={COLISAGES.length} />
        <StatCard
          icon={History}
          label="Historique"
          value={COLISAGES.filter((c) => c.status === "validé").length}
          hint="validés"
        />
      </div>

      <div className="mt-6">
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
                          <ColisageButton dossierId={d.reference} />
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
                          <ColisageButton dossierId={d.reference} />
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
            const items = DOSSIERS.filter((d) => d.type === typ);
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
                              <ColisageButton dossierId={d.reference} />
                            </td>
                          </tr>
                        ))}
                        {items.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                              Aucun dossier
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
      </div>

      {/* Historique des colisages */}
      <div className="mt-6">
        <Panel
          title="Historique des colisages soumis"
          actions={
            <span className="text-xs text-muted-foreground">{COLISAGES.length} colisages</span>
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
                {COLISAGES.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs">{c.reference}</td>
                    <td className="px-3 py-2">
                      <Link
                        to="/app/dossiers/$dossierId"
                        params={{ dossierId: c.dossierId }}
                        className="text-accent hover:underline font-mono text-xs"
                      >
                        {c.dossierId}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{c.date}</td>
                    <td className="px-3 py-2">{c.nombreColis}</td>
                    <td className="px-3 py-2">{c.poidsTotal.toLocaleString()}</td>
                    <td className="px-3 py-2 truncate max-w-[200px]">{c.description}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${c.status === "validé" ? "bg-success/15 text-success" : c.status === "rejeté" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
