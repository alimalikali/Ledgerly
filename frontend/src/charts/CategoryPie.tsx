import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { convert, currencySymbol } from "@/lib/currency";
import { useTheme } from "@/context/ThemeContext";
import { useCategories } from "@/context/CategoriesContext";
import type { Transaction } from "@/lib/types";

export function CategoryPie({ transactions }: { transactions: Transaction[] }) {
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
        return { id, name: cat?.name ?? "Uncategorized", color: cat?.color ?? "#94a3b8", value: Math.round(value) };
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
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="var(--color-surface)"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.id} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            color: "var(--color-popover-foreground)",
          }}
          formatter={(v: number) => `${symbol} ${Intl.NumberFormat("en").format(v)}`}
        />
        <Legend wrapperStyle={{ color: "var(--color-muted-foreground)", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
