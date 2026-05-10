import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Construction } from "lucide-react";

export function StubPage({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      {children ?? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Construction className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-medium">Module en construction</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Cette page fait partie du squelette complet. Les écrans détaillés seront enrichis dans les prochaines itérations.
          </p>
        </div>
      )}
    </div>
  );
}
