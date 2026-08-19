// End-to-end smoke test. Requires the server running (npm run dev) + DB up.
//   node smoke.mjs
import assert from "node:assert/strict";

const BASE = process.env.SMOKE_BASE || "http://localhost:4000";

async function req(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.get("set-cookie");
  const token = setCookie ? setCookie.split(";")[0] : null;
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  return { status: res.status, json, cookie: token };
}

const email = `smoke_${Date.now()}_${Math.floor(Math.random() * 1e6)}@test.dev`;
let pass = 0;
const ok = (label) => {
  pass++;
  console.log(`  ✓ ${label}`);
};

// health
assert.equal((await req("/api/health")).status, 200);
ok("health");

// register -> seeds default categories
const reg = await req("/api/auth/register", { method: "POST", body: { name: "Smoke", email, password: "secret123" } });
assert.equal(reg.status, 201);
assert.ok(reg.cookie?.startsWith("token="));
const cookie = reg.cookie;
ok("register sets auth cookie");

const cats = await req("/api/categories", { cookie });
assert.equal(cats.status, 200);
assert.equal(cats.json.length, 11, "11 default categories seeded");
ok("default categories seeded on register");

const incomeCat = cats.json.find((c) => c.type === "income");
const expenseCat = cats.json.find((c) => c.type === "expense");
assert.ok(incomeCat && expenseCat);
assert.ok(/^#[0-9a-f]{6}$/i.test(expenseCat.color));
ok("categories are typed + colored");

// create a custom category
const custom = await req("/api/categories", { method: "POST", cookie, body: { name: "Coffee", type: "expense", color: "#a16207" } });
assert.equal(custom.status, 201);
assert.equal(custom.json.name, "Coffee");
ok("create custom category");

// duplicate category -> 409
assert.equal((await req("/api/categories", { method: "POST", cookie, body: { name: "Coffee", type: "expense", color: "#000000" } })).status, 409);
ok("duplicate category rejected");

// bad color -> 400
assert.equal((await req("/api/categories", { method: "POST", cookie, body: { name: "X", type: "expense", color: "red" } })).status, 400);
ok("invalid color rejected");

// create transactions (type derived from category)
const inc = await req("/api/transactions", {
  method: "POST",
  cookie,
  body: { description: "July salary", amount: 4200, currency: "USD", categoryId: incomeCat.id, date: "2026-07-01" },
});
assert.equal(inc.status, 201);
assert.equal(inc.json.type, "income", "type derived from category");
assert.equal(inc.json.description, "July salary");
assert.equal(typeof inc.json.amount, "number");
ok("create income (type derived, serialized)");

const exp = await req("/api/transactions", {
  method: "POST",
  cookie,
  body: { description: "Groceries", amount: 12400, currency: "PKR", categoryId: expenseCat.id, date: "2026-07-05" },
});
assert.equal(exp.status, 201);
assert.equal(exp.json.type, "expense");
ok("create expense");

// unknown/foreign category -> 400
assert.equal(
  (await req("/api/transactions", { method: "POST", cookie, body: { description: "x", amount: 1, currency: "USD", categoryId: "nope", date: "2026-07-01" } })).status,
  400,
);
ok("unknown category rejected");

// list + filters
assert.equal((await req("/api/transactions", { cookie })).json.length, 2);
assert.equal((await req("/api/transactions?type=expense", { cookie })).json.length, 1);
assert.equal((await req("/api/transactions?search=grocer", { cookie })).json.length, 1);
assert.equal((await req(`/api/transactions?category=${expenseCat.id}`, { cookie })).json.length, 1);
ok("list + filters (type / search / category)");

// cannot delete a category in use -> 409
assert.equal((await req(`/api/categories/${expenseCat.id}`, { method: "DELETE", cookie })).status, 409);
ok("category in use cannot be deleted");

// update transaction
const upd = await req(`/api/transactions/${exp.json.id}`, { method: "PUT", cookie, body: { description: "Groceries – Metro" } });
assert.equal(upd.status, 200);
assert.equal(upd.json.description, "Groceries – Metro");
ok("update transaction");

// ownership: another user cannot touch first user's data
const other = await req("/api/auth/register", { method: "POST", body: { name: "Other", email: `o_${email}`, password: "secret123" } });
assert.equal((await req(`/api/transactions/${exp.json.id}`, { method: "DELETE", cookie: other.cookie })).status, 404);
assert.equal((await req(`/api/transactions`, { method: "POST", cookie: other.cookie, body: { description: "x", amount: 1, currency: "USD", categoryId: expenseCat.id, date: "2026-07-01" } })).status, 400);
ok("cross-user access blocked (tx + category)");

// delete transaction, then the (now unused) custom category
assert.equal((await req(`/api/transactions/${exp.json.id}`, { method: "DELETE", cookie })).status, 200);
assert.equal((await req(`/api/categories/${custom.json.id}`, { method: "DELETE", cookie })).status, 200);
ok("delete transaction + unused category");

// auth required everywhere
assert.equal((await req("/api/categories")).status, 401);
assert.equal((await req("/api/transactions")).status, 401);
ok("endpoints require auth");

// profile update
assert.equal((await req("/api/auth/profile", { method: "PUT", cookie, body: { displayCurrency: "USD" } })).status, 200);
assert.equal((await req("/api/auth/me", { cookie })).json.displayCurrency, "USD");
ok("profile update persists");

console.log(`\nAll ${pass} checks passed.`);
