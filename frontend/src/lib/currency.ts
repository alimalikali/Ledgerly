export type Currency = "PKR" | "USD";

// Simple static rate for display conversion. In production this would come from the API.
export const RATES: Record<Currency, number> = {
  USD: 1,
  PKR: 278,
};

export const currencySymbol = (c: Currency) => (c === "USD" ? "$" : "Rs");

/** Convert `amount` from `from` currency to `to` currency. */
export function convert(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const usd = amount / RATES[from];
  return usd * RATES[to];
}

export function formatMoney(amount: number, currency: Currency, opts?: { signed?: boolean }): string {
  const symbol = currencySymbol(currency);
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
    minimumFractionDigits: currency === "PKR" ? 0 : 2,
  }).format(abs);
  const sign = opts?.signed ? (amount < 0 ? "−" : amount > 0 ? "+" : "") : amount < 0 ? "−" : "";
  return `${sign}${symbol} ${formatted}`;
}
