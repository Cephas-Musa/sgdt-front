import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Building2, Users, Map, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIRECTIONS_PROVINCIALES, BUREAUX_DOUANIERS, ACCOUNTS } from "@/lib/mock";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/directions/$directionId")({
  component: DirectionDetailPage,
});

function DirectionDetailPage() {
  const { directionId } = useParams({ from: "/app/directions/$directionId" });
  const router = useRouter();

  const direction = DIRECTIONS_PROVINCIALES.find((d) => d.id === directionId);

  if (!direction) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Direction non trouvée</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Retour
          </Button>
        </div>
      </div>
    );
  }

  const bureaux = BUREAUX_DOUANIERS.filter(b => b.province === direction.denomination);
  const agents = ACCOUNTS.filter(a => a.province === direction.denomination);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />Retour
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Info principale */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Map className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Direction {direction.denomination}</h1>
                <p className="text-sm text-muted-foreground">Direction provinciale Nº {direction.numero}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Dénomination</div>
                <div className="font-medium">{direction.denomination}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Numéro</div>
                <div className="font-medium">{direction.numero}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Users className="h-3 w-3" /> Directeur</div>
                <div className="font-medium">{direction.directeur}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Building2 className="h-3 w-3" /> Nombre de bureaux</div>
                <div className="font-medium">{direction.nombreBureaux}</div>
              </div>
              {direction.telephone && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Phone className="h-3 w-3" /> Téléphone</div>
                  <div className="text-sm">{direction.telephone}</div>
                </div>
              )}
              {direction.email && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Mail className="h-3 w-3" /> Email</div>
                  <div className="text-sm">{direction.email}</div>
                </div>
              )}
              {direction.dateCreation && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Calendar className="h-3 w-3" /> Date de création</div>
                  <div className="text-sm">{direction.dateCreation}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bureaux de cette province */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg">Bureaux douaniers ({bureaux.length})</h2>
            {bureaux.length > 0 ? (
              <div className="divide-y divide-border">
                {bureaux.map((b) => (
                  <Link
                    key={b.id}
                    to="/app/bureaux/$bureauId"
                    params={{ bureauId: b.id }}
                    className="flex items-center justify-between py-3 px-2 hover:bg-muted/30 rounded-md transition-colors"
                  >
                    <div>
                      <div className="font-medium">{b.denomination}</div>
                      <div className="text-xs text-muted-foreground font-mono">{b.code}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{b.icb ?? "—"}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">Aucun bureau enregistré pour cette province</div>
            )}
          </div>
        </div>

        {/* Sidebar — agents */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Agents de la province ({agents.length})</h3>
            <div className="space-y-2">
              {agents.map((a) => (
                <Link
                  key={a.id}
                  to="/app/comptes/$compteId"
                  params={{ compteId: a.id }}
                  className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{a.fullName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{a.role.replace(/_/g, " ")}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                </Link>
              ))}
              {agents.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">Aucun agent</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
