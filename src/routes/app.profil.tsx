import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { User, Shield, Phone, Mail, Key, Save, Camera, Trash2, Upload, Eye, EyeOff, Building2, Calendar, Award } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  const { user, logout, updateUser } = useAuth();
  const { lang } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "+243 00 000 0000");
  const [email, setEmail] = useState(user?.email ?? "agent@douane.cd");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);
  const [isUploading, setIsUploading] = useState(false);

  if (!user) return null;
  const roleLabel = ROLE_LABELS[user.role]?.[lang] ?? user.role;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("La taille maximale est de 5 Mo"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Veuillez sélectionner une image"); return; }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      updateUser({ avatar: result });
      setIsUploading(false);
      toast.success("Photo de profil mise à jour");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    updateUser({ avatar: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Photo de profil supprimée");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ fullName: nom, phone, email });
    toast.success("Profil mis à jour avec succès");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPwd) { toast.error("Veuillez saisir l'ancien mot de passe"); return; }
    if (newPwd.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }
    if (newPwd !== confirmPwd) { toast.error("Les mots de passe ne correspondent pas"); return; }
    toast.success("Mot de passe modifié avec succès");
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
  };

  const initials = user.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div>
      <PageHeader title="Mon profil" description="Gestion du profil, informations personnelles et paramètres de sécurité" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* === Profile Card === */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Banner gradient */}
            <div className="h-24 bg-gradient-to-br from-accent/80 via-accent to-accent/60 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYyaDR2MmgtNHptMC0zMFY0aDJ2MmgtMnpNNiAzNHYtNGgydjRINnptMTYtMzBWMGgydjRoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            <div className="px-6 pb-6 -mt-12 text-center">
              {/* Avatar with upload */}
              <div className="relative inline-block group">
                <div className="relative h-24 w-24 rounded-full border-4 border-card shadow-lg overflow-hidden bg-accent/15">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5 text-accent text-2xl font-bold">
                      {initials}
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              {/* Photo actions */}
              <div className="flex justify-center gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs h-7 px-2.5" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  <Upload className="h-3 w-3 mr-1" />{avatarPreview ? "Modifier" : "Ajouter"}
                </Button>
                {avatarPreview && (
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 text-destructive hover:text-destructive" onClick={handleRemoveAvatar}>
                    <Trash2 className="h-3 w-3 mr-1" />Supprimer
                  </Button>
                )}
              </div>

              <h2 className="text-lg font-semibold mt-3">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{roleLabel}</p>

              {/* Info chips */}
              <div className="mt-4 space-y-2">
                {user.matricule && (
                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Award className="h-3.5 w-3.5 text-accent" />
                    <span className="font-mono text-xs">{user.matricule}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-accent" /> {phone}
                </div>
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-accent" /> {email}
                </div>
                {user.bureau && (
                  <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-accent" /> {user.bureau}
                  </div>
                )}
              </div>

              <Button variant="destructive" className="mt-6 w-full" onClick={() => { logout(); toast.success("Déconnexion réussie"); }}>
                Se déconnecter
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" />Informations système</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Identifiant</span>
                <span className="font-mono text-xs">{user.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rôle</span>
                <span className="font-medium">{roleLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* === Forms === */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10"><User className="h-4 w-4 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Informations personnelles</h3>
                <p className="text-xs text-muted-foreground">Modifiez vos coordonnées et informations de contact</p>
              </div>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet</label>
                  <Input value={nom} onChange={e => setNom(e.target.value)} className="transition-shadow focus:shadow-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Identifiant</label>
                  <Input value={user.username} readOnly className="bg-muted/30 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1"><Phone className="h-3 w-3 text-accent" /> Téléphone</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className="transition-shadow focus:shadow-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1"><Mail className="h-3 w-3 text-accent" /> Email</label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} className="transition-shadow focus:shadow-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                  <Input value={roleLabel} readOnly className="bg-muted/30 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Bureau</label>
                  <Input value={user.bureau ?? "—"} readOnly className="bg-muted/30 cursor-not-allowed" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="shadow-sm hover:shadow-md transition-shadow">
                  <Save className="mr-1.5 h-4 w-4" />Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>

          {/* Password change */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10"><Key className="h-4 w-4 text-warning" /></div>
              <div>
                <h3 className="font-semibold">Sécurité du compte</h3>
                <p className="text-xs text-muted-foreground">Changez votre mot de passe régulièrement pour sécuriser votre compte</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ancien mot de passe</label>
                  <div className="relative">
                    <Input type={showOld ? "text" : "password"} value={oldPwd} onChange={e => setOldPwd(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowOld(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                      {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPwd && (
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${newPwd.length >= i * 3 ? (newPwd.length >= 10 ? "bg-success" : newPwd.length >= 6 ? "bg-warning" : "bg-destructive") : "bg-muted"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPwd && newPwd !== confirmPwd && (
                    <p className="text-xs text-destructive mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
                  <Key className="mr-1.5 h-4 w-4" />Changer le mot de passe
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
