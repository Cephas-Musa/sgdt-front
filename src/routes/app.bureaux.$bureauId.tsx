import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Building2, Users, Shield, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUREAUX_DOUANIERS, ACCOUNTS } from "@/lib/mock";
import { ROLE_LABELS } from "@/lib/roles";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/bureaux/$bureauId")({
  component: BureauDetailPage,
});

function BureauDetailPage() {
  const { bureauId } = useParams({ from: "/app/bureaux/$bureauId" });
  const router = useRouter();

  const bureau = BUREAUX_DOUANIERS.find((b) => b.id === bureauId);

  if (!bureau) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bureau non trouvé</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />Retour
          </Button>
        </div>
      </div>
    );
  }

  const agents = ACCOUNTS.filter(a => a.bureau === bureau.denomination);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />Retour
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Bureau {bureau.denomination}</h1>
                <p className="text-sm text-muted-foreground">Code: {bureau.code}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Code</div>
                <div className="font-mono font-medium">{bureau.code}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Dénomination</div>
                <div className="font-medium">{bureau.denomination}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><Shield className="h-3 w-3" /> ICB</div>
                <div className="text-sm">{bureau.icb ?? "Non attribué"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1"><MapPin className="h-3 w-3" /> Province</div>
                <div className="text-sm">{bureau.province ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* Agents rattachés */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-semibold text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Agents rattachés ({agents.length})</h2>
            {agents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="px-3 py-2">Nom</th>
                      <th className="px-3 py-2">Rôle</th>
                      <th className="px-3 py-2">Matricule</th>
                      <th className="px-3 py-2">Téléphone</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((a) => (
                      <tr key={a.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <Link to="/app/comptes/$compteId" params={{ compteId: a.id }} className="text-accent hover:underline font-medium">{a.fullName}</Link>
                        </td>
                        <td className="px-3 py-2">{ROLE_LABELS[a.role]?.fr ?? a.role}</td>
                        <td className="px-3 py-2 font-mono text-xs">{a.matricule}</td>
                        <td className="px-3 py-2">{a.phone}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">Aucun agent rattaché à ce bureau</div>
            )}
          </div>
        </div>

        {/* Stats sidebar */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                <span className="text-sm">Agents</span>
                <span className="font-semibold">{agents.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                <span className="text-sm">Agents actifs</span>
                <span className="font-semibold text-success">{agents.filter(a => a.status === "actif").length}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 p-3">
                <span className="text-sm">Agents désactivés</span>
                <span className="font-semibold text-destructive">{agents.filter(a => a.status === "désactivé").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
