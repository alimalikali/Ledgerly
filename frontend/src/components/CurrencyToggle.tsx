import { useTheme } from "@/context/ThemeContext";
import type { Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useTheme();

  const options: { id: Currency; label: string }[] = [
    { id: "PKR", label: "Rs" },
    { id: "USD", label: "$" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface p-1 text-sm",
        className,
      )}
    >
      {options.map((o) => {
        const active = currency === o.id;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            onClick={() => setCurrency(o.id)}
            className={cn(
              "relative rounded-full px-3 py-1 font-medium tabular transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
