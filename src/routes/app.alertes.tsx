import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Plus, Trash2, Eye, EyeOff, Edit, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { ALERTS } from "@/lib/mock";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/alertes")({
  component: AlertesPage,
});

function AlertesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = ALERTS.filter(a =>
    (filter === "all" || a.level === filter) &&
    (!search || a.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Alertes"
        description="Gestion complète des alertes — créer, lire, modifier, supprimer, marquer lu/non lu"
        actions={
          <FormDialog
            trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouvelle alerte</Button>}
            title="Créer une alerte"
            onSubmit={() => toast.success("Alerte créée")}
          >
            <FormGrid>
              <Field label="Titre" required><Input placeholder="Titre de l'alerte" /></Field>
              <Field label="Type" required>
                <Select><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dossier">Dossier</SelectItem>
                    <SelectItem value="vehicule">Véhicule</SelectItem>
                    <SelectItem value="compte">Compte</SelectItem>
                    <SelectItem value="systeme">Système</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Niveau" required>
                <Select><SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Message"><Input placeholder="Détails…" /></Field>
            </FormGrid>
          </FormDialog>
        }
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><Filter className="mr-1 h-4 w-4" /><SelectValue placeholder="Filtrer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors">
            <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${a.level === "urgent" ? "bg-destructive" : a.level === "important" ? "bg-warning" : "bg-info"}`} />
            <div className="min-w-0 flex-1">
              <Link to="/app/alertes/$alerteId" params={{ alerteId: a.id }}>
                <div className="font-medium hover:text-accent transition-colors cursor-pointer">{a.title}</div>
              </Link>
              <div className="text-xs text-muted-foreground mt-0.5">
                <span className="capitalize">{a.type}</span> · {a.date} · <span className={`font-medium ${a.level === "urgent" ? "text-destructive" : a.level === "important" ? "text-warning" : "text-info"}`}>{a.level}</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => toast.success("Marqué comme lu")} title="Marquer lu/non lu">
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <FormDialog trigger={<Button size="sm" variant="ghost"><Edit className="h-3.5 w-3.5" /></Button>} title={`Modifier — ${a.title}`} onSubmit={() => toast.success("Alerte modifiée")}>
                <FormGrid>
                  <Field label="Titre"><Input defaultValue={a.title} /></Field>
                  <Field label="Niveau">
                    <Select defaultValue={a.level}><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="important">Important</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </FormGrid>
              </FormDialog>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast.success("Alerte supprimée")}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">Aucune alerte trouvée</div>
        )}
      </div>
    </div>
  );
}
