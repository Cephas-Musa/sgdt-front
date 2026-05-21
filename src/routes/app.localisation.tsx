import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MapPin, Building2, Truck, Navigation, ArrowRight } from "lucide-react";
import { DOSSIERS } from "@/lib/mock";

export const Route = createFileRoute("/app/localisation")({
  component: LocalisationPage,
});

const vehicules = [
  {
    id: 1,
    plaque: "AA 1001 XY",
    position: "Barrière entrée",
    status: "en_attente",
    depuis: "2h30",
  },
  { id: 2, plaque: "BC 1005 ZA", position: "Entrepôt 1", status: "stationne", depuis: "1j" },
  { id: 3, plaque: "CC 1011 BB", position: "Entrepôt 2", status: "stationne", depuis: "4h" },
  {
    id: 4,
    plaque: "AB 1019 XY",
    position: "Barrière entrée",
    status: "en_transit",
    depuis: "30min",
  },
  { id: 5, plaque: "AA 1024 ZA", position: "Parking", status: "stationne", depuis: "2j" },
  { id: 6, plaque: "BC 1030 BB", position: "Entrepôt 1", status: "chargement", depuis: "1h" },
  { id: 7, plaque: "CC 1035 XY", position: "En route", status: "en_transit", depuis: "45min" },
  { id: 8, plaque: "AB 1040 ZA", position: "Entrepôt 2", status: "dechargement", depuis: "2h" },
];

const posColor = (p: string) =>
  p.includes("Barrière")
    ? "bg-warning/15 text-warning"
    : p.includes("Entrepôt")
      ? "bg-info/15 text-info"
      : p === "En route"
        ? "bg-accent/15 text-accent"
        : "bg-muted text-muted-foreground";

const statColor = (s: string) =>
  s === "en_transit"
    ? "bg-accent/15 text-accent"
    : s === "chargement" || s === "dechargement"
      ? "bg-success/15 text-success"
      : s === "en_attente"
        ? "bg-warning/15 text-warning"
        : "bg-muted text-muted-foreground";

function LocalisationPage() {
  const barriereCount = vehicules.filter((v) => v.position.includes("Barrière")).length;
  const entrepot1 = vehicules.filter((v) => v.position === "Entrepôt 1").length;
  const entrepot2 = vehicules.filter((v) => v.position === "Entrepôt 2").length;
  const autres = vehicules.filter(
    (v) => !v.position.includes("Barrière") && !v.position.includes("Entrepôt"),
  ).length;

  return (
    <div>
      <PageHeader
        title="Localisation véhicules"
        description="Position actuelle des véhicules en transit et en stationnement"
      />

      {/* Résumé positions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
          <MapPin className="mx-auto h-8 w-8 text-warning mb-2" />
          <div className="font-medium">Barrière entrée</div>
          <div className="text-3xl font-bold mt-1">{barriereCount}</div>
          <div className="text-xs text-muted-foreground mt-1">véhicules en attente</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
          <Building2 className="mx-auto h-8 w-8 text-info mb-2" />
          <div className="font-medium">Entrepôt 1</div>
          <div className="text-3xl font-bold mt-1">{entrepot1}</div>
          <div className="text-xs text-muted-foreground mt-1">véhicules</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
          <Building2 className="mx-auto h-8 w-8 text-accent mb-2" />
          <div className="font-medium">Entrepôt 2</div>
          <div className="text-3xl font-bold mt-1">{entrepot2}</div>
          <div className="text-xs text-muted-foreground mt-1">véhicules</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-all cursor-pointer">
          <Truck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <div className="font-medium">Autres / En route</div>
          <div className="text-3xl font-bold mt-1">{autres}</div>
          <div className="text-xs text-muted-foreground mt-1">en transit ou parking</div>
        </div>
      </div>

      {/* Flux visuel */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-accent" />
          Flux des véhicules
        </h3>
        <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
          <div className="rounded-lg bg-warning/10 border border-warning/30 px-4 py-3 text-center">
            <div className="font-bold text-lg">{barriereCount}</div>
            <div className="text-xs">Barrière</div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="rounded-lg bg-info/10 border border-info/30 px-4 py-3 text-center">
            <div className="font-bold text-lg">{entrepot1 + entrepot2}</div>
            <div className="text-xs">Entrepôts</div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-center">
            <div className="font-bold text-lg">
              {DOSSIERS.filter((d) => d.status === "apure").length}
            </div>
            <div className="text-xs">Sortis / Apurés</div>
          </div>
        </div>
      </div>

      {/* Table détaillée */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-medium">Détail des véhicules ({vehicules.length})</h3>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-3 py-2">Plaque</th>
                <th className="px-3 py-2">Position actuelle</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Depuis</th>
              </tr>
            </thead>
            <tbody>
              {vehicules.map((v) => (
                <tr
                  key={v.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 font-mono font-medium">{v.plaque}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${posColor(v.position)}`}>
                      {v.position}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs capitalize ${statColor(v.status)}`}
                    >
                      {v.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{v.depuis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
