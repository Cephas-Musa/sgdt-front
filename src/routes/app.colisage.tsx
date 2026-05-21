import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DOSSIERS, type Dossier } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ListChecks, History, Package, Weight, FileText,
  FolderOpen, Eye, X, Truck, MapPin, Calendar, Hash,
  FileCheck, Scale, CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { getDossiersAgent } from "@/lib/colisage-store";

export const Route = createFileRoute("/app/colisage")({
  component: ColisageLayout,
});

function ColisageLayout() {
  const matchRoute = useMatchRoute();
  const isOnDossierPage = matchRoute({ to: "/app/colisage/$dossierId", fuzzy: true });

  if (isOnDossierPage) {
    return <Outlet />;
  }

  return <ColisagePage />;
}

function ColisagePage() {
  const [search, setSearch] = useState("");
  const [dossierDetails, setDossierDetails] = useState<Dossier | null>(null);
  const { user } = useAuth();

  const filtered = DOSSIERS.filter(
    (d) => {
      // Filtrage par recherche
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        d.reference.toLowerCase().includes(q) ||
        d.importateur.toLowerCase().includes(q) ||
        d.typeMarchandises.toLowerCase().includes(q) ||
        d.vehicule.toLowerCase().includes(q)
      );
    }
  );

  const actifs = filtered.filter((d) => d.status !== "apure");
  const historique = filtered.filter((d) => d.status === "apure");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent de pointage – Entrepôt"
        description="Gestion et suivi des dossiers de colisage."
      />

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par référence, importateur, marchandise..."
          className="pl-9 rounded-xl border-accent/20 bg-background/60 focus:border-accent transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="actifs">
        <TabsList className="bg-muted/30 rounded-xl p-1 h-auto">
          <TabsTrigger value="actifs" className="rounded-lg px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FolderOpen className="mr-2 h-4 w-4" />
            Dossiers en cours
            <Badge variant="secondary" className="ml-2 text-xs">{actifs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="historique" className="rounded-lg px-6 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <History className="mr-2 h-4 w-4" />
            Historique
            <Badge variant="secondary" className="ml-2 text-xs">{historique.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actifs" className="mt-4">
          <TableauDossiers
            dossiers={actifs}
            avecBouton={true}
            onVoirDetails={null}
          />
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <TableauDossiers
            dossiers={historique}
            avecBouton={false}
            onVoirDetails={(d) => setDossierDetails(d)}
          />
        </TabsContent>
      </Tabs>

      {/* === MODAL DÉTAILS DOSSIER (Historique) === */}
      {dossierDetails && (
        <ModalDetailsDossier
          dossier={dossierDetails}
          onClose={() => setDossierDetails(null)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Tableau des dossiers (actifs ou historique)
───────────────────────────────────────── */
function TableauDossiers({
  dossiers,
  avecBouton,
  onVoirDetails,
}: {
  dossiers: typeof DOSSIERS;
  avecBouton: boolean;
  onVoirDetails: ((d: Dossier) => void) | null;
}) {
  if (dossiers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed border-accent/10 bg-muted/5 text-muted-foreground">
        <FileText className="h-14 w-14 mb-4 opacity-10" />
        <p className="text-sm font-medium">Aucun dossier trouvé</p>
        <p className="text-xs mt-1 opacity-60">Essayez de modifier votre recherche</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent/10 bg-background overflow-hidden shadow-xl shadow-accent/5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-accent/5 border-b border-accent/10">
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informations du dossier
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Articles
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Poids
              </th>
              <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantité
              </th>
              <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Statut
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/5">
            {dossiers.map((d) => (
              <tr key={d.id} className="hover:bg-accent/[0.03] transition-colors group">
                {/* Infos dossier */}
                <td className="px-5 py-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      {d.reference}
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-accent/30 text-accent font-semibold">
                        {d.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">{d.importateur}</div>
                    <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                      <History className="h-3 w-3" />
                      {d.date}
                    </div>
                  </div>
                </td>

                {/* Articles */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-accent/50 shrink-0" />
                    <span className="font-medium text-foreground/80">{d.typeMarchandises}</span>
                  </div>
                  {d.articles && d.articles.length > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1 ml-6">
                      {d.articles.length} ligne(s) d'article
                    </div>
                  )}
                </td>

                {/* Poids */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Weight className="h-3.5 w-3.5 text-accent/50" />
                    <span className="font-bold text-accent">{d.poids.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground">kg</span>
                  </div>
                </td>

                {/* Quantité */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center justify-center h-7 min-w-[2.5rem] rounded-lg bg-muted/60 font-bold text-foreground/80 text-sm px-2">
                    {d.quantite}
                  </span>
                </td>

                {/* Statut */}
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    d.status === "apure"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : d.status === "en_cours"
                      ? "bg-blue-500/10 text-blue-600"
                      : d.status === "paye"
                      ? "bg-violet-500/10 text-violet-600"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {d.status.replace("_", " ")}
                  </span>
                </td>

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  {avecBouton ? (
                    <Link to="/app/colisage/$dossierId" params={{ dossierId: d.id }}>
                      <Button size="sm" className="rounded-xl bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20 transition-all hover:scale-105 active:scale-95 gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        Colisage
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-accent/30 text-accent hover:bg-accent/10 gap-1.5"
                      onClick={() => onVoirDetails?.(d)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Voir détails
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer résumé */}
      <div className="px-5 py-3 border-t border-accent/10 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <span>{dossiers.length} dossier(s) affiché(s)</span>
        <span>
          Poids total :{" "}
          <strong className="text-foreground">
            {dossiers.reduce((s, d) => s + d.poids, 0).toLocaleString()} kg
          </strong>
          &nbsp;·&nbsp; Quantité totale :{" "}
          <strong className="text-foreground">
            {dossiers.reduce((s, d) => s + d.quantite, 0).toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal — Détails complets d'un dossier (Historique)
───────────────────────────────────────── */
function ModalDetailsDossier({ dossier, onClose }: { dossier: Dossier; onClose: () => void }) {
  const sections = [
    {
      titre: "Informations générales",
      icon: <FileCheck className="h-4 w-4 text-accent" />,
      champs: [
        { label: "Référence", value: dossier.reference },
        { label: "Référence Douane", value: dossier.referenceDouane },
        { label: "Type de dossier", value: dossier.type },
        { label: "Statut", value: dossier.status },
        { label: "Date", value: dossier.date },
        { label: "Province", value: dossier.province },
      ],
    },
    {
      titre: "Parties impliquées",
      icon: <Hash className="h-4 w-4 text-accent" />,
      champs: [
        { label: "Importateur", value: dossier.importateur },
        { label: "Déclarant", value: dossier.declarant },
        { label: "NIF", value: dossier.nif },
        { label: "Bureau Repr.", value: dossier.bureauRepr },
        { label: "Opérateur saisie", value: dossier.operateurSaisie ?? "—" },
      ],
    },
    {
      titre: "Transport & Marchandises",
      icon: <Truck className="h-4 w-4 text-accent" />,
      champs: [
        { label: "Véhicule", value: dossier.vehicule },
        { label: "Plaque", value: dossier.plaque },
        { label: "Pays", value: dossier.pays },
        { label: "Provenance", value: dossier.provenance },
        { label: "Destination", value: dossier.destination },
        { label: "Type marchandises", value: dossier.typeMarchandises },
      ],
    },
    {
      titre: "Références douanières",
      icon: <Calendar className="h-4 w-4 text-accent" />,
      champs: [
        { label: "DRA", value: dossier.dra },
        { label: "T1", value: dossier.t1 },
        { label: "Mode déclaration", value: dossier.modeDeclaration ?? "—" },
        { label: "Nb déclarations", value: String(dossier.nombreDeclarations) },
      ],
    },
    {
      titre: "Colisage & Poids",
      icon: <Scale className="h-4 w-4 text-accent" />,
      champs: [
        { label: "Poids total", value: `${dossier.poids.toLocaleString()} kg` },
        { label: "Quantité", value: String(dossier.quantite) },
        { label: "Colis", value: String(dossier.colis) },
        { label: "Dénombrement", value: dossier.rapportColisage.denombrement },
        { label: "Pointage", value: dossier.rapportColisage.pointage },
        { label: "Quantités", value: dossier.rapportColisage.quantites },
      ],
    },
    {
      titre: "Localisation & Sortie",
      icon: <MapPin className="h-4 w-4 text-accent" />,
      champs: [
        { label: "Localisation", value: dossier.localisation },
        { label: "Entrepôt", value: dossier.rapportDechargement.entrepot },
        { label: "Emplacement", value: dossier.rapportDechargement.emplacement },
        { label: "Statut final", value: dossier.rapportDechargement.statutFinal },
        { label: "Bon de sortie", value: dossier.sortie.bonSortie },
        { label: "Date sortie", value: dossier.sortie.dateSortie },
        { label: "Destination finale", value: dossier.sortie.destinationFinale },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-accent/20 bg-background shadow-2xl shadow-black/30">

        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-accent/10 bg-background/95 backdrop-blur-md rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{dossier.reference}</h2>
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs font-bold">
                  APURÉ
                </Badge>
                <Badge variant="outline" className="text-accent border-accent/30 text-xs">
                  {dossier.type.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{dossier.importateur} · {dossier.date}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Corps — toutes les sections */}
        <div className="p-6 space-y-5">

          {/* Sections de détails */}
          {sections.map((section) => (
            <div key={section.titre} className="rounded-2xl border border-accent/10 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-accent/5 border-b border-accent/10">
                {section.icon}
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {section.titre}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-border/50">
                {section.champs.map(({ label, value }) => (
                  <div key={label} className="px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {label}
                    </p>
                    <p className="font-semibold text-sm text-foreground truncate" title={value}>
                      {value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tableau des articles si présents */}
          {dossier.articles && dossier.articles.length > 0 && (
            <div className="rounded-2xl border border-accent/10 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-accent/5 border-b border-accent/10">
                <Package className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Articles du dossier ({dossier.articles.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase text-muted-foreground">N°</th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase text-muted-foreground">Désignation</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase text-muted-foreground">Position</th>
                      <th className="px-5 py-3 text-center text-xs font-bold uppercase text-muted-foreground">Quantité</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase text-muted-foreground">Poids</th>
                      <th className="px-5 py-3 text-right text-xs font-bold uppercase text-muted-foreground">FOB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {dossier.articles.map((art, idx) => (
                      <tr key={art.id} className="hover:bg-accent/5">
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground font-bold">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium">{art.designation}</td>
                        <td className="px-5 py-3 text-center font-mono text-xs">{art.position}</td>
                        <td className="px-5 py-3 text-center font-bold">{art.quantite}</td>
                        <td className="px-5 py-3 text-right">{art.poids.toLocaleString()} kg</td>
                        <td className="px-5 py-3 text-right font-semibold text-accent">
                          {art.fob.toLocaleString()} USD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 border-t border-border">
                      <td colSpan={3} className="px-5 py-3 font-bold text-xs uppercase text-muted-foreground">Total</td>
                      <td className="px-5 py-3 text-center font-black text-accent">
                        {dossier.articles.reduce((s, a) => s + a.quantite, 0)}
                      </td>
                      <td className="px-5 py-3 text-right font-black text-accent">
                        {dossier.articles.reduce((s, a) => s + a.poids, 0).toLocaleString()} kg
                      </td>
                      <td className="px-5 py-3 text-right font-black text-accent">
                        {dossier.articles.reduce((s, a) => s + a.fob, 0).toLocaleString()} USD
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Vérification */}
          <div className="rounded-2xl border border-accent/10 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-accent/5 border-b border-accent/10">
              <FileCheck className="h-4 w-4 text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rapport de vérification
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50">
              {[
                { label: "Résultat", value: dossier.verificationRapport.resultat },
                { label: "Observations", value: dossier.verificationRapport.observations },
                { label: "Anomalies", value: dossier.verificationRapport.anomalies },
                { label: "Commentaires", value: dossier.verificationRapport.commentaires },
              ].map(({ label, value }) => (
                <div key={label} className="px-5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-accent/10 bg-background/95 backdrop-blur-md rounded-b-3xl">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>
            Fermer
          </Button>
          <Button
            className="rounded-xl bg-accent hover:bg-accent/90 gap-2"
            onClick={() => window.print()}
          >
            <FileText className="h-4 w-4" />
            Imprimer le dossier
          </Button>
        </div>
      </div>
    </div>
  );
}
