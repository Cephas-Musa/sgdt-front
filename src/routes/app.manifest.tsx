import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { useApi, apiGetEmptyManifests } from "@/lib/api";
import { Plus, Search, Filter, Edit, Trash2, DollarSign, Building2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/app/manifest")({
  component: ManifestPage,
});

function ManifestPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBureau, setFilterBureau] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: rawManifests, loading: manifestsLoading } = useApi(apiGetEmptyManifests);
  type Manifest = { id: number|string; reference: string; declarant: string; vehicule: string; marque: string; montant: number; status: string; date: string; barriereSortie: string };
  const manifests = (rawManifests as Manifest[] ?? []);

  const filtered = manifests.filter(
    (m) =>
      (filterStatus === "all" || m.status === filterStatus) &&
      (filterBureau === "all" || (m.barriereSortie ?? "").toLowerCase() === filterBureau.toLowerCase()) &&
      (!startDate || m.date >= startDate) &&
      (!endDate || m.date <= endDate) &&
      (!search ||
        m.reference.toLowerCase().includes(search.toLowerCase()) ||
        m.declarant.toLowerCase().includes(search.toLowerCase())),
  );

  const canSeeAmount = user?.role === "super_admin";
  const totalRevenue = canSeeAmount ? filtered.reduce((s, m) => s + (m.montant ?? 0), 0) : 0;

  return (
    <div>
      <PageHeader
        title="Empty Manifest"
        description="Gestion complète des manifests vides — revenus, filtrage par bureau et date"
        actions={
          user?.role !== "super_admin" && (
            <FormDialog
              trigger={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Nouveau manifest
                </Button>
              }
              title="Créer un manifest"
              onSubmit={() => toast.success("Manifest créé")}
            >
              <FormGrid>
                <Field label="Référence" required>
                  <Input placeholder="MAN-…" />
                </Field>
                <Field label="Déclarant" required>
                  <Input />
                </Field>
                <Field label="Véhicule / Plaque" required>
                  <Input />
                </Field>
                <Field label="Marque">
                  <Input />
                </Field>
                <Field label="Type véhicule">
                  <Input />
                </Field>
                <Field label="Destination" required>
                  <Input />
                </Field>
                <Field label="Barrière entrée">
                  <Input />
                </Field>
                <Field label="Barrière sortie">
                  <Input />
                </Field>
              </FormGrid>
            </FormDialog>
          )
        }
      />

      {/* Revenu total */}
      {canSeeAmount ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4">
          <DollarSign className="h-6 w-6 text-success" />
          <div>
            <div className="text-sm text-success font-medium">Revenus manifests filtrés</div>
            <div className="text-2xl font-bold text-success">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">{filtered.length} manifest(s)</div>
        </div>
      ) : (
        <div className="mb-4 rounded-lg border border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground">
          Les montants des empty manifests sont confidentiels et réservés au Super Admin.
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Référence ou déclarant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-1 h-4 w-4" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="payé">Payé</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBureau} onValueChange={setFilterBureau}>
          <SelectTrigger className="w-[180px]">
            <Building2 className="mr-1 h-4 w-4" />
            <SelectValue placeholder="Par bureau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les bureaux</SelectItem>
            <SelectItem value="Kasindi">Kasindi</SelectItem>
            <SelectItem value="Goma ville">Goma ville</SelectItem>
            <SelectItem value="Mpondwe">Mpondwe</SelectItem>
            <SelectItem value="Chanika">Chanika</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[140px]"
          />
          <span className="text-muted-foreground text-xs">au</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[140px]"
          />
        </div>
        {(search || filterStatus !== "all" || filterBureau !== "all" || startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
              setFilterBureau("all");
              setStartDate("");
              setEndDate("");
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground bg-muted/50">
            <tr>
              <th className="px-3 py-2">Réf.</th>
              <th className="px-3 py-2">Déclarant</th>
              <th className="px-3 py-2">Véhicule</th>
              <th className="px-3 py-2">Marque</th>
              <th className="px-3 py-2">Montant</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2">
                  <Link
                    to="/app/manifest/$manifestId"
                    params={{ manifestId: m.id }}
                    className="text-accent hover:underline font-mono text-xs"
                  >
                    {m.reference}
                  </Link>
                </td>
                <td className="px-3 py-2">{m.declarant}</td>
                <td className="px-3 py-2">{m.vehicule}</td>
                <td className="px-3 py-2">{m.marque}</td>
                <td className="px-3 py-2 font-semibold">
                  {canSeeAmount ? (
                    `$${m.montant}`
                  ) : (
                    <span className="text-muted-foreground">Confidentiel</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun manifest trouvé</div>
        )}
      </div>
    </div>
  );
}
