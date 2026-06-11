import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Shield,
  Warehouse,
  FileText,
  Search,
  Building2,
  Users,
  Settings,
  MessageSquare,
  Bell,
  FileCheck,
  ListChecks,
  MapPin,
  ParkingSquare,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { ROLE_NAV, type NavKey } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { apiGetAlerteUnreadCount } from "@/lib/api";

const ROUTES: Record<NavKey, { to: string; icon: any; labelKey: string }> = {
  dashboard: { to: "/app", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  dossiers: { to: "/app/dossiers", icon: FolderKanban, labelKey: "nav.dossiers" },
  entrepots: { to: "/app/entrepots", icon: Warehouse, labelKey: "nav.entrepots" },
  recherche: { to: "/app/recherche", icon: Search, labelKey: "nav.recherche" },
  representation: { to: "/app/representation", icon: Building2, labelKey: "nav.representation" },
  secretariat: { to: "/app/secretariat", icon: Briefcase, labelKey: "nav.secretariat" },
  comptes: { to: "/app/comptes", icon: Users, labelKey: "nav.comptes" },
  configuration: { to: "/app/configuration", icon: Settings, labelKey: "nav.configuration" },
  chat: { to: "/app/chat", icon: MessageSquare, labelKey: "nav.chat" },
  alertes: { to: "/app/alertes", icon: Bell, labelKey: "nav.alertes" },
  colisage: { to: "/app/colisage", icon: ListChecks, labelKey: "nav.colisage" },
  appurement: { to: "/app/appurement", icon: FileCheck, labelKey: "nav.appurement" },
  localisation: { to: "/app/localisation", icon: MapPin, labelKey: "nav.localisation" },
  parking: { to: "/app/parking", icon: ParkingSquare, labelKey: "nav.parking" },
  profil: { to: "/app/profil", icon: UserCircle, labelKey: "nav.profil" },
};

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await apiGetAlerteUnreadCount();
      setUnreadCount(data.unread_count);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  if (!user) return null;
  const items = ROLE_NAV[user.role];

  const isActive = (to: string) => (to === "/app" ? pathname === "/app" : pathname.startsWith(to));

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{t("app.name")}</div>
            <div className="text-[10px] text-sidebar-foreground/60">{t("app.tagline")}</div>
          </div>
        </div>

        <nav className="flex h-[calc(100vh-3.5rem)] flex-col gap-0.5 overflow-y-auto p-2">
          {items?.map((key) => {
            const r = ROUTES[key];
            const Icon = r.icon;
            const active = isActive(r.to);
            return (
              <Link
                key={key}
                to={r.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(r.labelKey)}</span>
                {key === "alertes" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
