import { cn } from "@/lib/utils";
import type { DossierStatus } from "@/lib/mock";
import { useI18n } from "@/lib/i18n";

const styles: Record<DossierStatus, string> = {
  brouillon: "bg-muted text-muted-foreground border-border",
  attente_paiement: "bg-warning/15 text-warning-foreground border-warning/40",
  paye: "bg-info/15 text-info-foreground border-info/40",
  en_cours: "bg-accent/15 text-accent-foreground border-accent/40",
  verifie: "bg-success/15 text-success-foreground border-success/40",
  apure: "bg-success/25 text-success-foreground border-success/60",
  rejete: "bg-destructive/15 text-destructive-foreground border-destructive/40",
};

export function StatusBadge({ status }: { status: DossierStatus }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {t(`status.${status}`)}
    </span>
  );
}
