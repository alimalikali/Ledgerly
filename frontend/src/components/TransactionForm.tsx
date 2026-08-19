import { useEffect, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { useTransactions } from "@/context/TransactionsContext";
import { useCategories } from "@/context/CategoriesContext";
import type { Currency } from "@/lib/currency";
import type { TxType } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { TX_TYPES, typeColorVar } from "@/lib/tx";
import { cn } from "@/lib/utils";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({ onDone }: { onDone?: () => void }) {
  const { add } = useTransactions();
  const { byType, add: addCategory } = useCategories();
  const [type, setType] = useState<TxType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline "create category" state.
  const [creatingCat, setCreatingCat] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(CATEGORY_COLORS[5]);
  const [catError, setCatError] = useState<string | null>(null);
  const [catSaving, setCatSaving] = useState(false);

  const options = byType(type);

  const createCategory = async () => {
    if (!catName.trim()) return setCatError("Name is required.");
    setCatError(null);
    setCatSaving(true);
    try {
      const created = await addCategory({ name: catName.trim(), type, color: catColor });
      setCategoryId(created.id);
      setCatName("");
      setCreatingCat(false);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setCatSaving(false);
    }
  };

  // Keep the selected category valid for the chosen type.
  useEffect(() => {
    if (!options.some((c) => c.id === categoryId)) setCategoryId(options[0]?.id ?? "");
  }, [options, categoryId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description.trim()) return setError("Description is required.");
    if (!(amt > 0)) return setError("Amount must be greater than zero.");
    if (!categoryId) return setError("Pick a category.");
    setError(null);
    setSaving(true);
    try {
      await add({ description: description.trim(), amount: amt, currency, categoryId, date });
      setDescription("");
      setAmount("");
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
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

      <Field label="Description">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries at Metro"
          className={inputCls}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={cn(inputCls, "tabular")}
          />
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={inputCls}>
            <option value="USD">USD ($)</option>
            <option value="PKR">PKR (Rs)</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            {!creatingCat && (
              <button
                type="button"
                onClick={() => {
                  setCatError(null);
                  setCreatingCat(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="size-3" aria-hidden /> New
              </button>
            )}
          </div>
          {options.length === 0 && !creatingCat ? (
            <p className="text-xs text-muted-foreground">
              No {type} categories yet — tap <span className="font-medium text-primary">New</span> to create one.
            </p>
          ) : !creatingCat ? (
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
      </div>

      {creatingCat && (
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">New {type} category</span>
            <button
              type="button"
              onClick={() => {
                setCreatingCat(false);
                setCatError(null);
              }}
              aria-label="Cancel new category"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Category name"
            className={inputCls}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createCategory();
              }
            }}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCatColor(c)}
                aria-label={`Use color ${c}`}
                className={cn(
                  "size-6 rounded-full border-2 transition-transform hover:scale-110",
                  catColor === c ? "border-foreground" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {catError && <p className="mt-2 text-xs money-out">{catError}</p>}
          <button
            type="button"
            onClick={createCategory}
            disabled={catSaving}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-70"
          >
            <Plus className="size-3.5" aria-hidden /> {catSaving ? "Creating…" : "Create category"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-expense/10 px-3 py-2 text-sm money-out">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || options.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
      >
        <Plus className="size-4" aria-hidden /> {saving ? "Adding…" : "Add transaction"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
