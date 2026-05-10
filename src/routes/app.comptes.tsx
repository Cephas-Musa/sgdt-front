import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { getCreatableRoles } from "@/lib/hierarchy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, KeyRound } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog, Field, FormGrid } from "@/components/FormDialog";
import { toast } from "sonner";
import { useState } from "react";
import { BUREAUX_DOUANIERS, ACCOUNTS, type Account } from "@/lib/mock";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/comptes")({
  component: ComptesPage,
});

function NewAccountDialog() {
  const { user } = useAuth();
  const { lang } = useI18n();
  // Utilise la hiérarchie centralisée : chaque chef ne voit que les rôles en dessous
  const allowed = user ? getCreatableRoles(user.role) : [];
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");

  const generate = () => {
    const p = Math.random().toString(36).slice(2, 10) + "!";
    setPwd(p);
  };

  if (allowed.length === 0) {
    return null; // Aucun rôle créable = pas de bouton
  }

  return (
    <FormDialog
      trigger={<Button><Plus className="mr-1.5 h-4 w-4" />Nouveau compte</Button>}
      title="Création de compte (hiérarchie)"
      onSubmit={() => toast.success("Compte créé. Identifiants envoyés au subordonné.")}
    >
      <FormGrid>
        <Field label="Nom" required><Input /></Field>
        <Field label="Post-nom" required><Input /></Field>
        <Field label="Prénom"><Input /></Field>
        <Field label="Numéro matricule" required><Input /></Field>
        <Field label="Téléphone"><Input /></Field>
        <Field label="Bureau douanier">
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>{BUREAUX_DOUANIERS.map(b => <SelectItem key={b.id} value={b.code}>{b.code} · {b.denomination}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Poste / rôle" required>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
            <SelectContent>
              {allowed.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]?.[lang] ?? r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Identifiant"><Input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="auto-suggéré" /></Field>
        <Field label="Mot de passe">
          <div className="flex gap-2">
            <Input value={pwd} readOnly placeholder="—" />
            <Button type="button" variant="outline" size="sm" onClick={generate}><KeyRound className="mr-1 h-3.5 w-3.5" />Générer</Button>
          </div>
        </Field>
      </FormGrid>
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => {
          navigator.clipboard.writeText(`Identifiant: ${username || "—"}\nMot de passe: ${pwd || "—"}`);
          toast.success("Identifiants copiés");
        }}><Copy className="mr-1 h-3.5 w-3.5" />Copier les identifiants</Button>
      </div>
    </FormDialog>
  );
}

function ComptesPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filtrer la liste pour ne montrer que les subordonnés directs
  const allowed = user ? getCreatableRoles(user.role) : [];
  const filteredAccounts = user?.role === "super_admin"
    ? ACCOUNTS
    : ACCOUNTS.filter(a => allowed.includes(a.role));

  return (
    <div>
      <PageHeader
        title={t("nav.comptes")}
        description="Création hiérarchique : chaque chef ne crée et gère que ses subordonnés directs."
        actions={<NewAccountDialog />}
      />
      <DataTable
        data={filteredAccounts}
        columns={[
          { key: "username", header: t("auth.username"), render: (r: Account) => <span className="font-mono text-xs">{r.username}</span> },
          { key: "fullName", header: "Nom complet" },
          { key: "role", header: t("auth.role"), render: (r: Account) => ROLE_LABELS[r.role]?.[lang] ?? r.role },
          { key: "matricule", header: "Matricule", render: (r: Account) => <span className="font-mono text-xs">{r.matricule}</span> },
          { key: "phone", header: "Téléphone" },
          { key: "bureau", header: "Bureau", render: (r: Account) => r.bureau ?? "—" },
          { key: "status", header: t("common.status"), render: (r: Account) => (
            <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
          ) },
          { key: "actions", header: "", render: (r: Account) => (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${r.username}:pwd`); toast.success(t("common.copied")); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate({ to: "/app/comptes/$compteId", params: { compteId: r.id } }); }}>
                {t("common.details")}
              </Button>
            </div>
          ) },
        ]}
        onRowClick={(account) =>
          navigate({ to: "/app/comptes/$compteId", params: { compteId: account.id } })
        }
      />
    </div>
  );
}
