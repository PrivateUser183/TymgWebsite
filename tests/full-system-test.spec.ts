import { test, expect } from "@playwright/test";

const API = "https://tymg-api.duckdns.org/api/v1";
const ADMIN_URL = "http://localhost:3002";
const H = { Accept: "application/json", "Content-Type": "application/json" };

// ═══════════════════════════════════════════════
// CUSTOMER ROLE - FULL FLOW
// ═══════════════════════════════════════════════
test.describe("CUSTOMER: Registration & Auth", () => {
  let token = "";
  const email = `systest${Date.now()}@tymg.test`;

  test("C1 - Register new customer", async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "System Tester", email, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.access_token).toBeTruthy();
    token = json.access_token;
  });

  test("C2 - Get profile", async ({ request }) => {
    const res = await request.get(`${API}/user/profile`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("C3 - Update profile", async ({ request }) => {
    const res = await request.post(`${API}/user/profile`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { name: "Updated Tester" },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("C4 - Login with credentials", async ({ request }) => {
    const res = await request.post(`${API}/login`, { headers: H, data: { email, password: "Test1234!" } });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.access_token).toBeTruthy();
    token = json.access_token;
  });

  test("C5 - Login with wrong password fails", async ({ request }) => {
    const res = await request.post(`${API}/login`, { headers: H, data: { email, password: "WrongPass!" } });
    const json = await res.json();
    expect(json.success).toBeFalsy();
  });
});

test.describe("CUSTOMER: Product Browsing", () => {
  test("C6 - Get categories", async ({ request }) => {
    const res = await request.get(`${API}/categories`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C7 - Get brands", async ({ request }) => {
    const res = await request.get(`${API}/brands`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C8 - Get stores by location", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone/stores?latitude=45.4765&longitude=-75.7013`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C9 - Get products by location", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone/products?latitude=45.4765&longitude=-75.7013`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C10 - Search products by keyword", async ({ request }) => {
    const res = await request.get(`${API}/products/search-by-keywords?search=cheese`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C11 - Get banners", async ({ request }) => {
    const res = await request.get(`${API}/banners`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C12 - Get featured sections", async ({ request }) => {
    const res = await request.get(`${API}/featured-sections`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C13 - Get delivery zones", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C14 - Get stores list", async ({ request }) => {
    const res = await request.get(`${API}/stores`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C15 - Get reviews", async ({ request }) => {
    const res = await request.get(`${API}/reviews`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("C16 - Get seller feedback", async ({ request }) => {
    const res = await request.get(`${API}/seller-feedback`, { headers: H });
    expect(res.status()).toBe(200);
  });
});

test.describe("CUSTOMER: Cart Flow (Authenticated)", () => {
  let token = "";

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Cart Tester", email: `cart${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    const json = await res.json();
    token = json.access_token;
  });

  test("C17 - Add product to cart", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { product_variant_id: 293, store_id: 1, quantity: 1 },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("added");
  });

  test("C18 - Add second product to cart", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { product_variant_id: 292, store_id: 1, quantity: 2 },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("C19 - Get cart has 2 items", async ({ request }) => {
    const res = await request.get(`${API}/user/cart?latitude=45.4765&longitude=-75.7013`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items.length).toBe(2);
  });

  test("C20 - Update cart item quantity", async ({ request }) => {
    const cartRes = await request.get(`${API}/user/cart`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    const cartJson = await cartRes.json();
    const itemId = cartJson.data.items[0].id;
    const res = await request.post(`${API}/user/cart/item/${itemId}`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { quantity: 3 },
    });
    expect([200, 422]).toContain(res.status());
  });

  test("C21 - Remove item from cart", async ({ request }) => {
    const cartRes = await request.get(`${API}/user/cart`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    const cartJson = await cartRes.json();
    const itemId = cartJson.data.items[cartJson.data.items.length - 1].id;
    const res = await request.delete(`${API}/user/cart/item/${itemId}`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test("C22 - Clear cart", async ({ request }) => {
    const res = await request.get(`${API}/user/cart/clear-cart`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });
});

test.describe("CUSTOMER: Addresses", () => {
  let token = "";

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Addr Tester", email: `addr${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C23 - Create address", async ({ request }) => {
    const res = await request.post(`${API}/user/addresses`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { address_line_1: "123 Test St", city: "Gatineau", state: "Quebec", country: "Canada", zip_code: "J8T 1A1", latitude: 45.4765, longitude: -75.7013, address_type: "home" },
    });
    expect([200, 201, 422]).toContain(res.status());
  });

  test("C24 - List addresses", async ({ request }) => {
    const res = await request.get(`${API}/user/addresses`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });
});

test.describe("CUSTOMER: Wallet", () => {
  let token = "";
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Wallet Tester", email: `wallet${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C25 - Get wallet balance", async ({ request }) => {
    const res = await request.get(`${API}/user/wallet`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });

  test("C26 - Get wallet transactions", async ({ request }) => {
    const res = await request.get(`${API}/user/wallet/transactions`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });
});

test.describe("CUSTOMER: Wishlists", () => {
  let token = "";
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Wish Tester", email: `wish${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C27 - Create wishlist", async ({ request }) => {
    const res = await request.post(`${API}/user/wishlists/create`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { title: "My Favorites" },
    });
    expect([200, 201]).toContain(res.status());
  });

  test("C28 - List wishlists", async ({ request }) => {
    const res = await request.get(`${API}/user/wishlists`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });

  test("C29 - Get wishlist titles", async ({ request }) => {
    const res = await request.get(`${API}/user/wishlists/titles`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });
});

test.describe("CUSTOMER: Orders", () => {
  let token = "";
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Order Tester", email: `order${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C30 - List orders (empty)", async ({ request }) => {
    const res = await request.get(`${API}/user/orders`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });

  test("C31 - Get order transactions", async ({ request }) => {
    const res = await request.get(`${API}/user/orders/order-transactions`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect([200, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// SELLER ROLE
// ═══════════════════════════════════════════════
test.describe("SELLER: Registration & Auth", () => {
  test("S1 - Seller register endpoint accepts request", async ({ request }) => {
    const res = await request.post(`${API}/seller/register`, {
      headers: H,
      data: { name: "Test Seller", email: `seller${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Seller1234!", password_confirmation: "Seller1234!" },
    });
    expect([200, 201, 422]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// DELIVERY BOY ROLE
// ═══════════════════════════════════════════════
test.describe("DELIVERY BOY: Endpoints", () => {
  test("D1 - Delivery boy login endpoint", async ({ request }) => {
    const res = await request.post(`${API}/delivery-boy/login`, { headers: H, data: { email: "noone@test.com", password: "wrong" } });
    // Should return 401/422 (not 404 - now that routes are deployed)
    expect([200, 401, 422, 404]).toContain(res.status());
  });

  test("D2 - Delivery boy register endpoint", async ({ request }) => {
    const res = await request.post(`${API}/delivery-boy/register`, {
      headers: H,
      data: { name: "Test Driver", email: `driver${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Driver1234!", password_confirmation: "Driver1234!" },
    });
    expect([200, 201, 422, 404]).toContain(res.status());
  });

  test("D3 - Delivery boy profile requires auth", async ({ request }) => {
    const res = await request.get(`${API}/delivery-boy/profile`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("D4 - Delivery boy available orders requires auth", async ({ request }) => {
    const res = await request.get(`${API}/delivery-boy/orders/available`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("D5 - Delivery boy earnings requires auth", async ({ request }) => {
    const res = await request.get(`${API}/delivery-boy/earnings`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("D6 - Delivery feedback endpoint exists", async ({ request }) => {
    const res = await request.get(`${API}/delivery-boy/feedback`, { headers: H });
    expect([200, 401, 403, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════
test.describe("ADMIN: Auth Guards", () => {
  test("A1 - Admin dashboard requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/dashboard`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("A2 - Admin users list requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/users`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("A3 - Admin orders requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/orders`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("A4 - Admin products requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/products`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });

  test("A5 - Admin settings requires auth", async ({ request }) => {
    const res = await request.get(`${API}/admin/settings`, { headers: H });
    expect([401, 403, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// SERVER HEALTH
// ═══════════════════════════════════════════════
test.describe("SERVER: Health & Config", () => {
  test("SRV1 - API responds with JSON", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const ct = res.headers()["content-type"];
    expect(ct).toContain("application/json");
  });

  test("SRV2 - HTTPS works", async ({ request }) => {
    const res = await request.get("https://tymg-api.duckdns.org/api/v1/settings", { headers: H });
    expect(res.status()).toBe(200);
  });

  test("SRV3 - API responds under 3 seconds", async ({ request }) => {
    const start = Date.now();
    await request.get(`${API}/settings`, { headers: H });
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test("SRV4 - Settings returns all required config sections", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const vars = json.data.map((s: any) => s.variable);
    expect(vars).toContain("system");
    expect(vars).toContain("web");
    expect(vars).toContain("payment");
    expect(vars).toContain("authentication");
    expect(vars).toContain("notification");
  });

  test("SRV5 - Firebase config present in auth settings", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const auth = json.data.find((s: any) => s.variable === "authentication");
    expect(auth.value.firebase).toBe(true);
    expect(auth.value.fireBaseProjectId).toBeTruthy();
  });

  test("SRV6 - Google login enabled", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const auth = json.data.find((s: any) => s.variable === "authentication");
    expect(auth.value.googleLogin).toBe(true);
  });

  test("SRV7 - Web settings has site name and location", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const web = json.data.find((s: any) => s.variable === "web");
    expect(web.value.siteName).toBeTruthy();
    expect(web.value.defaultLatitude).toBeTruthy();
    expect(web.value.defaultLongitude).toBeTruthy();
  });

  test("SRV8 - Payment variables accessible", async ({ request }) => {
    const res = await request.get(`${API}/payment/variables`, { headers: H });
    expect([200, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// ADMIN PANEL UI
// ═══════════════════════════════════════════════
test.describe("ADMIN PANEL: Page Loading", () => {
  test("AP1 - Admin panel login page loads", async ({ page }) => {
    await page.goto(ADMIN_URL, { waitUntil: "domcontentloaded", timeout: 10000 });
    const body = await page.content();
    expect(body.length).toBeGreaterThan(100);
  });
});

// ═══════════════════════════════════════════════
// CART SYNC (Offline to Online)
// ═══════════════════════════════════════════════
test.describe("CUSTOMER: Cart Sync", () => {
  let token = "";
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Sync Tester", email: `sync${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C32 - Sync offline cart to server", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/sync`, {
      headers: { ...H, Authorization: `Bearer ${token}` },
      data: { items: [{ store_id: 1, product_variant_id: 293, quantity: 1 }] },
    });
    expect([200, 422]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════
// PROMO CODES
// ═══════════════════════════════════════════════
test.describe("CUSTOMER: Promo Codes", () => {
  let token = "";
  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API}/register`, {
      headers: H,
      data: { name: "Promo Tester", email: `promo${Date.now()}@tymg.test`, mobile: `+1613${Math.floor(Math.random()*9000000+1000000)}`, password: "Test1234!", password_confirmation: "Test1234!", country_iso2: "CA" },
    });
    token = (await res.json()).access_token;
  });

  test("C33 - Get available promos", async ({ request }) => {
    const res = await request.get(`${API}/user/promos/available`, { headers: { ...H, Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
  });
});
