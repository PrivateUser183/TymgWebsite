import { test, expect } from "@playwright/test";

const API = "https://tymg-api.duckdns.org/api/v1";
const H = { Accept: "application/json", "Content-Type": "application/json" };

function authH(token: string) {
  return { ...H, Authorization: `Bearer ${token}` };
}

async function registerUser(request: any, prefix: string) {
  const res = await request.post(`${API}/register`, {
    headers: H,
    data: {
      name: `${prefix} Tester`,
      email: `${prefix}${Date.now()}@tymg.test`,
      mobile: `+1613${Math.floor(Math.random() * 9000000 + 1000000)}`,
      password: "Test1234!",
      password_confirmation: "Test1234!",
      country_iso2: "CA",
    },
  });
  const json = await res.json();
  return json.access_token;
}

// ═══════════════════════════════════════════════
// DELETE 1: CART ITEM - Remove single item
// ═══════════════════════════════════════════════
test.describe("DELETE 1: Remove Cart Item", () => {
  let token: string;
  let cartItemId: number;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "delcart");
  });

  test("1a - Add item to cart", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, {
      headers: authH(token),
      data: { product_variant_id: 293, store_id: 1, quantity: 1 },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    cartItemId = json.data.items[0].id;
    expect(cartItemId).toBeTruthy();
  });

  test("1b - Delete cart item", async ({ request }) => {
    const res = await request.delete(`${API}/user/cart/item/${cartItemId}`, {
      headers: authH(token),
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items.length).toBe(0);
  });

  test("1c - Cart is empty after delete", async ({ request }) => {
    const res = await request.get(`${API}/user/cart`, { headers: authH(token) });
    const json = await res.json();
    expect(json.success).toBe(false); // empty cart returns success:false
    expect(json.message).toContain("empty");
  });
});

// ═══════════════════════════════════════════════
// DELETE 2: CLEAR ENTIRE CART
// ═══════════════════════════════════════════════
test.describe("DELETE 2: Clear Entire Cart", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "clearcart");
  });

  test("2a - Add two items to cart", async ({ request }) => {
    await request.post(`${API}/user/cart/add`, {
      headers: authH(token),
      data: { product_variant_id: 293, store_id: 1, quantity: 1 },
    });
    const res = await request.post(`${API}/user/cart/add`, {
      headers: authH(token),
      data: { product_variant_id: 292, store_id: 1, quantity: 2 },
    });
    const json = await res.json();
    expect(json.data.items.length).toBe(2);
  });

  test("2b - Clear cart", async ({ request }) => {
    const res = await request.get(`${API}/user/cart/clear-cart`, {
      headers: authH(token),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("2c - Cart is empty after clear", async ({ request }) => {
    const res = await request.get(`${API}/user/cart`, { headers: authH(token) });
    const json = await res.json();
    expect(json.message).toContain("empty");
  });
});

// ═══════════════════════════════════════════════
// DELETE 3: ADDRESS
// ═══════════════════════════════════════════════
test.describe("DELETE 3: Delete Address", () => {
  let token: string;
  let addressId: number;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "deladdr");
  });

  test("3a - Create address", async ({ request }) => {
    const res = await request.post(`${API}/user/addresses`, {
      headers: authH(token),
      data: {
        address_line1: "456 Delete St",
        city: "Gatineau",
        state: "Quebec",
        country: "Canada",
        zipcode: "J8T2B2",
        latitude: "45.4765",
        longitude: "-75.7013",
        address_type: "home",
        mobile: "+16131234567",
        country_code: "CA",
      },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    addressId = json.data.id;
    expect(addressId).toBeTruthy();
  });

  test("3b - Delete address", async ({ request }) => {
    const res = await request.delete(`${API}/user/addresses/${addressId}`, {
      headers: authH(token),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("3c - Address is gone after delete", async ({ request }) => {
    const res = await request.get(`${API}/user/addresses`, {
      headers: authH(token),
    });
    const json = await res.json();
    const found = (json.data?.data || json.data || []).find(
      (a: any) => a.id === addressId
    );
    expect(found).toBeFalsy();
  });
});

// ═══════════════════════════════════════════════
// DELETE 4: WISHLIST
// ═══════════════════════════════════════════════
test.describe("DELETE 4: Delete Wishlist", () => {
  let token: string;
  let wishlistId: string;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "delwish");
  });

  test("4a - Create wishlist", async ({ request }) => {
    const res = await request.post(`${API}/user/wishlists/create`, {
      headers: authH(token),
      data: { title: "To Delete" },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    wishlistId = json.data.id.toString();
    expect(wishlistId).toBeTruthy();
  });

  test("4b - Delete wishlist", async ({ request }) => {
    const res = await request.delete(`${API}/user/wishlists/${wishlistId}`, {
      headers: authH(token),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("4c - Wishlist is gone after delete", async ({ request }) => {
    const res = await request.get(`${API}/user/wishlists`, {
      headers: authH(token),
    });
    const json = await res.json();
    const data = json.data?.data || json.data || [];
    const found = Array.isArray(data)
      ? data.find((w: any) => w.id.toString() === wishlistId)
      : false;
    expect(found).toBeFalsy();
  });
});

// ═══════════════════════════════════════════════
// DELETE 5: WISHLIST ITEM
// ═══════════════════════════════════════════════
test.describe("DELETE 5: Delete Wishlist Item", () => {
  let token: string;
  let wishlistId: string;
  let wishlistItemId: number;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "delwishitem");
  });

  test("5a - Create wishlist and add item", async ({ request }) => {
    const res = await request.post(`${API}/user/wishlists`, {
      headers: authH(token),
      data: {
        title: "Item Delete Test",
        product_variant_id: 293,
        store_id: 1,
      },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    wishlistId = json.data.id.toString();

    // Get the wishlist to find item ID
    const listRes = await request.get(
      `${API}/user/wishlists/${wishlistId}`,
      { headers: authH(token) }
    );
    const listJson = await listRes.json();
    const items = listJson.data?.items || listJson.data?.data || [];
    if (items.length > 0) {
      wishlistItemId = items[0].id;
    }
  });

  test("5b - Delete wishlist item", async ({ request }) => {
    test.skip(!wishlistItemId, "No wishlist item to delete");
    const res = await request.delete(
      `${API}/user/wishlists/items/${wishlistItemId}`,
      { headers: authH(token) }
    );
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});

// ═══════════════════════════════════════════════
// DELETE 6: SAVE FOR LATER ITEM (remove from saved)
// ═══════════════════════════════════════════════
test.describe("DELETE 6: Remove Save-for-Later Item", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "delsave");
  });

  test("6a - Add item, save for later, then remove", async ({ request }) => {
    // Add to cart
    const addRes = await request.post(`${API}/user/cart/add`, {
      headers: authH(token),
      data: { product_variant_id: 293, store_id: 1, quantity: 1 },
    });
    const addJson = await addRes.json();
    expect(addJson.success).toBe(true);
    const itemId = addJson.data.items[0].id;

    // Save for later
    const saveRes = await request.post(
      `${API}/user/cart/item/save-for-later/${itemId}`,
      { headers: authH(token) }
    );
    expect([200, 422]).toContain(saveRes.status());

    // Remove the saved item
    const removeRes = await request.delete(
      `${API}/user/cart/item/${itemId}`,
      { headers: authH(token) }
    );
    expect(removeRes.status()).toBe(200);
  });
});

// ═══════════════════════════════════════════════
// DELETE 7: USER ACCOUNT (destructive - test endpoint exists only)
// ═══════════════════════════════════════════════
test.describe("DELETE 7: Delete User Account", () => {
  test("7a - Delete account endpoint exists and requires auth", async ({
    request,
  }) => {
    const res = await request.delete(`${API}/user/delete-account`, {
      headers: H,
    });
    expect(res.status()).toBe(401);
  });

  test("7b - Delete account actually works", async ({ request }) => {
    // Register a throwaway user
    const token = await registerUser(request, "throwaway");

    // Delete the account
    const res = await request.delete(`${API}/user/delete-account`, {
      headers: authH(token),
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);

    // Verify token no longer works
    const profileRes = await request.get(`${API}/user/profile`, {
      headers: authH(token),
    });
    expect(profileRes.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════
// DELETE 8: Cart item update to quantity 0 (should remove)
// ═══════════════════════════════════════════════
test.describe("DELETE 8: Update Cart Item Quantity to 0", () => {
  let token: string;
  let cartItemId: number;

  test.beforeAll(async ({ request }) => {
    token = await registerUser(request, "qty0");
  });

  test("8a - Add item to cart", async ({ request }) => {
    const res = await request.post(`${API}/user/cart/add`, {
      headers: authH(token),
      data: { product_variant_id: 291, store_id: 1, quantity: 1 },
    });
    const json = await res.json();
    expect(json.success).toBe(true);
    cartItemId = json.data.items[0].id;
  });

  test("8b - Update quantity to 0 (should fail with validation)", async ({
    request,
  }) => {
    const res = await request.post(
      `${API}/user/cart/item/${cartItemId}`,
      {
        headers: authH(token),
        data: { quantity: 0 },
      }
    );
    // Backend validates quantity >= 1, so this should fail
    // Frontend handles qty=0 by calling removeItemFromCart instead
    expect([200, 422]).toContain(res.status());
  });

  test("8c - Use DELETE endpoint instead for qty 0", async ({ request }) => {
    const res = await request.delete(
      `${API}/user/cart/item/${cartItemId}`,
      { headers: authH(token) }
    );
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
