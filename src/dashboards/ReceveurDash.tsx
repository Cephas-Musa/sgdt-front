import { useState } from "react";
import { FileText, CheckCircle, Search, Stamp } from "lucide-react";
import { DashHeader, StatCard, Panel } from "./_shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EMPTY_MANIFESTS } from "@/lib/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ReceveurDash() {
  const [search, setSearch] = useState("");
  const [stampedManifests, setStampedManifests] = useState<Set<string>>(new Set());

  const filteredManifests = EMPTY_MANIFESTS.filter(
    (m) => !search || (m.reference || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleStamp = (id: string) => {
    if (stampedManifests.has(id)) return;
    setStampedManifests((prev) => new Set(prev).add(id));
    toast.success("Manifeste confirmé par cachet.");
  };

  return (
    <div className="space-y-6">
      <DashHeader subtitle="Receveur — Confirmation et Cachet des manifestes" />
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Empty Manifests" value={EMPTY_MANIFESTS.length} />
        <StatCard icon={CheckCircle} label="Confirmés (Cachet)" value={stampedManifests.size} />
      </div>

      <Panel title="Manifestes en attente de confirmation">
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par numéro de manifeste…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-bold uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Nº Manifeste</th>
                <th className="px-3 py-3">Véhicule / Plaque</th>
                <th className="px-3 py-3">Marque</th>
                <th className="px-3 py-3">Destination</th>
                <th className="px-3 py-3">État Confirmation</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredManifests.map((m) => {
                const isStamped = stampedManifests.has(m.id);
                return (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold text-primary">{m.reference}</td>
                    <td className="px-3 py-3">{m.vehicule}</td>
                    <td className="px-3 py-3">{m.marque}</td>
                    <td className="px-3 py-3 font-medium">{m.destination}</td>
                    <td className="px-3 py-3">
                      {isStamped ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/20 uppercase">
                          <CheckCircle className="h-3.5 w-3.5" /> Cacheté
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-3 py-1">En attente de cachet...</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        size="sm"
                        variant={isStamped ? "ghost" : "default"}
                        disabled={isStamped}
                        onClick={() => handleStamp(m.id)}
                        className={cn(
                          "min-w-[100px] font-bold uppercase transition-all",
                          !isStamped && "bg-orange-600 hover:bg-orange-700 text-white shadow shadow-orange-900/20"
                        )}
                      >
                        {isStamped ? (
                          "Validé"
                        ) : (
                          <span className="flex items-center gap-2">
                            <Stamp className="h-4 w-4" /> Cachet
                          </span>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
