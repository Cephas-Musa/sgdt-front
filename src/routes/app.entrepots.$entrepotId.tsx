import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Package, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ENTREPOTS, type Entrepot } from "@/lib/mock";

export const Route = createFileRoute("/app/entrepots/$entrepotId")({
  component: EntrepotDetailPage,
});

function EntrepotDetailPage() {
  const { entrepotId } = useParams({ from: "/app/entrepots/$entrepotId" });
  const router = useRouter();

  const entrepot = ENTREPOTS.find((e) => e.id === entrepotId);

  if (!entrepot) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Entrepôt non trouvé</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const utilisationPourcentage = 65;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <PageHeader title={entrepot.nom} description={entrepot.code} />
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
                  <div className="text-sm text-muted-foreground mb-1">Code</div>
                  <div className="font-mono font-medium">{entrepot.code}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bureau</div>
                  <div className="font-medium">{entrepot.bureau}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Dénomination</div>
                <div className="font-medium text-base">{entrepot.nom}</div>
              </div>
            </div>
          </div>

          {/* Utilisation capacité */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Capacité de stockage</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Utilisation</span>
                  <span className="text-sm font-medium">{utilisationPourcentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${utilisationPourcentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">Capacité totale</p>
                  <p className="font-bold text-lg">{entrepot.capacite}</p>
                  <p className="text-xs text-muted-foreground">unités</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">Utilisée</p>
                  <p className="font-bold text-lg">
                    {Math.round((entrepot.capacite * utilisationPourcentage) / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground">unités</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">Disponible</p>
                  <p className="font-bold text-lg">
                    {Math.round((entrepot.capacite * (100 - utilisationPourcentage)) / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground">unités</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Mouvements récents</h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📥</span>
                  <div className="text-sm">
                    <p className="font-medium">Entrée - Dossier DSR/2025/1001</p>
                    <p className="text-xs text-muted-foreground">2025-10-28 14:30</p>
                  </div>
                </div>
                <span className="text-sm font-medium">+50 units</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📤</span>
                  <div className="text-sm">
                    <p className="font-medium">Sortie - Dossier DSR/2025/0995</p>
                    <p className="text-xs text-muted-foreground">2025-10-28 10:15</p>
                  </div>
                </div>
                <span className="text-sm font-medium">-30 units</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/30 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📥</span>
                  <div className="text-sm">
                    <p className="font-medium">Entrée - Dossier DSR/2025/0992</p>
                    <p className="text-xs text-muted-foreground">2025-10-27 09:45</p>
                  </div>
                </div>
                <span className="text-sm font-medium">+45 units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Statut</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${utilisationPourcentage > 80 ? "bg-destructive" : utilisationPourcentage > 60 ? "bg-warning" : "bg-green-500"}`}
                />
                <span className="text-sm">
                  {utilisationPourcentage > 80
                    ? "Capacité critique"
                    : utilisationPourcentage > 60
                      ? "Capacité acceptable"
                      : "Capacité normale"}
                </span>
              </div>
              <Badge variant={utilisationPourcentage > 80 ? "destructive" : "outline"}>
                {utilisationPourcentage}% utilisée
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                📋 Inventaire
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                📊 Rapports
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                ⚙️ Paramètres
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold text-sm">Détails rapides</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className="font-mono">{entrepot.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacité</span>
                <span className="font-medium">{entrepot.capacite} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bureau</span>
                <span className="font-medium">{entrepot.bureau}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
