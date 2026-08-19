import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { Category, NewCategory, TxType } from "@/lib/types";

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  byId: (id: string) => Category | undefined;
  byType: (type: TxType) => Category[];
  add: (input: NewCategory) => Promise<Category>;
  update: (id: string, patch: Partial<Omit<NewCategory, "type">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<CategoriesState | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api.categories
      .list()
      .then((cats) => alive && setCategories(cats))
      .catch(() => alive && setCategories([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user]);

  const byId = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);
  const byType = useCallback((type: TxType) => categories.filter((c) => c.type === type), [categories]);

  const value = useMemo<CategoriesState>(
    () => ({
      categories,
      loading,
      byId,
      byType,
      add: async (input) => {
        const created = await api.categories.create(input);
        setCategories((prev) => [...prev, created].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)));
        return created;
      },
      update: async (id, patch) => {
        const updated = await api.categories.update(id, patch);
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      },
      remove: async (id) => {
        await api.categories.remove(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
      },
    }),
    [categories, loading, byId, byType],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCategories() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
