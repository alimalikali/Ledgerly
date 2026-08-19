import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IncomeExpenseChart } from "@/charts/IncomeExpenseChart";
import { CategoryPie } from "@/charts/CategoryPie";
import { SavingsTrend } from "@/charts/SavingsTrend";
import { CategoryBar } from "@/charts/CategoryBar";
import { useTransactions } from "@/context/TransactionsContext";
import { useTheme } from "@/context/ThemeContext";
import { convert, formatMoney } from "@/lib/currency";

export default function Reports() {
  const { transactions } = useTransactions();
  const { currency } = useTheme();

  const nowKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const [month, setMonth] = useState(nowKey());

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month],
  );

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let saved = 0;
    for (const t of monthTx) {
      const amt = convert(t.amount, t.currency, currency);
      if (t.type === "income") income += amt;
      else if (t.type === "savings") saved += amt;
      else expense += amt;
    }
    const spendingPct = income > 0 ? (expense / income) * 100 : 0;
    return { income, expense, saved, spendingPct };
  }, [monthTx, currency]);

  return (
    <AppShell title="Reports">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Month</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <button
          disabled
          aria-disabled
          title="Export coming soon"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground opacity-70"
        >
          <Download className="size-4" aria-hidden />
          Export PDF / CSV
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide">
            Soon
          </span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Total Income" value={formatMoney(stats.income, currency)} tone="income" />
        <Tile label="Total Expenses" value={formatMoney(stats.expense, currency)} tone="expense" />
        <Tile label="Saved" value={formatMoney(stats.saved, currency)} tone="primary" />
        <Tile
          label="Spending %"
          value={`${stats.spendingPct.toFixed(0)}%`}
          tone="primary"
          sub="of income"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-2 text-base font-semibold">Monthly Income vs Expense</h2>
          <IncomeExpenseChart transactions={transactions} months={6} />
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-2 text-base font-semibold">Category breakdown</h2>
          <CategoryPie transactions={monthTx} />
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-3">
          <h2 className="mb-2 text-base font-semibold">Savings trend</h2>
          <p className="mb-2 text-xs text-muted-foreground">Money set aside per month (last 6 months)</p>
          <SavingsTrend transactions={transactions} months={6} />
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-2 text-base font-semibold">Spending by category</h2>
          <p className="mb-2 text-xs text-muted-foreground">This month</p>
          <CategoryBar transactions={monthTx} />
        </section>
      </div>
    </AppShell>
  );
}

function Tile({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone: "income" | "expense" | "primary";
  sub?: string;
}) {
  const color =
    tone === "income" ? "money-in" : tone === "expense" ? "money-out" : "text-primary";
  return (
    <article className="animate-in-up rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-3 text-2xl font-bold tracking-tight tabular ${color}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </article>
  );
}
