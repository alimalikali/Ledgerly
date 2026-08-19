/**
 * API client for the Express backend. All requests send `credentials: "include"`
 * so the httpOnly auth cookie flows. In dev, Vite proxies /api → :4000.
 */
import type { Category, NewCategory, NewTransaction, Transaction, User } from "@/lib/types";

const BASE_URL = "/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const message = (payload as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload as T;
}

const body = (data: unknown) => JSON.stringify(data);

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request<User>("/auth/register", { method: "POST", body: body({ name, email, password }) }),
    login: (email: string, password: string) =>
      request<User>("/auth/login", { method: "POST", body: body({ email, password }) }),
    me: () => request<User>("/auth/me"),
    logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
    updateProfile: (patch: Partial<Pick<User, "name" | "displayCurrency">>) =>
      request<{ ok: true }>("/auth/profile", { method: "PUT", body: body(patch) }),
  },
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (input: NewCategory) => request<Category>("/categories", { method: "POST", body: body(input) }),
    update: (id: string, patch: Partial<Omit<NewCategory, "type">>) =>
      request<Category>(`/categories/${id}`, { method: "PUT", body: body(patch) }),
    remove: (id: string) => request<{ ok: true }>(`/categories/${id}`, { method: "DELETE" }),
  },
  transactions: {
    list: () => request<Transaction[]>("/transactions"),
    create: (input: NewTransaction) => request<Transaction>("/transactions", { method: "POST", body: body(input) }),
    update: (id: string, patch: Partial<NewTransaction>) =>
      request<Transaction>(`/transactions/${id}`, { method: "PUT", body: body(patch) }),
    remove: (id: string) => request<{ ok: true }>(`/transactions/${id}`, { method: "DELETE" }),
  },
};
