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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const isChefRepr = user?.role === "chef_bureau_repr";
  
  // Hiérarchie : Chef Repr ne peut créer que des Opérateurs de saisie
  const allowed = user ? (isChefRepr ? ["operateur_saisie" as const] : getCreatableRoles(user.role)) : [];
  
  const [pwd, setPwd] = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "">("");

  const generate = () => {
    const p = Math.random().toString(36).slice(2, 10) + "!";
    setPwd(p);
  };

  if (allowed.length === 0) return null;

  return (
    <FormDialog
      trigger={
        <Button className="bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau compte
        </Button>
      }
      title={isChefRepr ? "Nouvel Opérateur de Saisie" : "Création de compte"}
      onSubmit={() => toast.success("Compte créé avec succès")}
    >
      <FormGrid>
        <Field label="Nom" required><Input className="h-10" /></Field>
        <Field label="Post-nom" required><Input className="h-10" /></Field>
        <Field label="Numéro matricule" required><Input className="h-10 font-mono" /></Field>
        
        {!isChefRepr && (
          <Field label="Bureau douanier">
            {user?.role === "super_admin" ? (
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {BUREAUX_DOUANIERS.map((b) => (
                    <SelectItem key={b.id} value={b.code}>{b.code} · {b.denomination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={user?.bureau || "KASINDI"} readOnly className="h-10 bg-muted/50" />
            )}
          </Field>
        )}

        <Field label="Poste / rôle" required>
          <Select onValueChange={(val) => setSelectedRole(val as Role)} defaultValue={isChefRepr ? "operateur_saisie" : undefined}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {allowed.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]?.[lang] ?? r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Identifiant"><Input className="h-10" value={username} onChange={e => setUsername(e.target.value)} /></Field>
        <Field label="Mot de passe">
          <div className="flex gap-2">
            <Input value={pwd} readOnly className="h-10 bg-muted/30" />
            <Button type="button" variant="outline" className="h-10" onClick={generate}><KeyRound className="h-4 w-4" /></Button>
          </div>
        </Field>
      </FormGrid>
      <Button className="w-full h-12 mt-6 font-black uppercase tracking-widest text-xs" onClick={() => toast.success("Compte Activé")}>Activer le compte</Button>
    </FormDialog>
  );
}

function ComptesPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const isChefRepr = user?.role === "chef_bureau_repr";

  const allowed = user ? getCreatableRoles(user.role) : [];
  const filteredAccounts = user?.role === "super_admin" 
    ? ACCOUNTS 
    : (isChefRepr 
        ? ACCOUNTS.filter(a => a.role === "operateur_saisie") 
        : ACCOUNTS.filter(a => allowed.includes(a.role))
      );

  const columns = isChefRepr ? [
    { key: "index", header: "N°", render: (_: any, i: number) => i + 1 },
    { key: "fullName", header: "Nom et Post-nom", render: (r: Account) => <span className="font-bold">{r.fullName}</span> },
    { key: "matricule", header: "Matricule", render: (r: Account) => <span className="font-mono text-accent">{r.matricule}</span> },
    { key: "role", header: "Poste", render: (r: Account) => ROLE_LABELS[r.role]?.[lang] || r.role },
    { key: "status", header: "Statut", render: (r: Account) => (
      <Badge className={r.status === 'actif' ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
        {r.status === 'actif' ? 'Actif' : 'Bloqué'}
      </Badge>
    )},
    { key: "actions", header: "Action possible", render: (r: Account) => (
      <div className="flex gap-2">
        {r.status === 'actif' ? (
          <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => toast.success("Compte Bloqué")}>Bloquer</Button>
        ) : (
          <Button size="sm" variant="outline" className="h-7 text-[9px] font-black uppercase text-success border-success/30 hover:bg-success/10" onClick={() => toast.success("Compte Débloqué")}>Débloquer</Button>
        )}
      </div>
    )}
  ] : [
    { key: "username", header: "Identifiant", render: (r: Account) => <span className="font-mono text-xs">{r.username}</span> },
    { key: "fullName", header: "Nom complet" },
    { key: "role", header: "Rôle", render: (r: Account) => ROLE_LABELS[r.role]?.[lang] ?? r.role },
    { key: "matricule", header: "Matricule", render: (r: Account) => <span className="font-mono text-xs">{r.matricule}</span> },
    { key: "status", header: "Statut", render: (r: Account) => <Badge variant={r.status === 'actif' ? 'outline' : 'secondary'}>{r.status}</Badge> },
    { key: "actions", header: "", render: (r: Account) => <Button size="sm" variant="ghost"><Copy className="h-3.5 w-3.5" /></Button> }
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title={isChefRepr ? "Gestion des Opérateurs" : "Gestion des Comptes"}
        description={isChefRepr ? "Administration des accès pour les opérateurs de saisie du bureau." : "Gestion hiérarchique des comptes subordonnés."}
        actions={<NewAccountDialog />}
      />
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xl shadow-accent/5">
        <DataTable data={filteredAccounts} columns={columns} />
      </div>
    </div>
  );
}
