import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index?: number) => ReactNode;
  accessor?: (row: T) => string | number;
  className?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  pageSize?: number;
  empty?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  pageSize = 10,
  empty,
  onRowClick,
  toolbar,
}: Props<T>) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const needle = q.toLowerCase();
    return data.filter((row) =>
      columns.some((c) => {
        const val = c.accessor ? c.accessor(row) : (row as Record<string, unknown>)[c.key];
        return String(val ?? "")
          .toLowerCase()
          .includes(needle);
      }),
    );
  }, [q, data, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="rounded-lg border border-border bg-card">
      {(searchable || toolbar) && (
        <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={t("common.search")}
                className="pl-8"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns?.map((c) => (
                <th key={c.key} className={`px-4 py-2.5 font-medium ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={columns?.length ?? 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {empty ?? t("common.empty")}
                </td>
              </tr>
            )}
            {slice.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-border transition-colors hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns?.map((c) => (
                  <td key={c.key} className={`px-4 py-2.5 ${c.className ?? ""}`}>
                    {c.render
                      ? c.render(row, (current - 1) * pageSize + rowIndex)
                      : ((row as Record<string, ReactNode>)[c.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border p-3 text-xs text-muted-foreground">
        <span>
          {filtered.length} · page {current}/{totalPages}
        </span>
        <div className="flex gap-1">
          <button
            className="rounded border border-border px-2 py-1 disabled:opacity-50"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            ‹
          </button>
          <button
            className="rounded border border-border px-2 py-1 disabled:opacity-50"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
