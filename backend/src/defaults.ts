// Default categories seeded for every new user. They are ordinary rows the user
// can rename, recolor, or delete afterwards.
export const DEFAULT_CATEGORIES: { name: string; type: "income" | "expense" | "savings"; color: string }[] = [
  { name: "Salary", type: "income", color: "#10b981" },
  { name: "Freelancing", type: "income", color: "#0ea5e9" },
  { name: "Investments", type: "income", color: "#8b5cf6" },
  { name: "Food", type: "expense", color: "#f97316" },
  { name: "Shopping", type: "expense", color: "#ec4899" },
  { name: "Travel", type: "expense", color: "#06b6d4" },
  { name: "Rent", type: "expense", color: "#f59e0b" },
  { name: "Bills", type: "expense", color: "#ef4444" },
  { name: "Entertainment", type: "expense", color: "#d946ef" },
  { name: "Emergency Fund", type: "savings", color: "#14b8a6" },
  { name: "General Savings", type: "savings", color: "#6366f1" },
];
