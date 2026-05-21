import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, login } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("directeur_provincial");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app" });
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    login(username, role);
    navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">{t("app.name")}</div>
            <div className="text-xs text-sidebar-foreground/60">{t("app.tagline")}</div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold leading-tight">
            Plateforme intégrée
            <br />
            de gestion douanière terrain.
          </h2>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Dossiers, barrières, entrepôts, manifest, vérification, apurement, communication &
            alertes — un seul outil pour tous les rôles.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">© 2026 — Système douanier</div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t("auth.login")}</h1>
            <p className="text-sm text-muted-foreground">{t("auth.demoHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("auth.username")}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="agent.terrain"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("auth.role")}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r][lang]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            {t("auth.signin")}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button type="button" className="hover:text-foreground">
              {t("auth.forgot")}
            </button>
            <button
              type="button"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="hover:text-foreground"
            >
              {lang === "fr" ? "English" : "Français"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
