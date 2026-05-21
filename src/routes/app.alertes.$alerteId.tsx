import { createFileRoute } from "@tanstack/react-router";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, Clock, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { ALERTS, type AlertItem } from "@/lib/mock";

export const Route = createFileRoute("/app/alertes/$alerteId")({
  component: AlerteDetailPage,
});

function AlerteDetailPage() {
  const { alerteId } = useParams({ from: "/app/alertes/$alerteId" });
  const router = useRouter();
  const { t } = useI18n();

  const alerte = ALERTS.find((a) => a.id === alerteId);

  if (!alerte) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Alerte non trouvée</h1>
          <Button className="mt-4" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const levelColors = {
    urgent: "bg-destructive/10 text-destructive border-destructive/30",
    important: "bg-warning/10 text-warning border-warning/30",
    info: "bg-info/10 text-info border-info/30",
  };

  const levelLabel = {
    urgent: "Urgent",
    important: "Important",
    info: "Information",
  };

  const typeLabel = {
    fraude: "Fraude",
    incoherence: "Incohérence",
    paiement: "Paiement",
    retard: "Retard",
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <PageHeader title={`Alerte ${alerte.id}`} description={typeLabel[alerte.type]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contenu de l'alerte */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">{alerte.title}</h2>

            <div className="space-y-6">
              {/* Niveau d'alerte */}
              <div className={`rounded-lg border p-4 ${levelColors[alerte.level]}`}>
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm mb-1">Niveau de sévérité</p>
                    <p className="text-lg font-semibold">{levelLabel[alerte.level]}</p>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Type d'alerte</div>
                    <div className="font-medium">{typeLabel[alerte.type]}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date de création</div>
                    <div className="font-medium">{alerte.date}</div>
                  </div>
                </div>
              </div>

              {/* Description détaillée */}
              <div>
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">Description</h3>
                <div className="bg-muted/30 rounded-md p-4 text-sm">
                  <p>{alerte.title}</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>Type: {typeLabel[alerte.type]}</p>
                    <p>Sévérité: {levelLabel[alerte.level]}</p>
                  </div>
                </div>
              </div>

              {/* Actions recommandées */}
              <div>
                <h3 className="font-medium mb-3 text-sm text-muted-foreground">
                  Actions recommandées
                </h3>
                <div className="space-y-2">
                  {alerte.type === "fraude" && (
                    <>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Signaler au Service d'Investigation</p>
                          <p className="text-xs text-muted-foreground">Créer un rapport détaillé</p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-border mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Geler le dossier</p>
                          <p className="text-xs text-muted-foreground">
                            Suspendre le traitement en attente d'enquête
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {alerte.type === "paiement" && (
                    <>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Contacter le déclarant</p>
                          <p className="text-xs text-muted-foreground">
                            Envoyer un avis de paiement
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-border mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Bloquer le dossier</p>
                          <p className="text-xs text-muted-foreground">
                            Empêcher la progression jusqu'au paiement
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {alerte.type === "retard" && (
                    <>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Relancer le responsable</p>
                          <p className="text-xs text-muted-foreground">
                            Envoyer une notification urgente
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {alerte.type === "incoherence" && (
                    <>
                      <div className="flex gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer">
                        <div className="w-5 h-5 rounded-full border-2 border-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium">Demander une correction</p>
                          <p className="text-xs text-muted-foreground">
                            Envoyer une demande de rectification
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-semibold">Information rapide</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Niveau</p>
                  <p className="font-medium text-sm">{levelLabel[alerte.level]}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Type className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-sm">{typeLabel[alerte.type]}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">{alerte.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
