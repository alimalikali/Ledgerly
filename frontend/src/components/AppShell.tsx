import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Tags,
  Settings as SettingsIcon,
  Wallet,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { QuickModeToggle } from "@/components/ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const path = useLocation().pathname;
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (md+) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 items-center gap-2.5 px-6">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Wallet className="size-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">Ledgerly</span>
        </div>
        <nav className="mt-4 flex-1 px-3">
          <ul className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = path === to || path.startsWith(to + "/");
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mx-3 mb-4 rounded-2xl border border-border bg-surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-medium">{user?.name}</p>
          <button
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" aria-hidden /> Log out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface md:hidden"
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyToggle />
            <QuickModeToggle />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm transition-colors hover:bg-muted"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {(user?.name ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden font-medium sm:inline">{user?.name}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
                  role="menu"
                >
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  >
                    Settings
                  </Link>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-expense hover:bg-muted"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>

      {/* Mobile bottom tabs */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path === to || path.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
