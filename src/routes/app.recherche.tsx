import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { useApi, apiGetDossiers } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, History, Star, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/recherche")({
  component: RecherchePage,
});

function RecherchePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isDP = user?.role === "directeur_provincial";
  const { data: rawDossiers } = useApi(apiGetDossiers);
  type Dossier = { id: number|string; reference: string; importateur?: string; type?: string; date?: string; status: string; bureauRepr?: string };
  const dossiers = (rawDossiers as Dossier[] ?? []);
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDP ? "Moteur de recherche provincial" : t("nav.recherche")}
        description={isDP ? "Recherchez n'importe quel dossier, véhicule ou importateur sur l'ensemble du territoire provincial." : "Dashboard, apurement, dossiers traités."}
      />

      {isDP ? (
        <div className="space-y-8">
           {/* Global Search Hero */}
           <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-accent/5 via-card to-background p-8 md:p-12 shadow-xl border-accent/10">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
              
              <div className="relative max-w-2xl mx-auto space-y-6 text-center">
                 <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Supervision Globale</h3>
                 <p className="text-muted-foreground text-sm md:text-base">Accédez instantanément à l'historique complet des opérations douanières de la province.</p>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                       <Input 
                        placeholder="Référence RD, Numéro Châssis, Nom Importateur..." 
                        className="h-14 pl-12 rounded-2xl border-accent/20 bg-background/80 backdrop-blur-sm text-lg shadow-sm focus:ring-accent/20 focus:border-accent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                       />
                    </div>
                    <Button className="h-14 px-8 rounded-2xl bg-accent text-accent-foreground font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20">
                       Rechercher
                    </Button>
                 </div>

                 <div className="flex flex-wrap gap-2 justify-center pt-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mr-2">
                       <TrendingUp className="h-3 w-3" />
                       Fréquent :
                    </span>
                    {["RD-2024-KAS-001", "TOYOTA HILUX", "LOGI-EXPORT SARL", "DRA-1092"].map(tag => (
                       <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-accent hover:text-white transition-colors rounded-full px-3 py-1"
                        onClick={() => setQuery(tag)}
                       >
                          {tag}
                       </Badge>
                    ))}
                 </div>
              </div>
           </div>

           {/* Stats / Quick Links */}
           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-2xl border bg-card/50 backdrop-blur-sm flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <Star className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Dossiers Favoris</p>
                    <p className="text-lg font-bold">12</p>
                 </div>
              </div>
              <div className="p-4 rounded-2xl border bg-card/50 backdrop-blur-sm flex items-center gap-4">
                 <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <History className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Historique Perso</p>
                    <p className="text-lg font-bold">148</p>
                 </div>
              </div>
           </div>

           {/* Results Preview */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Résultats récents</h4>
                 <Button variant="link" className="text-accent text-xs font-bold">Exporter l'historique</Button>
              </div>
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                 <DataTable
                    data={dossiers.slice(0, 5)}
                    columns={[
                       { key: "reference", header: "RÉFÉRENCE", render: (r) => <span className="font-mono font-bold text-accent">{r.reference}</span> },
                       { key: "importateur", header: "IMPORTATEUR", render: (r) => <span className="font-medium">{r.importateur}</span> },
                       { key: "bureauRepr", header: "BUREAU", render: (r) => <Badge variant="outline" className="font-bold">{r.bureauRepr || "BOMA"}</Badge> },
                       { key: "date", header: "DATE" },
                       { key: "status", header: "STATUT", render: (r) => <StatusBadge status={r.status} /> }
                    ]}
                 />
              </div>
           </div>
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">Dossiers traités</div>
              <div className="mt-2 text-2xl font-semibold">128</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">En cours</div>
              <div className="mt-2 text-2xl font-semibold">14</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">Apurés ce mois</div>
              <div className="mt-2 text-2xl font-semibold">62</div>
            </div>
          </div>
          <DataTable
            data={dossiers.filter((d) => d.status === "verifie" || d.status === "apure")}
            columns={[
              { key: "reference", header: t("common.reference") },
              { key: "importateur", header: t("dossier.importateur") },
              { key: "dra", header: t("dossier.dra") },
              {
                key: "status",
                header: t("common.status"),
                render: (r) => <StatusBadge status={r.status} />,
              },
              { key: "date", header: t("common.date") },
            ]}
          />
        </>
      )}
    </div>
  );
}

