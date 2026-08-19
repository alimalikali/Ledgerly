import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { NewTransaction, Transaction } from "@/lib/types";

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  add: (input: NewTransaction) => Promise<void>;
  update: (id: string, patch: Partial<NewTransaction>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<TransactionsState | null>(null);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api.transactions
      .list()
      .then((rows) => alive && setTransactions(rows))
      .catch(() => alive && setTransactions([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user]);

  const value = useMemo<TransactionsState>(
    () => ({
      transactions,
      loading,
      add: async (input) => {
        const created = await api.transactions.create(input);
        setTransactions((prev) => [created, ...prev]);
      },
      update: async (id, patch) => {
        const updated = await api.transactions.update(id, patch);
        setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      },
      remove: async (id) => {
        await api.transactions.remove(id);
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      },
    }),
    [transactions, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTransactions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
}
