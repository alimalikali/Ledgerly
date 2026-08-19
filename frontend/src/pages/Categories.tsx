import { useState, type FormEvent } from "react";
import { Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCategories } from "@/context/CategoriesContext";
import type { Category, TxType } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { TX_TYPES, typeColorVar } from "@/lib/tx";
import { cn } from "@/lib/utils";

export default function Categories() {
  const { categories, add } = useCategories();
  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [color, setColor] = useState(CATEGORY_COLORS[5]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    setError(null);
    setSaving(true);
    try {
      await add({ name: name.trim(), type, color });
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setSaving(false);
    }
  };

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");
  const savings = categories.filter((c) => c.type === "savings");

  return (
    <AppShell title="Categories">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add form */}
        <aside>
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">New category</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                <div className="inline-flex rounded-xl border border-border bg-surface p-1">
                  {TX_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                        type === t ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                      style={type === t ? { backgroundColor: typeColorVar(t) } : undefined}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Color</span>
                <div className="flex flex-wrap items-center gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      aria-label={`Use color ${c}`}
                      className={cn("size-7 rounded-full border-2 transition-transform hover:scale-110", color === c ? "border-foreground" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Custom color"
                    className="size-7 cursor-pointer rounded-full border border-border bg-transparent p-0"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-lg bg-expense/10 px-3 py-2 text-sm money-out">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-70"
              >
                <Plus className="size-4" aria-hidden /> {saving ? "Adding…" : "Add category"}
              </button>
            </form>
          </div>
        </aside>

        {/* Lists */}
        <div className="space-y-6">
          <CategoryList title="Income" items={income} accent="var(--color-income)" />
          <CategoryList title="Expense" items={expense} accent="var(--color-expense)" />
          <CategoryList title="Savings" items={savings} accent="var(--color-primary)" />
        </div>
      </div>
    </AppShell>
  );
}

function CategoryList({ title, items, accent }: { title: string; items: Category[]; accent: string }) {
  const { remove } = useCategories();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const del = async (id: string) => {
    setError(null);
    setBusy(id);
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
        {title}
        <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h2>
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-expense/10 px-3 py-2 text-sm money-out">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} categories yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((c) => (
            <li
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-3 pr-1.5 text-sm"
            >
              <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
              {c.name}
              <button
                onClick={() => del(c.id)}
                disabled={busy === c.id}
                aria-label={`Delete ${c.name}`}
                className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-expense disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
