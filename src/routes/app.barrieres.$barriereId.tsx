import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Truck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { BARRIERE_ENTRIES, type BarriereEntry } from "@/lib/mock";

export const Route = createFileRoute("/app/barrieres/$barriereId")({
  component: BarriereDetailPage,
});

function BarriereDetailPage() {
  const { barriereId } = useParams({ from: "/app/barrieres/$barriereId" });
  const router = useRouter();

  const entree = BARRIERE_ENTRIES.find((e) => e.id === barriereId);

  if (!entree) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Entrée barrière non trouvée</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <PageHeader
          title={`Mouvement barrière ${entree.reference}`}
          description={entree.vehicule}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Informations générales</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Référence</div>
                  <div className="font-mono font-medium text-sm">{entree.reference}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date</div>
                  <div className="font-medium text-sm">{entree.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type de mouvement</div>
                  <Badge variant={entree.sens === "entrée" ? "default" : "secondary"}>
                    {entree.sens === "entrée" ? "↓ Entrée" : "↑ Sortie"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">État du véhicule</div>
                  <Badge variant={entree.charge === "chargé" ? "destructive" : "outline"}>
                    {entree.charge === "chargé" ? "🚚 Chargé" : "⚪ Vide"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du véhicule */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Détails du véhicule</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Immatriculation</div>
                  <div className="font-mono font-bold text-lg">{entree.vehicule}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <div className="font-medium">
                    {entree.type === "véhicule" ? "Véhicule" : "Vrac"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents associés */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Documents & Contrôle</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="text-sm">
                  <p className="font-medium">📋 Déclaration douanière</p>
                  <p className="text-xs text-muted-foreground">DRA / Référence T1</p>
                </div>
                <span className="text-xs font-medium text-green-600">✓ Conforme</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="text-sm">
                  <p className="font-medium">📄 Manifeste de charge</p>
                  <p className="text-xs text-muted-foreground">Détail des articles</p>
                </div>
                <span className="text-xs font-medium text-green-600">✓ Présent</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="text-sm">
                  <p className="font-medium">🔍 Contrôle physique</p>
                  <p className="text-xs text-muted-foreground">Inspection barrière</p>
                </div>
                <span className="text-xs font-medium text-yellow-600">⏳ En cours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Résumé</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Véhicule</p>
                  <p className="font-mono font-medium">{entree.vehicule}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Direction</p>
                  <p className="font-medium capitalize">{entree.sens}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{entree.date}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                📝 Ajouter note
              </Button>
              <Button variant="outline" className="w-full">
                ✓ Valider
              </Button>
              <Button variant="outline" className="w-full">
                ❌ Bloquer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
