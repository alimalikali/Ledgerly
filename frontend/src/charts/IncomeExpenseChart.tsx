import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { convert, currencySymbol } from "@/lib/currency";
import { useTheme } from "@/context/ThemeContext";
import type { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  months?: number;
}

export function IncomeExpenseChart({ transactions, months = 6 }: Props) {
  const { currency } = useTheme();

  const data = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; income: number; expense: number; savings: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
        savings: 0,
      });
    }
    const index = new Map(buckets.map((b, i) => [b.key, i]));
    for (const t of transactions) {
      const k = t.date.slice(0, 7);
      const idx = index.get(k);
      if (idx == null) continue;
      const amt = convert(t.amount, t.currency, currency);
      if (t.type === "income") buckets[idx].income += amt;
      else if (t.type === "savings") buckets[idx].savings += amt;
      else buckets[idx].expense += amt;
    }
    return buckets.map((b) => ({
      ...b,
      income: Math.round(b.income),
      expense: Math.round(b.expense),
      savings: Math.round(b.savings),
    }));
  }, [transactions, months, currency]);

  const symbol = currencySymbol(currency);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${symbol}${Intl.NumberFormat("en", { notation: "compact" }).format(v)}`}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            color: "var(--color-popover-foreground)",
          }}
          formatter={(v: number) => `${symbol} ${Intl.NumberFormat("en").format(v)}`}
        />
        <Legend
          wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12, paddingTop: 8 }}
        />
        <Bar dataKey="income" name="Income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="savings" name="Savings" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
