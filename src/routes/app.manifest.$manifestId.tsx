import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Truck, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { useApi, apiGetEmptyManifests } from "@/lib/api";
import type { EmptyManifest } from "@/lib/mock";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/manifest/$manifestId")({
  component: ManifestDetailPage,
});

function ManifestDetailPage() {
  const { user } = useAuth();
  const { manifestId } = useParams({ from: "/app/manifest/$manifestId" });
  const router = useRouter();

  const { data: rawManifests } = useApi(apiGetEmptyManifests);
  const manifests = (rawManifests as EmptyManifest[] ?? []);
  const manifest = manifests.find((m) => String(m.id) === manifestId);
  const canSeeAmount = user?.role === "super_admin";

  if (!manifest) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Manifest non trouvé</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const statusIcons = {
    payé: "✓",
    "barrière 1": "1️⃣",
    "barrière 2": "2️⃣",
    cachet: "🔴",
    "sortie Ouganda": "🚚",
  };

  const statusColors = {
    payé: "bg-green-100 text-green-800",
    "barrière 1": "bg-blue-100 text-blue-800",
    "barrière 2": "bg-blue-100 text-blue-800",
    cachet: "bg-yellow-100 text-yellow-800",
    "sortie Ouganda": "bg-green-100 text-green-800",
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <PageHeader
          title={`Empty Manifest ${manifest.reference}`}
          description={manifest.vehicule}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statut du manifest */}
          <div className={`rounded-lg border p-6 ${statusColors[manifest.status]}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Statut actuel</h2>
                <p className="text-sm mt-1">{manifest.status}</p>
              </div>
              <span className="text-4xl">{statusIcons[manifest.status]}</span>
            </div>
          </div>

          {/* Informations générales */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Informations générales</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Référence</div>
                  <div className="font-mono font-medium">{manifest.reference}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date</div>
                  <div className="font-medium">{manifest.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Montant</div>
                  <div className="font-bold text-lg">
                    {canSeeAmount ? `USD ${manifest.montant}` : "Confidentiel"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Paiement</div>
                  <Badge variant={manifest.status === "payé" ? "default" : "outline"}>
                    {manifest.status === "payé" ? "✓ Payé" : "⏳ En attente"}
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
                  <div className="font-mono font-bold text-lg">{manifest.vehicule}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Marque</div>
                  <div className="font-medium">{manifest.marque}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Intervenants */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Intervenants</h2>

            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-md border border-border">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">Déclarant</p>
                  <p className="font-medium">{manifest.declarant}</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-md border border-border">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs">Receveur</p>
                  <p className="font-medium">{manifest.receveur}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Barrière entrée</p>
                  <p className="font-medium text-sm">{manifest.barriereEntree}</p>
                </div>
                <div className="p-3 rounded-md border border-border">
                  <p className="text-muted-foreground text-xs mb-1">Barrière sortie</p>
                  <p className="font-medium text-sm">{manifest.barriereSortie}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flux du traitement */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Progression du Empty Manifest</h2>

            <div className="space-y-2">
              {["payé", "barrière 1", "barrière 2", "cachet", "sortie Ouganda"].map((status, i) => {
                const isActive =
                  ["payé", "barrière 1", "barrière 2", "cachet", "sortie Ouganda"].indexOf(
                    manifest.status,
                  ) >= i;
                const isCompleted =
                  ["payé", "barrière 1", "barrière 2", "cachet", "sortie Ouganda"].indexOf(
                    manifest.status,
                  ) > i;
                const isCurrent = manifest.status === status;

                return (
                  <div key={status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-muted"
                        }`}
                      />
                      {i < 4 && <div className="w-0.5 h-6 bg-border" />}
                    </div>
                    <div className={`py-2 ${isCurrent ? "font-bold text-blue-600" : ""}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Destination</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Destination finale</p>
                <p className="font-medium text-base">{manifest.destination}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                📋 Détails
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                ✓ Valider étape
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                📝 Notes
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-semibold text-sm">Informations rapides</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Référence</span>
                <span className="font-mono text-xs">{manifest.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-medium">
                  {canSeeAmount ? `USD ${manifest.montant}` : "Confidentiel"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{manifest.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
