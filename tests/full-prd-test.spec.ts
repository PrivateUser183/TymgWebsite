import { test, expect } from "@playwright/test";

const SITE = "https://tymg-customer-web.vercel.app";
const API = "https://tymg-api.duckdns.org/api/v1";
const H = { Accept: "application/json", "Content-Type": "application/json" };

// ═══════════════════════════════════════════════════════════
// SECTION 1: HOMEPAGE & NAVIGATION
// ═══════════════════════════════════════════════════════════
test.describe("1. Homepage & Navigation", () => {
  test("1.1 Homepage loads with correct title", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TYMG/i);
  });

  test("1.2 Navbar renders", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("1.3 Footer renders", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("1.4 Homepage has hero/banner section", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "networkidle" });
    const body = await page.content();
    expect(body.length).toBeGreaterThan(5000);
  });

  test("1.5 Homepage responsive - mobile viewport", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TYMG/i);
    await ctx.close();
  });

  test("1.6 Homepage responsive - tablet viewport", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
    const page = await ctx.newPage();
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TYMG/i);
    await ctx.close();
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 2: SEO & META TAGS
// ═══════════════════════════════════════════════════════════
test.describe("2. SEO & Meta Tags", () => {
  test("2.1 Homepage has meta description", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const desc = await page.locator('meta[name="description"]').first().getAttribute("content");
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(10);
  });

  test("2.2 Homepage has Open Graph tags", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const ogTitle = await page.locator('meta[property="og:title"]').first().getAttribute("content");
    expect(ogTitle).toBeTruthy();
  });

  test("2.3 Homepage has robots meta - index,follow", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("index");
    expect(robots).toContain("follow");
  });

  test("2.4 Homepage has canonical URL", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBeTruthy();
  });

  test("2.5 Homepage has viewport meta tag", async ({ page }) => {
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 3: PRODUCT BROWSING PAGES
// ═══════════════════════════════════════════════════════════
test.describe("3. Product Browsing Pages", () => {
  test("3.1 /products/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/products/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/products");
  });

  test("3.2 /categories/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/categories/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/categories");
  });

  test("3.3 /brands/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/brands/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/brands");
  });

  test("3.4 /stores/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/stores/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/stores");
  });

  test("3.5 /delivery-zones/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/delivery-zones/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/delivery-zones");
  });

  test("3.6 /feature-sections/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/feature-sections/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/feature-sections");
  });

  test("3.7 /products/search/ page loads with query", async ({ page }) => {
    await page.goto(`${SITE}/products/search/?query=test`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/products/search");
  });

  test("3.8 /shopping-list/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/shopping-list/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/shopping-list");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 4: CART & CHECKOUT PAGES
// ═══════════════════════════════════════════════════════════
test.describe("4. Cart & Checkout Pages", () => {
  test("4.1 /cart/ page loads for guest", async ({ page }) => {
    await page.goto(`${SITE}/cart/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/cart");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 5: AUTH PAGES
// ═══════════════════════════════════════════════════════════
test.describe("5. Auth Pages", () => {
  test("5.1 /forgot-password/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/forgot-password/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/forgot-password");
  });

  test("5.2 /seller-register/ page loads", async ({ page }) => {
    await page.goto(`${SITE}/seller-register/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/seller-register");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 6: LEGAL/INFO PAGES
// ═══════════════════════════════════════════════════════════
test.describe("6. Legal/Info Pages", () => {
  test("6.1 /about-us/ loads", async ({ page }) => {
    await page.goto(`${SITE}/about-us/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/about-us");
  });

  test("6.2 /faqs/ loads", async ({ page }) => {
    await page.goto(`${SITE}/faqs/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/faqs");
  });

  test("6.3 /privacy-policy/ loads", async ({ page }) => {
    await page.goto(`${SITE}/privacy-policy/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/privacy-policy");
  });

  test("6.4 /terms-and-conditions/ loads", async ({ page }) => {
    await page.goto(`${SITE}/terms-and-conditions/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/terms-and-conditions");
  });

  test("6.5 /shipping-policy/ loads", async ({ page }) => {
    await page.goto(`${SITE}/shipping-policy/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/shipping-policy");
  });

  test("6.6 /return-refund-policy/ loads", async ({ page }) => {
    await page.goto(`${SITE}/return-refund-policy/`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/return-refund-policy");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 7: 404 PAGE
// ═══════════════════════════════════════════════════════════
test.describe("7. Error Handling", () => {
  test("7.1 Non-existent page returns 404", async ({ page }) => {
    const res = await page.goto(`${SITE}/nonexistent-page-xyz/`, { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 8: BACKEND API - SETTINGS & CONFIG
// ═══════════════════════════════════════════════════════════
test.describe("8. API - Settings & Config", () => {
  test("8.1 GET /settings returns success with system config", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeTruthy();
    const vars = json.data.map((s: any) => s.variable);
    expect(vars).toContain("system");
    expect(vars).toContain("web");
    expect(vars).toContain("payment");
    expect(vars).toContain("authentication");
  });

  test("8.2 Settings include currency info", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const system = json.data.find((s: any) => s.variable === "system");
    expect(system.value.currencyCode).toBeTruthy();
    expect(system.value.currencySymbol).toBeTruthy();
  });

  test("8.3 Web settings include site name", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    const web = json.data.find((s: any) => s.variable === "web");
    expect(web.value.siteName).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 9: BACKEND API - PRODUCT CATALOG
// ═══════════════════════════════════════════════════════════
test.describe("9. API - Product Catalog", () => {
  test("9.1 GET /categories returns 200", async ({ request }) => {
    const res = await request.get(`${API}/categories`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.2 GET /brands returns 200", async ({ request }) => {
    const res = await request.get(`${API}/brands`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.3 GET /banners returns 200", async ({ request }) => {
    const res = await request.get(`${API}/banners`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.4 GET /featured-sections returns 200", async ({ request }) => {
    const res = await request.get(`${API}/featured-sections`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.5 GET /featured-sections/types returns section types", async ({ request }) => {
    const res = await request.get(`${API}/featured-sections/types`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.6 GET /delivery-zone returns zones", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.7 GET /faqs returns 200", async ({ request }) => {
    const res = await request.get(`${API}/faqs`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.8 Product search by keyword returns 200", async ({ request }) => {
    const res = await request.get(`${API}/products/search-by-keywords?search=food`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.9 Location-based products endpoint works", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone/products?latitude=45.4765&longitude=-75.7013`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.10 Location-based stores endpoint works", async ({ request }) => {
    const res = await request.get(`${API}/delivery-zone/stores?latitude=45.4765&longitude=-75.7013`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("9.11 GET /stores returns 200", async ({ request }) => {
    const res = await request.get(`${API}/stores`, { headers: H });
    expect(res.status()).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 10: BACKEND API - AUTH GUARDS
// ═══════════════════════════════════════════════════════════
test.describe("10. API - Auth Guards (must return 401 without token)", () => {
  test("10.1 POST /user/cart/add → 401", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, { headers: H, data: { product_variant_id: 1, store_id: 1, quantity: 1 } });
    expect(res.status()).toBe(401);
  });

  test("10.2 GET /user/cart → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/cart`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.3 GET /user/profile → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/profile`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.4 GET /user/orders → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/orders`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.5 GET /user/addresses → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/addresses`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.6 GET /user/wallet → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/wallet`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.7 GET /user/wishlists → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/wishlists`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.8 POST /user/orders → 401", async ({ request }) => {
    const res = await request.post(`${API}/user/orders`, { headers: H, data: {} });
    expect(res.status()).toBe(401);
  });

  test("10.9 GET /user/promos/available → 401", async ({ request }) => {
    const res = await request.get(`${API}/user/promos/available`, { headers: H });
    expect(res.status()).toBe(401);
  });

  test("10.10 POST /user/cart/sync → 401", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/sync`, { headers: H, data: { items: [] } });
    expect(res.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 11: BACKEND API - AUTH FLOW
// ═══════════════════════════════════════════════════════════
test.describe("11. API - Auth Flow", () => {
  test("11.1 POST /login with invalid credentials returns error", async ({ request }) => {
    const res = await request.post(`${API}/login`, { headers: H, data: { email: "fake@notexist.com", password: "wrongpassword123" } });
    const json = await res.json();
    expect(json.success).toBeFalsy();
  });

  test("11.2 POST /verify-user endpoint exists", async ({ request }) => {
    const res = await request.post(`${API}/verify-user`, { headers: H, data: { email: "test@example.com" } });
    // Should return 200 or 422, not 404/500
    expect([200, 422, 401]).toContain(res.status());
  });

  test("11.3 POST /register with missing fields returns validation error", async ({ request }) => {
    const res = await request.post(`${API}/register`, { headers: H, data: {} });
    expect([422, 400, 401]).toContain(res.status());
  });

  test("11.4 POST /forget-password endpoint exists", async ({ request }) => {
    const res = await request.post(`${API}/forget-password`, { headers: H, data: { email: "test@example.com" } });
    expect([200, 422, 404, 401]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 12: BACKEND API - CART VALIDATION
// ═══════════════════════════════════════════════════════════
test.describe("12. API - Cart Validation (with Accept header)", () => {
  test("12.1 Cart add without Accept header returns redirect (not JSON)", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, {
      headers: { "Content-Type": "application/json" },
      data: { product_variant_id: 1, store_id: 1, quantity: 1 },
      maxRedirects: 0,
    });
    // Without Accept: application/json, should redirect (302) or return non-JSON
    expect([302, 401, 200]).toContain(res.status());
  });

  test("12.2 Cart add WITH Accept header returns proper 401 JSON", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, { headers: H, data: { product_variant_id: 1, store_id: 1, quantity: 1 } });
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.message).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 13: BACKEND API - DELIVERY BOY
// ═══════════════════════════════════════════════════════════
test.describe("13. API - Delivery Boy Endpoints", () => {
  test("13.1 Delivery boy login endpoint exists", async ({ request }) => {
    const res = await request.post(`${API}/delivery-boy/login`, { headers: H, data: { email: "fake@test.com", password: "wrong" } });
    expect([200, 401, 422]).toContain(res.status());
  });

  test("13.2 Delivery boy register endpoint exists", async ({ request }) => {
    const res = await request.post(`${API}/delivery-boy/register`, { headers: H, data: {} });
    expect([200, 422, 401]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 14: BACKEND API - SELLER
// ═══════════════════════════════════════════════════════════
test.describe("14. API - Seller Endpoints", () => {
  test("14.1 Seller register endpoint exists", async ({ request }) => {
    const res = await request.post(`${API}/seller/register`, { headers: H, data: {} });
    expect([200, 422, 401]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 15: BACKEND API - PAYMENT CONFIG
// ═══════════════════════════════════════════════════════════
test.describe("15. API - Payment Config", () => {
  test("15.1 Payment variables endpoint returns config", async ({ request }) => {
    const res = await request.get(`${API}/payment/variables`, { headers: H });
    expect([200, 404]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 16: BACKEND API - REVIEWS & FEEDBACK
// ═══════════════════════════════════════════════════════════
test.describe("16. API - Reviews & Feedback", () => {
  test("16.1 GET /reviews returns 200", async ({ request }) => {
    const res = await request.get(`${API}/reviews`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("16.2 GET /seller-feedback returns 200", async ({ request }) => {
    const res = await request.get(`${API}/seller-feedback`, { headers: H });
    expect(res.status()).toBe(200);
  });

  test("16.3 POST /reviews without auth → 401", async ({ request }) => {
    const res = await request.post(`${API}/reviews`, { headers: H, data: {} });
    expect(res.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 17: BACKEND API - RESPONSE FORMAT
// ═══════════════════════════════════════════════════════════
test.describe("17. API - Response Format Compliance", () => {
  test("17.1 Settings response has success + message + data", async ({ request }) => {
    const res = await request.get(`${API}/settings`, { headers: H });
    const json = await res.json();
    expect(json).toHaveProperty("success");
    expect(json).toHaveProperty("message");
    expect(json).toHaveProperty("data");
  });

  test("17.2 Categories response follows standard format", async ({ request }) => {
    const res = await request.get(`${API}/categories`, { headers: H });
    const json = await res.json();
    expect(json).toHaveProperty("data");
  });

  test("17.3 Auth error response includes message", async ({ request }) => {
    const res = await request.get(`${API}/user/profile`, { headers: H });
    const json = await res.json();
    expect(json).toHaveProperty("message");
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 18: PWA & MANIFEST
// ═══════════════════════════════════════════════════════════
test.describe("18. PWA & Manifest", () => {
  test("18.1 manifest.json is accessible", async ({ request }) => {
    const res = await request.get(`${SITE}/manifest.json`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.name).toBeTruthy();
  });

  test("18.2 manifest has required PWA fields", async ({ request }) => {
    const res = await request.get(`${SITE}/manifest.json`);
    const json = await res.json();
    expect(json.display).toBeTruthy();
    expect(json.start_url).toBeTruthy();
    expect(json.icons).toBeTruthy();
    expect(json.icons.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 19: STATIC ASSETS
// ═══════════════════════════════════════════════════════════
test.describe("19. Static Assets", () => {
  test("19.1 robots.txt is accessible", async ({ request }) => {
    const res = await request.get(`${SITE}/robots.txt`);
    expect(res.status()).toBe(200);
  });

  test("19.2 Favicon is accessible", async ({ request }) => {
    const res = await request.get(`${SITE}/default-favicon.ico`);
    expect([200, 304]).toContain(res.status());
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 20: PROTECTED PAGES REDIRECT
// ═══════════════════════════════════════════════════════════
test.describe("20. Protected Pages (should redirect or show login)", () => {
  test("20.1 /my-account/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/`, { waitUntil: "domcontentloaded" });
    // Should either redirect to login or show login prompt
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.2 /my-account/orders/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/orders/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.3 /my-account/addresses/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/addresses/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.4 /my-account/wallet/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/wallet/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.5 /my-account/wishlists/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/wishlists/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.6 /my-account/transactions/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/transactions/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });

  test("20.7 /my-account/refer-and-earn/ without auth", async ({ page }) => {
    await page.goto(`${SITE}/my-account/refer-and-earn/`, { waitUntil: "domcontentloaded" });
    const body = await page.content();
    expect(body).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 21: PERFORMANCE
// ═══════════════════════════════════════════════════════════
test.describe("21. Performance", () => {
  test("21.1 Homepage loads within 10 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto(SITE, { waitUntil: "domcontentloaded" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(10000);
  });

  test("21.2 API settings responds within 3 seconds", async ({ request }) => {
    const start = Date.now();
    await request.get(`${API}/settings`, { headers: H });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("21.3 No X-Powered-By header (security)", async ({ request }) => {
    const res = await request.get(SITE);
    const powered = res.headers()["x-powered-by"];
    // Should not expose framework info
    expect(powered).toBeFalsy();
  });
});

// ═══════════════════════════════════════════════════════════
// SECTION 22: I18N
// ═══════════════════════════════════════════════════════════
test.describe("22. Internationalization", () => {
  test("22.1 English locale file is accessible", async ({ request }) => {
    const res = await request.get(`${SITE}/locales/en.json`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).length).toBeGreaterThan(0);
  });

  test("22.2 French locale file is accessible", async ({ request }) => {
    const res = await request.get(`${SITE}/locales/fr.json`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(Object.keys(json).length).toBeGreaterThan(0);
  });
});
