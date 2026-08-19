import { useMemo, useState } from "react";
import { Search, Trash2, Plus, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryPill } from "@/components/CategoryPill";
import { TransactionForm } from "@/components/TransactionForm";
import { useTransactions } from "@/context/TransactionsContext";
import { useCategories } from "@/context/CategoriesContext";
import { useTheme } from "@/context/ThemeContext";
import type { TxType } from "@/lib/types";
import { convert, formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { amountClass } from "@/lib/tx";
import { cn } from "@/lib/utils";

type SortKey = "date" | "amount";

export default function Transactions() {
  const { transactions, remove } = useTransactions();
  const { categories } = useCategories();
  const { currency } = useTheme();

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);
    return transactions
      .filter((t) => {
        if (q && !t.description.toLowerCase().includes(q)) return false;
        if (typeFilter !== "all" && t.type !== typeFilter) return false;
        if (categoryFilter !== "all" && t.categoryId !== categoryFilter) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        const displayAmt = convert(t.amount, t.currency, currency);
        if (!Number.isNaN(min) && minAmount && displayAmt < min) return false;
        if (!Number.isNaN(max) && maxAmount && displayAmt > max) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === "date") cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        else {
          const av = convert(a.amount, a.currency, currency);
          const bv = convert(b.amount, b.currency, currency);
          cmp = av - bv;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [transactions, query, typeFilter, categoryFilter, from, to, minAmount, maxAmount, sortKey, sortDir, currency]);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
  };

  const hasFilters =
    query || typeFilter !== "all" || categoryFilter !== "all" || from || to || minAmount || maxAmount;

  return (
    <AppShell title="Transactions">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="order-2 space-y-4 lg:order-1">
          {/* Filters */}
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search description…"
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | TxType)}
                className={filterCls}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="savings">Savings</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={filterCls}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={filterCls}
                aria-label="From date"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={filterCls}
                aria-label="To date"
              />
              <input
                type="number"
                placeholder="Min"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className={cn(filterCls, "w-24 tabular")}
                aria-label="Minimum amount"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className={cn(filterCls, "w-24 tabular")}
                aria-label="Maximum amount"
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" aria-hidden /> Clear filters
                </button>
              )}
            </div>
          </section>

          {/* Mobile add button */}
          <button
            onClick={() => setFormOpen((s) => !s)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary-hover lg:hidden"
          >
            <Plus className="size-4" /> Add transaction
          </button>
          {formOpen && (
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm lg:hidden">
              <TransactionForm onDone={() => setFormOpen(false)} />
            </section>
          )}

          {/* Table */}
          <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="hidden md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <ThHead
                      label="Date"
                      active={sortKey === "date"}
                      dir={sortDir}
                      onClick={() => {
                        if (sortKey === "date") setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("date");
                          setSortDir("desc");
                        }
                      }}
                    />
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <ThHead
                      label="Amount"
                      align="right"
                      active={sortKey === "amount"}
                      dir={sortDir}
                      onClick={() => {
                        if (sortKey === "amount") setSortDir(sortDir === "asc" ? "desc" : "asc");
                        else {
                          setSortKey("amount");
                          setSortDir("desc");
                        }
                      }}
                    />
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                        No transactions match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const displayAmt = convert(t.amount, t.currency, currency);
                      const signed = t.type === "income" ? displayAmt : -displayAmt;
                      return (
                        <tr key={t.id} className="hover:bg-muted/40">
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {formatDate(t.date)}
                          </td>
                          <td className="px-4 py-3 font-medium">{t.description}</td>
                          <td className="px-4 py-3">
                            <CategoryPill id={t.categoryId} />
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular ${
                              amountClass(t.type)
                            }`}
                          >
                            {formatMoney(signed, currency, { signed: true })}
                          </td>
                          <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
                            {t.type}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${t.description}"?`)) remove(t.id);
                              }}
                              aria-label={`Delete ${t.description}`}
                              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-expense focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="divide-y divide-border md:hidden">
              {filtered.length === 0 && (
                <li className="py-14 text-center text-sm text-muted-foreground">
                  No transactions match your filters.
                </li>
              )}
              {filtered.map((t) => {
                const displayAmt = convert(t.amount, t.currency, currency);
                const signed = t.type === "income" ? displayAmt : -displayAmt;
                return (
                  <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(t.date)}</span>
                        <CategoryPill id={t.categoryId} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold tabular ${
                          amountClass(t.type)
                        }`}
                      >
                        {formatMoney(signed, currency, { signed: true })}
                      </p>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${t.description}"?`)) remove(t.id);
                        }}
                        aria-label={`Delete ${t.description}`}
                        className="mt-1 text-xs text-muted-foreground hover:text-expense"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Add form (desktop) */}
        <aside className="order-1 lg:order-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Add transaction</h2>
            <TransactionForm />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

const filterCls =
  "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function ThHead({
  label,
  active,
  dir,
  onClick,
  align,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "right";
}) {
  return (
    <th className={cn("px-4 py-3 font-semibold", align === "right" ? "text-right" : "text-left")}>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {label}
        {active && <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}
