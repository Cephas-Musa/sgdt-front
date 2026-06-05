import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Minus,
  Trash2,
  Printer,
  Send,
  ChevronLeft,
  Package,
  Scale,
  Info,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { apiStoreColisageRapport, apiGetDossier, useApi } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/colisage/$dossierId")({
  component: ColisageReportPage,
});

interface LigneArticle {
  id: string;
  description: string;
  quantite: number;
  poidsParColis: number;
}

function ColisageReportPage() {
  const { dossierId } = Route.useParams();
  const navigate = useNavigate();
  const { data: rawDossier, loading } = useApi(() => apiGetDossier(dossierId), [dossierId]);
  const dossier = rawDossier as any;

  const [lignes, setLignes] = useState<LigneArticle[]>([]);
  const [desc, setDesc] = useState("");
  const [poids, setPoids] = useState("");
  const [notes, setNotes] = useState("");
  const [soumis, setSoumis] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Calculs automatiques ---
  const totaux = useMemo(() => {
    return lignes.reduce(
      (acc, l) => ({
        quantite: acc.quantite + l.quantite,
        poids: acc.poids + l.quantite * l.poidsParColis,
      }),
      { quantite: 0, poids: 0 }
    );
  }, [lignes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-10" />
        <p>Dossier introuvable.</p>
        <Link to="/app/colisage">
          <Button variant="outline" className="mt-4">Retour</Button>
        </Link>
      </div>
    );
  }

  // --- Ajouter un article ---
  const ajouterArticle = () => {
    if (!desc.trim()) {
      toast.error("Veuillez saisir une description.");
      return;
    }
    const p = parseFloat(poids);
    if (!poids || isNaN(p) || p <= 0) {
      toast.error("Veuillez saisir un poids valide (> 0).");
      return;
    }
    setLignes([
      ...lignes,
      {
        id: `L-${Date.now()}`,
        description: desc.trim(),
        quantite: 1,
        poidsParColis: p,
      },
    ]);
    setDesc("");
    setPoids("");
    toast.success("Article ajouté.");
  };

  // --- Modifier quantité ---
  const changerQte = (id: string, delta: number) => {
    setLignes(
      lignes.map((l) =>
        l.id === id ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l
      )
    );
  };

  // --- Supprimer une ligne ---
  const supprimerLigne = (id: string) => {
    setLignes(lignes.filter((l) => l.id !== id));
    toast.info("Article supprimé.");
  };

  // --- Soumettre le rapport ---
  const soumettre = async () => {
    if (lignes.length === 0) {
      toast.error("Ajoutez au moins un article avant de soumettre.");
      return;
    }
    setSubmitting(true);
    try {
      const lignesPayload = lignes.map((l) => ({
        description: l.description,
        quantite: l.quantite,
        poidsParColis: l.poidsParColis,
        poidsTotal: l.quantite * l.poidsParColis,
      }));
      await apiStoreColisageRapport({
        dossier_id: dossierId,
        lignes: lignesPayload,
        total_quantite: totaux.quantite,
        total_poids: totaux.poids,
        notes: notes || undefined,
      });
      setSoumis(true);
      toast.success("Rapport transmis au Chef Entrepôt !");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la soumission du rapport.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Écran de confirmation post-soumission ---
  if (soumis) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 animate-in fade-in duration-500">
        <div className="p-6 rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-20 w-20 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Rapport soumis avec succès !</h2>
          <p className="text-muted-foreground mt-2">
            Le rapport de colisage du dossier{" "}
            <span className="font-bold text-accent">{dossier.reference}</span>{" "}
            a été transmis au Chef Entrepôt.
          </p>
          <div className="mt-4 inline-flex items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-accent/10">
            <div>
              <p className="text-xs text-muted-foreground">Quantité totale</p>
              <p className="text-2xl font-black text-accent">{totaux.quantite}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Poids total</p>
              <p className="text-2xl font-black text-accent">{totaux.poids.toLocaleString()} kg</p>
            </div>
          </div>
        </div>
        <Button
          onClick={() => navigate({ to: "/app/colisage" })}
          className="rounded-xl bg-accent hover:bg-accent/90"
        >
          Retour à la liste des dossiers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* === EN-TÊTE : Retour + Actions === */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/app/colisage" })}
          className="group hover:bg-accent/10 -ml-2 gap-1"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Retour à la liste
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="rounded-xl border-accent/20 gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button
            onClick={soumettre}
            disabled={submitting}
            className="rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 gap-2"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Soumission..." : "Soumettre"}
          </Button>
        </div>
      </div>

      {/* === TITRE === */}
      <div className="flex items-center gap-3 p-5 rounded-2xl border border-accent/10 bg-accent/5">
        <div className="p-2.5 rounded-xl bg-accent/10">
          <FileText className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Rapport de Colisage</h1>
          <p className="text-sm text-muted-foreground">Saisie et comptage des marchandises</p>
        </div>
        <Badge className="bg-accent text-white text-sm px-3 py-1 rounded-full">
          {dossier.reference}
        </Badge>
      </div>

      {/* === INFORMATIONS DU DOSSIER (créées par l'inspecteur) === */}
      <div className="rounded-2xl border border-accent/10 bg-background overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-accent/10 bg-muted/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            Informations du dossier — données de l'inspecteur
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 divide-x divide-border">
          {[
            { label: "Référence", value: dossier.reference },
            { label: "Importateur", value: dossier.importateur },
            { label: "Type", value: dossier.type },
            { label: "Référence DRA", value: dossier.dra },
            { label: "T1", value: dossier.t1 },
            { label: "Date création", value: dossier.created_at ? new Date(dossier.created_at).toLocaleDateString("fr-FR") : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {label}
              </p>
              <p className="font-semibold text-sm truncate" title={String(value)}>
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-border border-t border-border">
          {[
            { label: "Marchandises", value: dossier.type_marchandises || dossier.type || "—" },
            { label: "Véhicule", value: dossier.vehicule },
            { label: "Provenance", value: dossier.provenance },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {label}
              </p>
              <p className="font-semibold text-sm truncate" title={value}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* === FORMULAIRE D'AJOUT === */}
      <div className="rounded-2xl border border-accent/10 bg-background/60 p-5 shadow-sm">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-accent" />
          Ajouter une marchandise
        </h3>
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Description de la marchandise <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ex : Télévision, Radios, Groupe électrogène..."
              className="rounded-xl border-accent/20 focus:border-accent"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ajouterArticle()}
            />
          </div>
          <div className="w-full md:w-40 space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Poids / colis (kg) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Ex : 20"
              className="rounded-xl border-accent/20 focus:border-accent"
              value={poids}
              onChange={(e) => setPoids(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ajouterArticle()}
            />
          </div>
          <Button
            onClick={ajouterArticle}
            className="rounded-xl bg-accent hover:bg-accent/90 gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* === TABLEAU DES ARTICLES === */}
      <div className="rounded-2xl border border-accent/10 bg-background overflow-hidden shadow-xl shadow-accent/5">
        <div className="px-5 py-3 border-b border-accent/10 bg-muted/20 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Liste des marchandises
          </h3>
          <span className="text-xs text-muted-foreground">{lignes.length} article(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/5 border-b border-accent/10">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground w-12">N°</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Description marchandise</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground w-40">Quantité</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Poids / colis</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Poids total</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/5">
              {lignes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-3 opacity-10" />
                      <p className="text-sm font-medium">Aucun article ajouté</p>
                      <p className="text-xs mt-1 opacity-60">Utilisez le formulaire ci-dessus pour ajouter des marchandises</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lignes.map((ligne, idx) => {
                  const total = ligne.quantite * ligne.poidsParColis;
                  return (
                    <tr key={ligne.id} className="hover:bg-accent/[0.03] transition-colors group">
                      {/* N° */}
                      <td className="px-4 py-4 text-xs font-mono text-muted-foreground font-bold">
                        {idx + 1}
                      </td>
                      {/* Description */}
                      <td className="px-4 py-4 font-semibold text-foreground">
                        {ligne.description}
                      </td>
                      {/* Quantité avec boutons +/- */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg border-accent/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                            onClick={() => changerQte(ligne.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-bold text-lg">
                            {ligne.quantite}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 rounded-lg border-accent/20 hover:bg-accent/10 hover:border-accent/40 hover:text-accent"
                            onClick={() => changerQte(ligne.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      {/* Poids / colis */}
                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {ligne.poidsParColis.toLocaleString()} kg
                      </td>
                      {/* Poids total (calculé) */}
                      <td className="px-4 py-4 text-right font-bold text-accent">
                        {total.toLocaleString()} kg
                      </td>
                      {/* Supprimer */}
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => supprimerLigne(ligne.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* === LIGNE TOTAUX === */}
            {lignes.length > 0 && (
              <tfoot>
                <tr className="bg-accent text-white">
                  <td className="px-4 py-4" colSpan={2}>
                    <div className="flex items-center gap-2 font-bold">
                      <Scale className="h-4 w-4" />
                      TOTAL GÉNÉRAL
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-2xl font-black">{totaux.quantite}</span>
                    <span className="text-xs ml-1 opacity-75">PCS</span>
                  </td>
                  <td className="px-4 py-4 text-right text-sm opacity-75">—</td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-2xl font-black">{totaux.poids.toLocaleString()}</span>
                    <span className="text-xs ml-1 opacity-75">kg</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* === NOTES & AVERTISSEMENT === */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Notes et observations
          </label>
          <textarea
            className="w-full h-28 rounded-xl border border-accent/20 bg-background p-3 text-sm focus:border-accent outline-none resize-none transition-all"
            placeholder="Anomalies, observations sur l'état des colis..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex-1 p-4 rounded-xl border border-accent/10 bg-accent/5 flex items-start gap-3">
            <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              En cliquant sur <strong>Soumettre</strong>, les données seront
              immédiatement transmises au <strong>Chef Entrepôt</strong> qui
              pourra consulter le rapport sous la référence du dossier.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-accent/10 bg-muted/20 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Récapitulatif</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Quantité totale :</span>
              <span className="font-black text-xl text-accent">{totaux.quantite}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Poids total :</span>
              <span className="font-black text-xl text-accent">{totaux.poids.toLocaleString()} kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* === BARRE D'ACTIONS FLOTTANTE === */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 items-center px-6 py-3 rounded-2xl border border-accent/20 bg-background/95 backdrop-blur-md shadow-2xl shadow-black/20">
        <span className="text-sm text-muted-foreground mr-2">
          {lignes.length} article(s) · {totaux.quantite} unités · {totaux.poids.toLocaleString()} kg
        </span>
        <Button variant="outline" onClick={() => window.print()} className="rounded-xl gap-2 border-accent/20">
          <Printer className="h-4 w-4" />
          Imprimer
        </Button>
        <Button onClick={soumettre} disabled={submitting} className="rounded-xl bg-accent hover:bg-accent/90 gap-2 shadow-lg shadow-accent/30">
          <Send className="h-4 w-4" />
          {submitting ? "Soumission..." : "Soumettre au Chef Entrepôt"}
        </Button>
      </div>
    </div>
  );
}
