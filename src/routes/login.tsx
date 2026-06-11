import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Phone, Loader2, ArrowLeft, Check } from "lucide-react";
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

/* ─────────────────────────────────────────────────────────────────────────────
   Composant OTP — design premium moderne
───────────────────────────────────────────────────────────────────────────── */
interface OtpScreenProps {
  phoneNumber: string;
  loading: boolean;
  error: string;
  onSubmit: (code: string) => Promise<void>;
  onBack: () => void;
}

function OtpScreen({ phoneNumber, loading, error, onSubmit, onBack }: OtpScreenProps) {
  const { t, lang } = useI18n();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  // Auto-submit quand les 6 cases sont remplies
  useEffect(() => {
    if (code.length === 6 && digits.every((d) => d !== "")) {
      onSubmit(code);
    }
  }, [digits]);

  // Focus sur la première case au montage
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Gestion du collage d'un code complet
    if (value.length > 1) {
      const cleaned = value.replace(/\D/g, "").slice(0, 6);
      const newDigits = Array(6).fill("");
      cleaned.split("").forEach((char, i) => { newDigits[i] = char; });
      setDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const char = value.replace(/\D/g, "");
    if (!char && value !== "") return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newDigits[i] = char; });
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    toast.info(t("otp.resendPlaceholder"));
  };

  const isFilled = digits.every((d) => d !== "");
  const showVerifyBtn = isFilled && !loading;

  return (
    <div className="otp-root">
      {/* En-tête */}
      <div className="otp-header">
        <button className="otp-back-btn" onClick={onBack} aria-label={t("common.back")}>
          <ArrowLeft className="otp-back-icon" />
        </button>
        <span className="otp-phone">{phoneNumber}</span>
        <span className="otp-header-spacer" />
      </div>

      <div className="otp-body">
        {/* Titre */}
        <h1 className="otp-title">{t("otp.title")}</h1>

        {/* Description */}
        <p className="otp-desc">{t("otp.desc1")}</p>
        <p className="otp-desc otp-desc-2">{t("otp.desc2")}</p>

        {/* Cases OTP */}
        <div className="otp-boxes" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className={`otp-box${digit ? " otp-box--filled" : ""}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`${t("otp.digitLabel")} ${i + 1}`}
            />
          ))}
        </div>

        {/* Erreur */}
        {error && <p className="otp-error">{error}</p>}

        {/* Bouton Verify */}
        <button
          className={`otp-btn${showVerifyBtn ? " otp-btn--visible" : ""}`}
          onClick={() => onSubmit(code)}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <span className="otp-loading">
              <Loader2 className="otp-spin" />
              {t("otp.verifying")}
            </span>
          ) : (
            <>
              <Check className="otp-btn-icon" />
              {t("otp.verify")}
            </>
          )}
        </button>

        {/* Renvoi */}
        <p className="otp-resend">
          {t("otp.noCode")}{" "}
          <button className="otp-resend-link" onClick={handleResend} type="button">
            {t("otp.resend")}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page principale Login
───────────────────────────────────────────────────────────────────────────── */
function LoginPage() {
  const { user, finalizeLogin } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("credentials");

  const prefix = "+243";
  const [localNumber, setLocalNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [pendingPhone, setPendingPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/app" });
  }, [user, navigate]);

  const fullPhoneNumber = `${prefix}${localNumber}`;

  // ─── STEP 1 : connexion ────────────────────────────────────────────────────
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
        await finalizeLogin(res.access_token);
        navigate({ to: "/app" });
      } else if (res.status === "otp_required") {
        setPendingPhone(res.phone_number ?? fullPhoneNumber);
        setStep("otp");
        toast.info("Code OTP envoyé par SMS sur votre numéro.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  // ─── STEP 2 : vérification OTP ────────────────────────────────────────────
  const handleOtpSubmit = async (code: string) => {
    setError("");
    if (code.length !== 6) {
      setError("Le code doit comporter 6 chiffres.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiVerifyOtp(pendingPhone, code);
      if (res.access_token) {
        await finalizeLogin(res.access_token);
        toast.success("Numéro vérifié. Bienvenue !");
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code OTP invalide.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Écran OTP : plein écran noir ─────────────────────────────────────────
  if (step === "otp") {
    return (
      <>
        <OtpScreen
          phoneNumber={pendingPhone || fullPhoneNumber}
          loading={loading}
          error={error}
          onSubmit={handleOtpSubmit}
          onBack={() => {
            setStep("credentials");
            setError("");
          }}
        />

        <style>{`
          .otp-root {
            min-height: 100vh;
            background: #000000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }

          /* ── En-tête ── */
          .otp-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.25rem 0.5rem;
          }
          .otp-back-btn {
            background: rgba(255,255,255,0.06);
            border: none;
            border-radius: 50%;
            width: 2.25rem;
            height: 2.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s, transform 0.15s;
            flex-shrink: 0;
            -webkit-tap-highlight-color: transparent;
          }
          .otp-back-btn:hover { background: rgba(255,255,255,0.12); }
          .otp-back-btn:active { transform: scale(0.92); }
          .otp-back-icon { width: 1.1rem; height: 1.1rem; color: #ffffff; }
          .otp-phone {
            font-size: 0.88rem;
            font-weight: 500;
            color: rgba(255,255,255,0.7);
            letter-spacing: 0.02em;
            text-align: center;
          }
          .otp-header-spacer { width: 2.25rem; }

          /* ── Corps ── */
          .otp-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 2rem 1.5rem 2rem;
            max-width: 420px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
          }

          /* ── Titre ── */
          .otp-title {
            font-size: clamp(1.75rem, 5.5vw, 2.5rem);
            font-weight: 700;
            color: #ffffff;
            line-height: 1.2;
            margin: 0 0 0.75rem 0;
            letter-spacing: -0.03em;
          }

          /* ── Description ── */
          .otp-desc {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.5);
            line-height: 1.55;
            margin: 0 0 0.5rem 0;
          }
          .otp-desc-2 { margin-bottom: 2.25rem; }

          /* ── Cases OTP ── */
          .otp-boxes {
            display: flex;
            gap: 0.65rem;
            justify-content: center;
            margin-bottom: 2rem;
          }
          .otp-box {
            width: calc((100% - 5 * 0.65rem) / 6);
            aspect-ratio: 1 / 1.15;
            background: rgba(255,255,255,0.04);
            border: 1.5px solid rgba(255,255,255,0.15);
            border-radius: 14px;
            color: #ffffff;
            font-size: 1.4rem;
            font-weight: 600;
            text-align: center;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.15s;
            caret-color: transparent;
            -webkit-appearance: none;
            appearance: none;
          }
          .otp-box:focus {
            border-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.07);
            transform: translateY(-1px);
          }
          .otp-box--filled {
            border-color: rgba(255,255,255,0.5);
            background: rgba(255,255,255,0.09);
          }

          /* ── Erreur ── */
          .otp-error {
            color: #ff4d4f;
            font-size: 0.82rem;
            margin: 0 0 1rem;
            padding: 0.5rem 0.8rem;
            background: rgba(255,77,79,0.08);
            border-radius: 10px;
            border: 1px solid rgba(255,77,79,0.2);
          }

          /* ── Bouton Verify ── */
          .otp-btn {
            width: 100%;
            padding: 0.9rem;
            background: #ffffff;
            color: #000000;
            border: none;
            border-radius: 14px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.25s, transform 0.2s, box-shadow 0.25s;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            opacity: 0.6;
            -webkit-tap-highlight-color: transparent;
          }
          .otp-btn--visible { opacity: 1; }
          .otp-btn:hover:not(:disabled) {
            opacity: 0.92;
            transform: translateY(-1px);
            box-shadow: 0 4px 20px rgba(255,255,255,0.1);
          }
          .otp-btn:active:not(:disabled) { transform: translateY(0); }
          .otp-btn:disabled { opacity: 0.25; cursor: not-allowed; }
          .otp-btn-icon {
            width: 1rem;
            height: 1rem;
          }
          .otp-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .otp-spin {
            width: 1rem;
            height: 1rem;
            animation: otp-rotate 0.8s linear infinite;
          }
          @keyframes otp-rotate { to { transform: rotate(360deg); } }

          /* ── Renvoi ── */
          .otp-resend {
            text-align: center;
            font-size: 0.85rem;
            color: rgba(255,255,255,0.4);
            margin: 0;
          }
          .otp-resend-link {
            background: none;
            border: none;
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
            font-size: inherit;
            text-decoration: underline;
            text-underline-offset: 3px;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
          }
          .otp-resend-link:hover { opacity: 0.7; }

          @media (min-width: 640px) {
            .otp-body { padding: 2.5rem 2.5rem 2rem; }
            .otp-boxes { gap: 0.85rem; }
          }
          @media (max-width: 360px) {
            .otp-boxes { gap: 0.4rem; }
            .otp-box { border-radius: 10px; }
          }
        `}</style>
      </>
    );
  }

  // ─── Écran Login : deux colonnes ──────────────────────────────────────────
  return (
    <div className="lp-root">

      {/* ══ GAUCHE — Identité visuelle SGDT ══ */}
      <div className="lp-visual-panel">

        <div className="lp-header-zone">
          <h2 className="lp-main-title">
            SYSTÈME DE GESTION DE DOUANE EN TERRAIN
          </h2>
          <span className="lp-sigle">SGDT</span>
        </div>

        <div className="lp-center-zone">
          <div className="lp-map-wrap">
            <img
              src="/rdc.png"
              alt="Carte de la République Démocratique du Congo"
              className="lp-map-img"
            />
          </div>
        </div>

        <div className="lp-bottom-zone">
          <p className="lp-slogan-1">
            Ensemble, luttons contre la fraude douanière
          </p>
          <div className="lp-divider-row">
            <span className="lp-divider-line" />
            <img
              src="/assets/Logo-dgda.png"
              alt="Logo DGDA"
              className="lp-dgda-logo"
            />
            <span className="lp-divider-line" />
          </div>
          <p className="lp-slogan-2">
            Construisons ensemble notre beau pays la RDC
          </p>
        </div>
      </div>

      {/* ══ DROITE — Formulaire de connexion ══ */}
      <div className="lp-form-panel">
        <form onSubmit={handleLoginSubmit} className="lp-form">
          <div className="lp-form-header">
            <h1>{t("auth.login")}</h1>
            <p>Connectez-vous avec votre numéro de téléphone et mot de passe.</p>
          </div>

          <div className="lp-field">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="lp-phone-row">
              <div className="lp-prefix">+243</div>
              <div className="lp-phone-input-wrap">
                <Phone className="lp-phone-icon" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={9}
                  value={localNumber}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("243") && val.length > 9) val = val.substring(3);
                    setLocalNumber(val.slice(0, 9));
                  }}
                  placeholder="813478556"
                  className="lp-phone-input"
                  required
                />
              </div>
            </div>
            
          </div>

          <div className="lp-field">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="lp-pwd-wrap">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="lp-pwd-input"
                noUppercase
                required
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="lp-eye">
                {showPwd ? <EyeOff className="lp-eye-icon" /> : <Eye className="lp-eye-icon" />}
              </button>
            </div>
          </div>

          {error && <p className="lp-error">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (<><Loader2 className="lp-spin" /> Connexion…</>) : t("auth.signin")}
          </Button>

          <div className="lp-lang">
            <button type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")}>
              {lang === "fr" ? "English" : "Français"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Styles scopés ── */}
      <style>{`
        .lp-root {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100vh;
          overflow: hidden;
          width: 100%;
        }

        /* GAUCHE – Visuel */
        .lp-visual-panel {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(160deg, #071628 0%, #0d2a4e 50%, #0f3460 100%);
          padding: 1.5rem 1.25rem 1.25rem;
          box-sizing: border-box;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .lp-header-zone {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding-bottom: 0.5rem;
        }
        .lp-main-title {
          font-size: clamp(1rem, 1.05vw, 0.85rem);
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffffff;
          text-align: center;
          line-height: 1.5;
          margin: 0;
        }
        .lp-sigle {
          font-size: clamp(1.3rem, 2.5vw, 2rem);
          font-weight: 900;
          letter-spacing: 0.35em;
          background: linear-gradient(130deg, #c8971e 0%, #f0cc5a 50%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }
        .lp-center-zone {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          overflow: hidden;
        }
        .lp-map-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .lp-map-img {
          height: clamp(220px, 58vh, 500px);
          width: auto;
          max-width: 92%;
          object-fit: contain;
          display: block;
        }
        .lp-bottom-zone {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.5rem;
        }
        .lp-slogan-1 {
          font-size: clamp(0.65rem, 1.05vw, 0.88rem);
          font-weight: 600;
          color: #d4af37;
          text-align: center;
          margin: 0;
          line-height: 1.4;
        }
        .lp-slogan-2 {
          font-size: clamp(0.6rem, 0.95vw, 0.8rem);
          font-weight: 400;
          color: rgba(255,255,255,0.62);
          text-align: center;
          margin: 0;
          line-height: 1.4;
        }
        .lp-divider-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          width: 100%;
        }
        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.28);
          display: block;
        }
        .lp-dgda-logo {
          width: clamp(44px, 5.5vw, 72px);
          height: auto;
          object-fit: contain;
          flex-shrink: 0;
          display: block;
        }

        /* DROITE – Formulaire */
        .lp-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          overflow: hidden;
          padding: 2rem;
          background: var(--background, #fff);
          box-sizing: border-box;
        }
        .lp-form {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .lp-form-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--foreground, #111);
        }
        .lp-form-header p {
          font-size: 0.85rem;
          color: var(--muted-foreground, #666);
        }
        .lp-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .lp-phone-row { display: flex; }
        .lp-prefix {
          display: flex; align-items: center; padding: 0 0.75rem;
          border: 1px solid var(--input, #d1d5db); border-right: none;
          border-radius: 0.375rem 0 0 0.375rem;
          background: var(--muted, #f3f4f6);
          font-family: monospace; font-size: 0.85rem; font-weight: 600;
          color: var(--muted-foreground, #6b7280); white-space: nowrap;
        }
        .lp-phone-input-wrap { position: relative; flex: 1; }
        .lp-phone-icon {
          position: absolute; left: 0.625rem; top: 50%;
          transform: translateY(-50%); width: 1rem; height: 1rem;
          color: var(--muted-foreground, #9ca3af); pointer-events: none;
        }
        .lp-phone-input { padding-left: 2rem !important; border-radius: 0 0.375rem 0.375rem 0 !important; }
        .lp-hint { font-size: 0.75rem; color: var(--muted-foreground, #9ca3af); }
        .lp-mono { font-family: monospace; font-weight: 600; }
        .lp-pwd-wrap { position: relative; }
        .lp-pwd-input { padding-right: 2.5rem !important; }
        .lp-eye {
          position: absolute; right: 0.5rem; top: 50%;
          transform: translateY(-50%); padding: 0.25rem;
          background: none; border: none; cursor: pointer;
          color: var(--muted-foreground, #9ca3af);
        }
        .lp-eye:hover { color: var(--foreground, #111); }
        .lp-eye-icon { width: 1rem; height: 1rem; }
        .lp-error {
          border-radius: 0.375rem;
          background: hsl(0 72% 51% / 0.1);
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          color: hsl(0 72% 51%);
        }
        .lp-spin {
          display: inline-block; width: 1rem; height: 1rem;
          margin-right: 0.5rem; animation: lp-spin 1s linear infinite;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-lang {
          display: flex; justify-content: flex-end;
          font-size: 0.75rem; color: var(--muted-foreground, #9ca3af);
        }
        .lp-lang button { background: none; border: none; cursor: pointer; color: inherit; }
        .lp-lang button:hover { color: var(--foreground, #111); }

        /* Responsive */
        @media (max-width: 767px) {
          .lp-root { grid-template-columns: 1fr; }
          .lp-visual-panel { display: none; }
        }
      `}</style>
    </div>
  );
}
