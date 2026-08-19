import type { Currency } from "./currency";

export type TxType = "income" | "expense" | "savings";

export interface User {
  id: string;
  name: string;
  email: string;
  displayCurrency: Currency;
}

export interface Category {
  id: string;
  name: string;
  type: TxType;
  color: string; // hex
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  type: TxType;
  categoryId: string;
  date: string; // YYYY-MM-DD
}

// Input shapes (server derives id + type-from-category).
export type NewTransaction = Omit<Transaction, "id" | "type">;
export type NewCategory = Omit<Category, "id">;
