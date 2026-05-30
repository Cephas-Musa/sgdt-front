import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { apiLogin, apiVerifyOtp, type LoginResponse } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Step = "credentials" | "otp";

const PREFIXES = ["+243", "+256"] as const;
type Prefix = (typeof PREFIXES)[number];

function LoginPage() {
  const { user, finalizeLogin } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<Step>("credentials");

  // Step 1 — credentials
  const prefix = "+243";
  const [localNumber, setLocalNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Step 2 — OTP
  const [otpCode, setOtpCode] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate({ to: "/app" });
  }, [user, navigate]);

  const fullPhoneNumber = `${prefix}${localNumber}`;

  // ─── STEP 1: login ──────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!localNumber || localNumber.length < 6) {
      setError("Veuillez saisir un numéro de téléphone valide.");
      return;
    }

    setLoading(true);
    try {
      const res: LoginResponse = await apiLogin(fullPhoneNumber, password);

      if (res.status === "success" && res.access_token) {
        // Connexion directe (utilisateur déjà vérifié)
        await finalizeLogin(res.access_token);
        navigate({ to: "/app" });
      } else if (res.status === "otp_required") {
        // Première connexion — étape OTP
        setPendingPhone(res.phone_number ?? fullPhoneNumber);
        setStep("otp");
        toast.info("Code OTP envoyé par SMS sur votre numéro.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Identifiants incorrects.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2: verify OTP ─────────────────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Le code doit comporter 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiVerifyOtp(pendingPhone, otpCode);
      if (res.access_token) {
        await finalizeLogin(res.access_token);
        toast.success("Numéro vérifié. Bienvenue !");
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Code OTP invalide.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left panel ───────────────────────────────────────────── */}
      <div className="hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">{t("app.name")}</div>
            <div className="text-xs text-sidebar-foreground/60">
              {t("app.tagline")}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold leading-tight">
            Plateforme intégrée
            <br />
            de gestion douanière terrain.
          </h2>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Dossiers, barrières, entrepôts, manifest, vérification, apurement,
            communication & alertes — un seul outil pour tous les rôles.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/50">
          © 2026 — Système douanier
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        {step === "credentials" ? (
          /* ── Form étape 1 : Numéro + Mot de passe ── */
          <form
            onSubmit={handleLoginSubmit}
            className="w-full max-w-sm space-y-5"
          >
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {t("auth.login")}
              </h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous avec votre numéro de téléphone et mot de passe.
              </p>
            </div>

            {/* Numéro de téléphone avec préfixe prédéfini */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center rounded-l-md border border-r-0 border-input bg-muted/50 px-3 font-mono text-sm font-semibold text-muted-foreground">
                  +243
                </div>

                <div className="relative flex-1">
                  <Phone className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    value={localNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.startsWith("243") && val.length > 9) {
                        val = val.substring(3);
                      }
                      setLocalNumber(val.slice(0, 9));
                    }}
                    placeholder="813478556"
                    className="pl-8 rounded-l-none"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Numéro complet :{" "}
                <span className="font-mono font-medium">
                  {fullPhoneNumber || prefix + "…"}
                </span>
              </p>
            </div>

            {/* Mot de passe */}
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
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                t("auth.signin")
              )}
            </Button>

            <div className="flex items-center justify-end text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                className="hover:text-foreground"
              >
                {lang === "fr" ? "English" : "Français"}
              </button>
            </div>
          </form>
        ) : (
          /* ── Form étape 2 : Code OTP ── */
          <form
            onSubmit={handleOtpSubmit}
            className="w-full max-w-sm space-y-5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Vérification OTP
              </h1>
              <p className="text-sm text-muted-foreground">
                Un code à 6 chiffres a été envoyé par SMS sur{" "}
                <span className="font-mono font-medium">{pendingPhone}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Code OTP (6 chiffres)</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="• • • • • •"
                className="text-center text-2xl font-mono tracking-[0.5em]"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification…
                </>
              ) : (
                "Valider le code"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setOtpCode("");
                setError("");
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              ← Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
