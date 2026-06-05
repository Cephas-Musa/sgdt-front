import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { getCreatableRoles } from "@/lib/hierarchy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy, Plus, CheckCheck, UserCheck, Loader2, AlertCircle, X
} from "lucide-react";
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
import { useState, useRef, useCallback, useEffect } from "react";
import { useApi, apiGetUsers, apiGetBureauxDouaniers, apiCreateUser, apiUpdateUser, apiUpdateUserStatus, apiDeleteUser } from "@/lib/api";

export const Route = createFileRoute("/app/comptes")({
  component: ComptesPage,
});

/* ─── Modal identifiants copiables ────────────────────────────────── */
interface CredentialsModalProps {
  credentials: { phone_number: string; password: string; full_name: string } | null;
  onClose: () => void;
}

function CredentialsModal({ credentials, onClose }: CredentialsModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  if (!credentials) return null;

  const copy = (text: string, which: "phone" | "pwd") => {
    navigator.clipboard.writeText(text).then(() => {
      if (which === "phone") {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      } else {
        setCopiedPwd(true);
        setTimeout(() => setCopiedPwd(false), 2000);
      }
      toast.success("Copié dans le presse-papier !");
    });
  };

  const copyAll = () => {
    const text = `numero:${credentials.phone_number}\nmot de passe:${credentials.password}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Identifiants complets copiés !");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-accent/30 bg-card shadow-2xl shadow-accent/10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-gradient-to-r from-accent/10 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
              <UserCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">Compte créé avec succès</h2>
              <p className="text-xs text-muted-foreground">{credentials.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 mx-6 mt-5 rounded-xl border border-amber-200/60 bg-amber-50/80 dark:border-amber-800/40 dark:bg-amber-950/40 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <strong>Attention !</strong> Ces identifiants ne s'affichent qu'une seule fois. Copiez-les maintenant et transmettez-les à l'utilisateur.
          </p>
        </div>

        {/* Credentials */}
        <div className="px-6 py-5 space-y-4">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Numéro de téléphone
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5 font-mono text-sm font-semibold">
                {credentials.phone_number}
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`h-10 w-10 shrink-0 transition-colors ${
                  copiedPhone ? "border-success/50 bg-success/10 text-success" : ""
                }`}
                onClick={() => copy(credentials.phone_number, "phone")}
              >
                {copiedPhone ? (
                  <CheckCheck className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Mot de passe temporaire
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5 font-mono text-sm font-semibold tracking-wider">
                {credentials.password}
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`h-10 w-10 shrink-0 transition-colors ${
                  copiedPwd ? "border-success/50 bg-success/10 text-success" : ""
                }`}
                onClick={() => copy(credentials.password, "pwd")}
              >
                {copiedPwd ? (
                  <CheckCheck className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border px-6 py-4 bg-muted/20">
          <Button
            className="flex-1 gap-2 bg-accent hover:bg-accent/90 font-bold text-xs uppercase tracking-widest"
            onClick={copyAll}
          >
            <Copy className="h-4 w-4" />
            Tout copier
          </Button>
          <Button variant="outline" className="flex-1 text-xs font-bold uppercase" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Formulaire de création de compte ────────────────────────────── */
interface NewAccountDialogProps {
  onCreated: () => void;
  onShowCredentials: (creds: { phone_number: string; password: string; full_name: string }) => void;
}

// Mémoriser les derniers choix province/bureau du super_admin entre créations
let _lastSuperProvince = "";
let _lastSuperBureau = "";

function NewAccountDialog({ onCreated, onShowCredentials }: NewAccountDialogProps) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const isChefRepr = user?.role === "chef_bureau_repr";
  const { data: rawBureaux } = useApi(apiGetBureauxDouaniers);
  type Bureau = { id: number; code: string; denomination: string; province?: string };
  const bureauxDouaniers = (rawBureaux as Bureau[] ?? []);

  const allowed = user ? (isChefRepr ? ["operateur_saisie" as const] : getCreatableRoles(user.role)) : [];

  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [postnom, setPostnom] = useState("");
  const [matricule, setMatricule] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [selectedBureau, setSelectedBureau] = useState(_lastSuperBureau || "");
  const [selectedProvince, setSelectedProvince] = useState(_lastSuperProvince || "");
  const [phoneNum, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Générer le mot de passe automatiquement à l'ouverture
  useEffect(() => {
    if (open) {
      setPassword("SGDT@" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(1000 + Math.random() * 9000));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (user?.role === "super_admin") {
        setSelectedBureau(_lastSuperBureau);
        setSelectedProvince(_lastSuperProvince);
      } else {
        setSelectedProvince(user?.province || "");
        setSelectedBureau(user?.bureau || "");
      }
    }
  }, [open]);

  const copyCreds = () => {
    if (!phoneNum) return toast.error("Le numéro n'est pas rempli !");
    const fullPhone = `+243${phoneNum.replace(/\D/g, "")}`;
    const text = `numero:${fullPhone}\nmot de passe:${password}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Identifiants copiés !");
    });
  };

  const provinces = [...new Set(bureauxDouaniers.map(b => b.province).filter(Boolean))];

  const resetForm = () => {
    setNom(""); setPostnom(""); setMatricule("");
    setSelectedRole(""); setPhoneNum("");
  };

  const handleSubmit = useCallback(async () => {
    if (!nom.trim() || !selectedRole || !phoneNum.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires (nom, rôle, numéro).");
      return;
    }
    if (phoneNum.replace(/\D/g, "").length < 9) {
      toast.error("Le numéro de téléphone doit contenir 9 chiffres après +243.");
      return;
    }

    const fullPhone = `+243${phoneNum.replace(/\D/g, "")}`;
    const fullName = `${nom.trim()}${postnom.trim() ? " " + postnom.trim() : ""}`;

    setSubmitting(true);
    try {
      // Mémoriser le dernier choix pour le super_admin
      if (user?.role === "super_admin") {
        _lastSuperProvince = selectedProvince;
        _lastSuperBureau = selectedBureau;
      }

      const res = await apiCreateUser({
        phone_number: fullPhone,
        full_name: fullName,
        role: selectedRole as Role,
        bureau: selectedBureau || null,
        province: selectedProvince || null,
        matricule: matricule.trim() || undefined,
        password: password,
      }) as { credentials?: { phone_number: string; password: string } };

      // Fermer le dialog d'abord
      setOpen(false);
      resetForm();
      // Réinitialiser les sélecteurs pour la prochaine ouverture
      setSelectedBureau("");
      setSelectedProvince("");

      // Puis afficher le modal credentials
      if (res?.credentials) {
        onShowCredentials({
          phone_number: res.credentials.phone_number,
          password: res.credentials.password,
          full_name: fullName,
        });
      }

      toast.success(`✅ Compte de ${fullName} créé avec succès !`);
      onCreated(); // Rafraîchir la liste
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la création du compte.");
    } finally {
      setSubmitting(false);
    }
  }, [nom, postnom, matricule, selectedRole, selectedBureau, selectedProvince, phoneNum, user, onCreated, onShowCredentials]);

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
      onSubmit={() => { handleSubmit(); return false; }}
      open={open}
      onOpenChange={setOpen}
    >
      <FormGrid>
        <Field label="Prénom / Nom" required>
          <Input
            className="h-10"
            placeholder="Ex: Jean"
            value={nom}
            onChange={e => setNom(e.target.value)}
          />
        </Field>
        <Field label="Post-nom">
          <Input
            className="h-10"
            placeholder="Ex: Kabila"
            value={postnom}
            onChange={e => setPostnom(e.target.value)}
          />
        </Field>
        <Field label="Numéro matricule">
          <Input
            className="h-10 font-mono"
            placeholder="Ex: MAT-001"
            value={matricule}
            onChange={e => setMatricule(e.target.value)}
          />
        </Field>

        {/* Numéro de téléphone avec préfixe +243 fixe */}
        <Field label="Numéro de téléphone" required>
          <div className="flex h-10 overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-1 focus-within:ring-ring">
            <span className="flex items-center border-r border-input bg-muted/50 px-3 font-mono text-sm font-semibold text-muted-foreground select-none">
              +243
            </span>
            <input
              type="tel"
              maxLength={9}
              placeholder="9XXXXXXXX"
              value={phoneNum}
              onChange={e => setPhoneNum(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="flex-1 bg-transparent px-3 text-sm font-mono outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </Field>

        {!isChefRepr && (
          <Field label="Province">
            {user?.role === "super_admin" ? (
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner une province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p as string} value={p as string}>{p as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={user?.province || ""} readOnly className="h-10 bg-muted/50" />
            )}
          </Field>
        )}

        {!isChefRepr && (
          <Field label="Bureau douanier">
            {user?.role === "super_admin" ? (
              <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Sélectionner un bureau" />
                </SelectTrigger>
                <SelectContent>
                  {bureauxDouaniers
                    .filter(b => !selectedProvince || b.province === selectedProvince)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.denomination}>
                        {b.code} · {b.denomination}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={user?.bureau || ""} readOnly className="h-10 bg-muted/50" />
            )}
          </Field>
        )}

        <Field label="Poste / rôle" required>
          <Select
            value={selectedRole}
            onValueChange={(val) => setSelectedRole(val as Role)}
            defaultValue={isChefRepr ? "operateur_saisie" : undefined}
          >
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
        <Field label="Mot de passe généré" required>
          <div className="flex gap-2">
            <Input className="h-10 font-mono flex-1" value={password} readOnly />
            <Button type="button" variant="outline" className="h-10 px-3" onClick={copyCreds}>
              <Copy className="h-4 w-4 mr-2" /> Copier
            </Button>
          </div>
        </Field>
      </FormGrid>

      <Button
        className="w-full h-12 mt-6 font-black uppercase tracking-widest text-xs gap-2"
        onClick={handleSubmit}
        disabled={submitting}
        type="button"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Création en cours…</>
        ) : (
          <><UserCheck className="h-4 w-4" /> Créer et activer le compte</>
        )}
      </Button>
    </FormDialog>
  );
}

/* ─── Formulaire de modification de compte ──────────────────────────── */
interface EditAccountDialogProps {
  account: any;
  onUpdated: () => void;
}

function EditAccountDialog({ account, onUpdated }: EditAccountDialogProps) {
  const { user } = useAuth();
  const { lang } = useI18n();
  const isChefRepr = user?.role === "chef_bureau_repr";
  const { data: rawBureaux } = useApi(apiGetBureauxDouaniers);
  type Bureau = { id: number; code: string; denomination: string; province?: string };
  const bureauxDouaniers = (rawBureaux as Bureau[] ?? []);

  const allowed = user ? (isChefRepr ? ["operateur_saisie" as const] : getCreatableRoles(user.role)) : [];

  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState(account.full_name || "");
  const [matricule, setMatricule] = useState(account.matricule || "");
  const [selectedRole, setSelectedRole] = useState<Role | "">(account.role as Role || "");
  const [selectedBureau, setSelectedBureau] = useState(account.bureau || "");
  const [selectedProvince, setSelectedProvince] = useState(account.province || "");
  const [submitting, setSubmitting] = useState(false);

  const provinces = [...new Set(bureauxDouaniers.map(b => b.province).filter(Boolean))];

  const handleSubmit = useCallback(async () => {
    if (!nom.trim() || !selectedRole) {
      toast.error("Veuillez remplir les champs obligatoires (nom, rôle).");
      return;
    }

    setSubmitting(true);
    try {
      await apiUpdateUser(account.id, {
        full_name: nom.trim(),
        role: selectedRole as Role,
        bureau: selectedBureau || null,
        province: selectedProvince || null,
        matricule: matricule.trim() || undefined,
      });

      setOpen(false);
      toast.success(`✅ Compte de ${nom.trim()} modifié avec succès !`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la modification.");
    } finally {
      setSubmitting(false);
    }
  }, [nom, matricule, selectedRole, selectedBureau, selectedProvince, account.id, user, onUpdated]);

  return (
    <FormDialog
      trigger={
        <Button size="sm" variant="ghost" className="text-accent" title="Modifier">
          Modifier
        </Button>
      }
      title="Modifier le compte"
      onSubmit={() => { handleSubmit(); return false; }}
      open={open}
      onOpenChange={setOpen}
    >
      <FormGrid>
        <Field label="Nom complet" required>
          <Input className="h-10" value={nom} onChange={e => setNom(e.target.value)} />
        </Field>
        <Field label="Numéro matricule">
          <Input className="h-10 font-mono" value={matricule} onChange={e => setMatricule(e.target.value)} />
        </Field>

        {!isChefRepr && (
          <Field label="Province">
            {user?.role === "super_admin" ? (
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => <SelectItem key={p as string} value={p as string}>{p as string}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : <Input value={user?.province || ""} readOnly className="h-10 bg-muted/50" />}
          </Field>
        )}

        {!isChefRepr && (
          <Field label="Bureau douanier">
            {user?.role === "super_admin" ? (
              <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {bureauxDouaniers.filter(b => !selectedProvince || b.province === selectedProvince).map((b) => (
                    <SelectItem key={b.id} value={b.denomination}>{b.code} · {b.denomination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : <Input value={user?.bureau || ""} readOnly className="h-10 bg-muted/50" />}
          </Field>
        )}

        <Field label="Poste / rôle" required>
          <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as Role)}>
            <SelectTrigger className="h-10"><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
            <SelectContent>
              {allowed.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]?.[lang] ?? r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </FormGrid>
      <Button className="w-full h-12 mt-6 font-black uppercase tracking-widest text-xs" onClick={handleSubmit} disabled={submitting} type="button">
        {submitting ? "Modification en cours..." : "Enregistrer les modifications"}
      </Button>
    </FormDialog>
  );
}

/* ─── Page principale ─────────────────────────────────────────────── */
function ComptesPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const isChefRepr = user?.role === "chef_bureau_repr";

  const { data: rawUsers, loading: usersLoading, reload } = useApi(apiGetUsers);
  type Account = {
    id: number;
    phone_number?: string;
    full_name: string;
    role: string;
    matricule?: string;
    bureau?: string;
    province?: string;
    status?: string;
  };
  const accounts = (rawUsers as Account[] ?? []);

  const allowed = user ? getCreatableRoles(user.role) : [];
  const filteredAccounts = user?.role === "super_admin"
    ? accounts
    : (isChefRepr
        ? accounts.filter(a => a.role === "operateur_saisie")
        : accounts.filter(a => allowed.includes(a.role))
      );

  const [credentials, setCredentials] = useState<{
    phone_number: string; password: string; full_name: string
  } | null>(null);

  const handleCreated = useCallback(() => {
    reload?.();
  }, [reload]);

  const copyPhone = useCallback((phone: string) => {
    navigator.clipboard.writeText(phone).then(() => toast.success("Numéro copié !"));
  }, []);

  const handleStatusToggle = async (account: Account) => {
    const newStatus = account.status === "actif" ? "bloque" : "actif";
    try {
      await apiUpdateUserStatus(account.id, newStatus);
      toast.success(`Le statut de ${account.full_name} a été mis à jour.`);
      reload?.();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (account: Account) => {
    if (!confirm(`Voulez-vous vraiment supprimer le compte de ${account.full_name} ?`)) return;
    try {
      await apiDeleteUser(account.id);
      toast.success(`Le compte de ${account.full_name} a été supprimé.`);
      reload?.();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression.");
    }
  };

  const actionsColumn = {
    key: "actions",
    header: "Actions",
    render: (r: Account) => (
      <div className="flex items-center justify-end gap-1">
        <EditAccountDialog account={r} onUpdated={() => reload?.()} />
        <Button size="sm" variant="outline" onClick={() => handleStatusToggle(r)}>
          {(r.status ?? "actif") === "actif" ? "Bloquer" : "Activer"}
        </Button>
        {user?.role === "super_admin" && (
          <Button size="sm" variant="destructive" onClick={() => handleDelete(r)}>
            Supprimer
          </Button>
        )}
      </div>
    )
  };

  const columns = isChefRepr ? [
    {
      key: "index",
      header: "N°",
      render: (_: unknown, i: number) => (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
          {i + 1}
        </span>
      )
    },
    {
      key: "full_name",
      header: "Nom et Post-nom",
      render: (r: Account) => <span className="font-bold">{r.full_name}</span>
    },
    {
      key: "matricule",
      header: "Matricule",
      render: (r: Account) => (
        <span className="font-mono text-xs text-accent">{r.matricule ?? "—"}</span>
      )
    },
    {
      key: "role",
      header: "Poste",
      render: (r: Account) => ROLE_LABELS[r.role]?.[lang] || r.role
    },
    {
      key: "status",
      header: "Statut",
      render: (r: Account) => (
        <Badge className={
          (r.status ?? "actif") === "actif"
            ? "bg-success/10 text-success border-success/20"
            : "bg-destructive/10 text-destructive border-destructive/20"
        }>
          {(r.status ?? "actif") === "actif" ? "Actif" : "Bloqué"}
        </Badge>
      )
    },
    actionsColumn
  ] : [
    {
      key: "phone_number",
      header: "Numéro",
      render: (r: Account) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{r.phone_number ?? "—"}</span>
          {r.phone_number && (
            <button
              onClick={(e) => { e.stopPropagation(); copyPhone(r.phone_number!); }}
              className="rounded p-0.5 hover:bg-accent/10 text-muted-foreground hover:text-accent transition-colors"
              title="Copier le numéro"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
      )
    },
    {
      key: "full_name",
      header: "Nom complet",
      render: (r: Account) => <span className="font-medium">{r.full_name}</span>
    },
    {
      key: "role",
      header: "Rôle",
      render: (r: Account) => (
        <Badge variant="outline" className="text-xs font-semibold">
          {ROLE_LABELS[r.role]?.[lang] ?? r.role}
        </Badge>
      )
    },
    {
      key: "matricule",
      header: "Matricule",
      render: (r: Account) => (
        <span className="font-mono text-xs text-muted-foreground">{r.matricule ?? "—"}</span>
      )
    },
    {
      key: "bureau",
      header: "Bureau",
      render: (r: Account) => (
        <span className="text-xs">{r.bureau ?? "—"}</span>
      )
    },
    {
      key: "status",
      header: "Statut",
      render: (r: Account) => (
        <Badge variant={(r.status ?? "actif") === "actif" ? "outline" : "secondary"}>
          {r.status ?? "Actif"}
        </Badge>
      )
    },
    actionsColumn
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      <PageHeader
        title={isChefRepr ? "Gestion des Opérateurs" : "Gestion des Comptes"}
        description={
          isChefRepr
            ? "Administration des accès pour les opérateurs de saisie du bureau."
            : "Création et gestion hiérarchique des comptes utilisateurs."
        }
        actions={
          <NewAccountDialog
            onCreated={handleCreated}
            onShowCredentials={setCredentials}
          />
        }
      />

      {/* Compteur */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm shadow-sm">
          <span className="text-muted-foreground">Total comptes :</span>
          <span className="font-bold text-accent">{filteredAccounts.length}</span>
        </div>
        {usersLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-xl shadow-accent/5">
        <DataTable
          data={filteredAccounts}
          columns={columns}
          emptyMessage="Aucun compte créé. Utilisez le bouton « Nouveau compte » pour commencer."
        />
      </div>

      {/* Modal credentials copiables */}
      <CredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </div>
  );
}
