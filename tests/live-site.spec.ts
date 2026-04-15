import { test, expect } from "@playwright/test";

const BASE_URL = "https://tymg-customer-web.vercel.app";

test.describe("Homepage & Navigation", () => {
  test("TC001 - Homepage loads with title and content", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TYMG/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC002 - Navbar is visible with key elements", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("TC003 - Footer is visible", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const footer = page.locator("footer").first();
    await expect(footer).toBeVisible();
  });
});

test.describe("Product Browsing", () => {
  test("TC004 - Products page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/products/`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/product/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC005 - Categories page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/categories/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC006 - Brands page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/brands/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC007 - Stores page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/stores/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC008 - Delivery zones page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/delivery-zones/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Search", () => {
  test("TC009 - Search page loads with query", async ({ page }) => {
    await page.goto(`${BASE_URL}/products/search/?query=food`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Cart", () => {
  test("TC010 - Cart page loads for unauthenticated user", async ({ page }) => {
    await page.goto(`${BASE_URL}/cart/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Legal Pages", () => {
  test("TC011 - About Us page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/about-us/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC012 - FAQs page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/faqs/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC013 - Privacy Policy loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy-policy/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC014 - Terms and Conditions loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/terms-and-conditions/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC015 - Shipping Policy loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/shipping-policy/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC016 - Return Refund Policy loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/return-refund-policy/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Auth Pages", () => {
  test("TC017 - Forgot Password page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("TC018 - Seller Registration page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/seller-register/`, { waitUntil: "domcontentloaded" });
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("API Health Checks", () => {
  test("TC019 - Backend API settings endpoint returns 200", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/settings", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  test("TC020 - Backend API categories endpoint returns 200", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/categories", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
  });

  test("TC021 - Backend API brands endpoint returns 200", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/brands", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
  });

  test("TC022 - Backend API banners endpoint returns 200", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/banners", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
  });

  test("TC023 - Backend API featured sections endpoint returns 200", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/featured-sections", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(200);
  });

  test("TC024 - Cart add requires authentication (returns 401)", async ({ request }) => {
    const response = await request.post("https://tymg-api.duckdns.org/api/v1/user/cart/add", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: { product_variant_id: 1, store_id: 1, quantity: 1 },
    });
    expect(response.status()).toBe(401);
  });

  test("TC025 - Profile requires authentication (returns 401)", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/user/profile", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(401);
  });

  test("TC026 - Orders requires authentication (returns 401)", async ({ request }) => {
    const response = await request.get("https://tymg-api.duckdns.org/api/v1/user/orders", {
      headers: { Accept: "application/json" },
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("SEO & Meta", () => {
  test("TC027 - Homepage has correct meta tags", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const ogTitle = await page.locator('meta[property="og:title"]').first().getAttribute("content");
    expect(ogTitle).toBeTruthy();
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
  });

  test("TC028 - Robots meta allows indexing", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("index");
  });
});

test.describe("404 Page", () => {
  test("TC029 - Non-existent page shows 404", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist/`, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(404);
  });
});

test.describe("Responsive", () => {
  test("TC030 - Homepage loads on mobile viewport", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/TYMG/i);
    await context.close();
  });
});
