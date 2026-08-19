import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { CategoryPill } from "@/components/CategoryPill";
import { IncomeExpenseChart } from "@/charts/IncomeExpenseChart";
import { CategoryPie } from "@/charts/CategoryPie";
import { SavingsTrend } from "@/charts/SavingsTrend";
import { useTransactions } from "@/context/TransactionsContext";
import { useTheme } from "@/context/ThemeContext";
import { convert, formatMoney } from "@/lib/currency";
import { formatDate } from "@/lib/format";
import { amountClass } from "@/lib/tx";

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { currency } = useTheme();

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let saved = 0;
    for (const t of transactions) {
      const amt = convert(t.amount, t.currency, currency);
      if (t.type === "income") income += amt;
      else if (t.type === "savings") saved += amt;
      else expense += amt;
    }
    const balance = income - expense - saved;
    const savingsRate = income > 0 ? Math.round((saved / income) * 100) : 0;
    return { income, expense, saved, balance, savingsRate };
  }, [transactions, currency]);

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 5),
    [transactions],
  );

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Income"
          value={stats.income}
          icon={<ArrowUpRight className="size-4" />}
          accent="income"
          trend="All time"
        />
        <StatCard
          label="Total Expenses"
          value={stats.expense}
          icon={<ArrowDownRight className="size-4" />}
          accent="expense"
          trend="All time"
        />
        <StatCard
          label="Total Saved"
          value={stats.saved}
          icon={<PiggyBank className="size-4" />}
          accent="savings"
          trend={`Savings rate ${stats.savingsRate}%`}
        />
        <StatCard
          label="Current Balance"
          value={stats.balance}
          icon={<Wallet className="size-4" />}
          accent="primary"
          trend="Income − expenses − saved"
          highlight
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-3">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Income vs Expense</h2>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </header>
          <IncomeExpenseChart transactions={transactions} />
        </section>
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Where money goes</h2>
            <p className="text-xs text-muted-foreground">By category</p>
          </header>
          <CategoryPie transactions={transactions} />
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <header className="mb-2 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Savings trend</h2>
          <p className="text-xs text-muted-foreground">Money set aside, last 6 months</p>
        </header>
        <SavingsTrend transactions={transactions} months={6} />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface shadow-sm">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Recent transactions</h2>
          <Link
            to="/transactions"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </header>
        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((t) => {
              const amt = convert(t.amount, t.currency, currency);
              const signed = t.type === "income" ? amt : -amt;
              return (
                <li key={t.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(t.date)}</span>
                      <span aria-hidden>•</span>
                      <CategoryPill id={t.categoryId} />
                    </div>
                  </div>
                  <div className={`text-right text-sm font-semibold tabular ${amountClass(t.type)}`}>
                    {formatMoney(signed, currency, { signed: true })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  trend,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "income" | "expense" | "primary" | "savings" | "muted";
  trend: string;
  highlight?: boolean;
}) {
  const { currency } = useTheme();
  const isPrimary = accent === "primary" || accent === "savings";
  const iconStyle: React.CSSProperties = {
    backgroundColor:
      accent === "income"
        ? "color-mix(in oklab, var(--color-income) 15%, transparent)"
        : accent === "expense"
          ? "color-mix(in oklab, var(--color-expense) 15%, transparent)"
          : isPrimary
            ? "color-mix(in oklab, var(--color-primary) 18%, transparent)"
            : "var(--color-muted)",
    color:
      accent === "income"
        ? "var(--color-income)"
        : accent === "expense"
          ? "var(--color-expense)"
          : isPrimary
            ? "var(--color-primary)"
            : "var(--color-muted-foreground)",
  };
  return (
    <article
      className={`animate-in-up rounded-2xl border p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${
        highlight
          ? "border-primary/30 bg-surface"
          : "border-border bg-surface"
      }`}
      style={
        highlight
          ? {
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 10%, transparent), transparent 60%)",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className="inline-flex size-8 items-center justify-center rounded-lg"
          style={iconStyle}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular">
        <AnimatedNumber value={value} format={(n) => formatMoney(n, currency)} />
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-muted">
        <Wallet className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">
        No transactions yet — add your first one to get started.
      </p>
      <Link
        to="/transactions"
        className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Add transaction
      </Link>
    </div>
  );
}
