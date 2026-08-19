import type { TxType } from "@/lib/types";

// Color class for a transaction amount by type.
// income → green, expense → red, savings → primary (money set aside, not lost).
export function amountClass(type: TxType): string {
  return type === "income" ? "money-in" : type === "savings" ? "text-primary" : "money-out";
}

// CSS var for the type's accent color (used by charts / toggles).
export function typeColorVar(type: TxType): string {
  return type === "income"
    ? "var(--color-income)"
    : type === "savings"
      ? "var(--color-primary)"
      : "var(--color-expense)";
}

export const TX_TYPES: TxType[] = ["expense", "income", "savings"];
