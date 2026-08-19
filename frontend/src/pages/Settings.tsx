import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ModeSelector } from "@/components/ThemeSwitcher";
import { PaletteGallery } from "@/components/PaletteGallery";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { formatMoney, type Currency } from "@/lib/currency";

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();
  const { currency, setCurrency } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Profile */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Update how your name and defaults appear.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Email <span className="text-muted-foreground/60">(read-only)</span>
              </span>
              <input
                readOnly
                value={user?.email ?? ""}
                className="w-full cursor-not-allowed rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Display currency
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => {
                updateProfile({ name });
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
              }}
              className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Save changes
            </button>
            {saved && <span className="text-sm money-in">Saved!</span>}
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Pick a mode and color palette. Changes apply instantly and are saved for next time.
          </p>

          <div className="mt-5 space-y-6">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mode
              </p>
              <ModeSelector />
            </div>

            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Palette
                </p>
              </div>
              <PaletteGallery />
            </div>

            <PreviewCard />
          </div>
        </section>

        {/* Account */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-base font-semibold">Account</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground opacity-70"
            >
              Change password
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Soon
              </span>
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-muted"
              style={{ color: "var(--color-expense)" }}
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function PreviewCard() {
  const { currency } = useTheme();
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Live preview
      </p>
      <div className="palette-gradient rounded-2xl p-1">
        <div className="rounded-[15px] border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Balance
          </p>
          <p className="mt-2 text-3xl font-bold tabular">{formatMoney(12480, currency)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Savings rate 24%</p>
          <div className="mt-4 flex gap-2">
            <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover">
              Primary
            </button>
            <button className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              Secondary
            </button>
            <span className="ml-auto text-xs font-semibold money-in tabular">
              +{formatMoney(320, currency)}
            </span>
            <span className="text-xs font-semibold money-out tabular">
              −{formatMoney(84, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
