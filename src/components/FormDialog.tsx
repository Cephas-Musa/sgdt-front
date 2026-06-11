import { useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function FormDialog({
  trigger,
  title,
  children,
  onSubmit,
  submitLabel = "Enregistrer",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  hideFooter = false,
}: {
  trigger?: ReactNode;
  title: string;
  children: ReactNode;
  onSubmit?: (data: Record<string, string>) => void | false;
  submitLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideFooter?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    controlledOnOpenChange?.(newOpen);
  };

  const collectAndSubmit = () => {
    if (!contentRef.current) return;
    const inputs = contentRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]");
    const data: Record<string, string> = {};
    inputs.forEach((el) => {
      if (el.name) data[el.name] = el.value;
    });
    const result = onSubmit?.(data);
    if (result !== false) handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={contentRef} className="space-y-3 py-2">{children}</div>
        {!hideFooter && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={collectAndSubmit}>
              {submitLabel}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const cls =
    cols === 1
      ? "grid gap-3"
      : cols === 3
        ? "grid gap-3 sm:grid-cols-3"
        : "grid gap-3 sm:grid-cols-2";
  return <div className={cls}>{children}</div>;
}
