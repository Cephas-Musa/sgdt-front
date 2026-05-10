import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { EMPTY_MANIFESTS } from "@/lib/mock";
import { Plus, Search, Filter, Edit, Trash2, DollarSign } from "lucide-react";
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

  const filtered = EMPTY_MANIFESTS.filter(m =>
    (filterStatus === "all" || m.status === filterStatus) &&
    (!search || m.reference.toLowerCase().includes(search.toLowerCase()) || m.declarant.toLowerCase().includes(search.toLowerCase()))
  );

  const canSeeAmount = user?.role === "super_admin";
  const totalRevenue = canSeeAmount ? filtered.reduce((s, m) => s + m.montant, 0) : 0;

  return (
    <div>
      <PageHeader
        title="Manifests"
        description="Gestion complète des manifests — CRUD, revenus, filtrage"
        actions={
          <FormDialog trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau manifest</Button>} title="Créer un manifest" onSubmit={() => toast.success("Manifest créé")}>
            <FormGrid>
              <Field label="Référence" required><Input placeholder="MAN-…" /></Field>
              <Field label="Déclarant" required><Input /></Field>
              <Field label="Véhicule / Plaque" required><Input /></Field>
              <Field label="Marque"><Input /></Field>
              <Field label="Type véhicule"><Input /></Field>
              <Field label="Destination" required><Input /></Field>
              {canSeeAmount && <Field label="Montant ($)" required><Input type="number" /></Field>}
              <Field label="Barrière entrée"><Input /></Field>
              <Field label="Barrière sortie"><Input /></Field>
            </FormGrid>
          </FormDialog>
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
          <Input placeholder="Référence ou déclarant…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><Filter className="mr-1 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="payé">Payé</SelectItem>
            <SelectItem value="en_attente">En attente</SelectItem>
          </SelectContent>
        </Select>
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
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2"><Link to="/app/manifest/$manifestId" params={{ manifestId: m.id }} className="text-accent hover:underline font-mono text-xs">{m.reference}</Link></td>
                <td className="px-3 py-2">{m.declarant}</td>
                <td className="px-3 py-2">{m.vehicule}</td>
                <td className="px-3 py-2">{m.marque}</td>
                <td className="px-3 py-2 font-semibold">{canSeeAmount ? `$${m.montant}` : <span className="text-muted-foreground">Confidentiel</span>}</td>
                <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "payé" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{m.status}</span></td>
                <td className="px-3 py-2 text-muted-foreground">{m.date}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-1 justify-end">
                    <FormDialog trigger={<Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${m.reference}`} onSubmit={() => toast.success("Manifest modifié")}>
                      <FormGrid>
                        <Field label="Référence"><Input defaultValue={m.reference} /></Field>
                        <Field label="Déclarant"><Input defaultValue={m.declarant} /></Field>
                        <Field label="Véhicule"><Input defaultValue={m.vehicule} /></Field>
                        {canSeeAmount && <Field label="Montant ($)"><Input type="number" defaultValue={m.montant} /></Field>}
                      </FormGrid>
                    </FormDialog>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.success("Manifest supprimé")}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucun manifest trouvé</div>}
      </div>
    </div>
  );
}
