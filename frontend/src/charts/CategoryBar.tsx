import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { convert, currencySymbol } from "@/lib/currency";
import { useTheme } from "@/context/ThemeContext";
import { useCategories } from "@/context/CategoriesContext";
import type { Transaction } from "@/lib/types";

export function CategoryBar({ transactions }: { transactions: Transaction[] }) {
  const { currency } = useTheme();
  const { byId } = useCategories();

  const data = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      const amt = convert(t.amount, t.currency, currency);
      totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + amt);
    }
    return Array.from(totals.entries())
      .map(([id, value]) => {
        const cat = byId(id);
        return { name: cat?.name ?? "Uncategorized", color: cat?.color ?? "#94a3b8", value: Math.round(value) };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, currency, byId]);

  const symbol = currencySymbol(currency);

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No expenses to chart yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${symbol}${Intl.NumberFormat("en", { notation: "compact" }).format(v)}`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
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
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
