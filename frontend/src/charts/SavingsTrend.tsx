import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { convert, currencySymbol } from "@/lib/currency";
import { useTheme } from "@/context/ThemeContext";
import type { Transaction } from "@/lib/types";

export function SavingsTrend({ transactions, months = 6 }: { transactions: Transaction[]; months?: number }) {
  const { currency } = useTheme();

  const data = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; saved: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ key, label: d.toLocaleDateString("en-US", { month: "short" }), saved: 0 });
    }
    const index = new Map(buckets.map((b, i) => [b.key, i]));
    for (const t of transactions) {
      if (t.type !== "savings") continue;
      const idx = index.get(t.date.slice(0, 7));
      if (idx == null) continue;
      buckets[idx].saved += convert(t.amount, t.currency, currency);
    }
    return buckets.map((b) => ({ label: b.label, savings: Math.round(b.saved) }));
  }, [transactions, months, currency]);

  const symbol = currencySymbol(currency);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8 }}>
        <defs>
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <ReferenceLine y={0} stroke="var(--color-border)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            color: "var(--color-popover-foreground)",
          }}
          formatter={(v: number) => `${symbol} ${Intl.NumberFormat("en").format(v)}`}
        />
        <Area
          type="monotone"
          dataKey="savings"
          name="Savings"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#savingsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
