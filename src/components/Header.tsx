import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  MessageSquare,
  Menu,
  Sun,
  Moon,
  Globe,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { ROLE_LABELS } from "@/lib/roles";
import { ALERTS, CHATS } from "@/lib/mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const unreadAlerts = ALERTS.filter((a) => a.level !== "info").length;
  const unreadChats = CHATS.reduce((s, c) => s + c.unread, 0);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
      <button
        onClick={onMenu}
        className="rounded-md p-2 hover:bg-muted lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => setLang(lang === "fr" ? "en" : "fr")}
        className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-muted sm:flex"
      >
        <Globe className="h-4 w-4" />
        {lang.toUpperCase()}
      </button>

      <button onClick={toggle} className="rounded-md p-2 hover:bg-muted" aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <Link
        to="/app/chat"
        className="relative rounded-md p-2 hover:bg-muted"
        aria-label={t("nav.chat")}
      >
        <MessageSquare className="h-4 w-4" />
        {unreadChats > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {unreadChats}
          </span>
        )}
      </Link>

      <Link
        to="/app/alertes"
        className="relative rounded-md p-2 hover:bg-muted"
        aria-label={t("nav.alertes")}
      >
        <Bell className="h-4 w-4" />
        {unreadAlerts > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadAlerts}
          </span>
        )}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-md p-1.5 pr-2 hover:bg-muted">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <div className="text-xs font-medium leading-tight">{user?.fullName}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role ? (ROLE_LABELS[user.role]?.[lang] ?? user.role) : ""}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/app/profil">
              <UserIcon className="mr-2 h-4 w-4" />
              {t("nav.profil")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
