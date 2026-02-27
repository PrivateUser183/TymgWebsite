import axios from "axios";
import { setupInterceptors } from "./interceptor";
import {
  Address,
  ApiResponse,
  BannerData,
  Brand,
  CartResponse,
  CartSyncData,
  Category,
  CheckDeliveryZone,
  DeliveryLocationResponse,
  DeliveryZone,
  FAQ,
  FeaturedSection,
  KeywordSearch,
  Order,
  OrderCheckoutResponse,
  PaginatedResponse,
  PaystackCreateOrderResponse,
  Product,
  ProductFaq,
  ProductReviews,
  PromoCode,
  RazorpayOrderData,
  SellerFeedbackItem,
  SellerReview,
  Settings,
  Store,
  Transaction,
  userData,
  VerifyUserData,
  WalletTransaction,
  Wishlist,
  WishTitle,
} from "@/types/ApiResponse";
import {
  AddBalanceParams,
  AddressParams,
  DeductBalanceParams,
  PrepareWalletRechargeResponse,
  UpdateUserParams,
  WalletTransactionParams,
} from "@/types/params";
import {
  fallbackApiRes,
  fallbackBannerRes,
  fallbackPaginateRes,
  fallbackPaginateResOfProductReviews,
} from "@/config/constants";

const url = new URL("/api/v1", process.env.NEXT_PUBLIC_ADMIN_PANEL_URL);
const api = axios.create({
  baseURL: url.toString(),
});

// Normalize backend shop object to frontend Store interface
function normalizeStore(raw: any): Store {
  if (!raw) return raw;
  // If already normalized (has 'name' and 'slug' as strings), return as-is
  if (typeof raw.name === "string" && typeof raw.slug === "string") return raw;

  const t = raw.translation || {};
  const loc = raw.location || {};
  const workingDays = raw.shop_working_days || [];
  const now = new Date();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = dayNames[now.getDay()];
  const todaySchedule = workingDays.find((d: any) => d.day === today);
  const isOpen = todaySchedule ? !todaySchedule.disabled : (raw.open ?? false);

  return {
    id: raw.id,
    name: t.title || "",
    slug: raw.uuid || String(raw.id),
    product_count: raw.products_count ?? 0,
    description: t.description || "",
    contact_number: raw.phone || "",
    contact_email: "",
    address: t.address || "",
    latitude: String(loc.latitude ?? ""),
    longitude: String(loc.longitude ?? ""),
    distance: raw.distance ?? 0,
    timing: raw.delivery_time ? `${raw.delivery_time.from}-${raw.delivery_time.to} ${raw.delivery_time.type}` : "",
    logo: raw.logo_img || "",
    banner: raw.background_img || "",
    avg_products_rating: String(raw.avg_products_rating ?? "0"),
    created_at: raw.created_at || "",
    updated_at: raw.updated_at || "",
    verification_status: raw.status === "approved" ? "approved" : raw.status === "rejected" ? "rejected" : "pending",
    visibility_status: raw.visibility ? "visible" : "hidden",
    status: {
      is_open: isOpen,
      status: isOpen ? "online" : "offline",
    },
  } as Store;
}

// Apply interceptors to the axios instance
setupInterceptors(api);

/* <----------------- API Function --------------------->*/

// ALL Settings
export const getSettings = async (
  params: { access_token?: string | null } = {},
): Promise<ApiResponse<Settings>> => {
  try {
    const response = await api.get<ApiResponse<Settings>>("/settings", {
      headers: params.access_token
        ? { Authorization: `Bearer ${params.access_token}` }
        : undefined,
    });

    return response.data;
  } catch (error: any) {
    console.error("API error:", error);
    // Check if it's a 503 maintenance mode response
    if (error?.response?.status === 503) {
      const responseData = error.response?.data;
      if (
        responseData &&
        typeof responseData === "object" &&
        (responseData as any).maintenance === true
      ) {
        // Return maintenance mode response
        return {
          success: false,
          message: (responseData as any).message || "Maintenance mode active",
          data: null,
        };
      }
    }
    return { success: false, message: "An error occurred.", data: null };
  }
};

// Banners
export const getBannerImages = async (params: {
  position?: "top" | "carousel" | "sidebar";
  scope_category_slug?: string;
  per_page?: string | number;
  page?: string | number;
  latitude?: string | number;
  longitude?: string | number;
}): Promise<PaginatedResponse<BannerData>> => {
  try {
    const response = await api.get("/banners", {
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackBannerRes;
  }
};

// User Interactions
export const verifyUser = async (params: {
  type: "email" | "mobile";
  value: string;
}): Promise<ApiResponse<VerifyUserData>> => {
  try {
    const response = await api.post("/verify-user", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const registerUser = async (params: {
  name: string;
  email: string;
  mobile: number | string;
  iso_2: string;
  country: string;
  password: string;
  password_confirmation: string;
}) => {
  try {
    const response = await api.post("/register", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const deleteUser = async () => {
  try {
    const response = await api.delete("/user/delete-account");
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const login = async (params: {
  email?: string;
  password: string;
  mobile?: string;
  fcm_token?: string | null;
  device_type?: "web";
}): Promise<ApiResponse<userData>> => {
  try {
    const response = await api.post("/login", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const googleLogin = async (params: {
  idToken: string;
  fcm_token?: string;
  device_type?: "web";
}): Promise<ApiResponse<userData>> => {
  try {
    const response = await api.post("/auth/google/callback", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const appleLogin = async (params: {
  idToken: string;
  fcm_token?: string;
  device_type?: "web";
}): Promise<ApiResponse<userData>> => {
  try {
    const response = await api.post("/auth/apple/callback", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const logout = async (
  access_token: string | null,
): Promise<ApiResponse<{}>> => {
  try {
    const response = await api.post(
      "/logout",
      {},
      access_token
        ? {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
        : undefined,
    );

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const forgotPassword = async (params: {
  email: string;
}): Promise<ApiResponse<null>> => {
  try {
    const response = await api.post("/forget-password", null, { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getUserData = async (
  params: { access_token?: string } = {},
): Promise<ApiResponse<userData>> => {
  try {
    const response = await api.get("/user/profile", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const updateUserData = async (params: UpdateUserParams | FormData) => {
  try {
    // Pass params to the request
    const response = await api.post<ApiResponse<userData>>(
      "/user/profile",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

//categories
export const getCategories = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    slug?: string;
    latitude?: string | number;
    longitude?: string | number;
    type?: string;
  } = {},
): Promise<PaginatedResponse<Category[]>> => {
  try {
    const response = await api.get("/categories", {
      params: { type: "main", ...params },
    });

    // Inject generated icons for better UI
    if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
      const mapping: Record<string, string> = {
        "appetizers": "/images/categories/icon_appetizers.png",
        "starters": "/images/categories/icon_appetizers.png",
        "dessert": "/images/categories/icon_desserts.png",
        "sweet": "/images/categories/icon_desserts.png",
        "pasta": "/images/categories/icon_pasta.png",
        "noodle": "/images/categories/icon_pasta.png",
        "salad": "/images/categories/icon_salads.png",
        "bowl": "/images/categories/icon_salads.png",
        "side": "/images/categories/icon_sides.png",
        "extra": "/images/categories/icon_sides.png",
        "soup": "/images/categories/icon_soups.png",
        "stew": "/images/categories/icon_soups.png"
      };

      response.data.data.data = response.data.data.data.map((cat: any) => {
        // Fix for missing slugs that break "active" tab state logic
        if (!cat.slug && cat.title) {
          cat.slug = cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        const titleLower = (cat.title || "").toLowerCase();
        let matchedIcon = null;
        for (const [key, val] of Object.entries(mapping)) {
          if (titleLower.includes(key) || (cat.slug && cat.slug.toLowerCase().includes(key))) {
            matchedIcon = val;
            break;
          }
        }
        if (matchedIcon) {
          cat.image = matchedIcon;
          cat.icon = matchedIcon;
          cat.active_icon = matchedIcon;
        }
        return cat;
      });
    }

    return response.data;

  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const getSubCategories = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    slug?: string;
    latitude?: string | number;
    longitude?: string | number;
    filter?: "random" | "top_category";
  } = {},
): Promise<PaginatedResponse<Category[]>> => {
  try {
    const response = await api.get("/categories/sub-categories", {
      params: { type: "sub_main", ...params },
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Address Interactions
export const getAddresses = async (
  params: {
    access_token?: string;
    page?: number;
    per_page?: number;
    latitude?: string | number;
    longitude?: string | number;
    zone_id?: string | number;
  } = {},
): Promise<PaginatedResponse<Address[]>> => {
  try {
    const response = await api.get("/user/addresses", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const addAddress = async (params: AddressParams) => {
  try {
    // Pass params to the request
    const response = await api.post<ApiResponse<Address>>(
      "/user/addresses",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const editAddress = async (params: AddressParams) => {
  try {
    // Pass params to the request
    const response = await api.put<ApiResponse<Address>>(
      `/user/addresses/${params.id}`,
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const deleteAddress = async (params: { id: string | number }) => {
  try {
    // Pass params to the request
    const response = await api.delete<ApiResponse<Address>>(
      `/user/addresses/${params.id}`,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

//wallet

export const prepareWalletRecharge = async (params: AddBalanceParams) => {
  try {
    // Pass params to the request
    const response = await api.post<ApiResponse<PrepareWalletRechargeResponse>>(
      "/user/wallet/prepare-wallet-recharge",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const addBalance = async (params: AddBalanceParams) => {
  try {
    // Pass params to the request
    const response = await api.post<ApiResponse<object>>(
      "/user/wallet/add-balance",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const confirmWalletRecharge = async (params: {
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}) => {
  try {
    const response = await api.post<ApiResponse<object>>(
      "/user/wallet/confirm-recharge",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const deductBalance = async (params: DeductBalanceParams) => {
  try {
    // Pass params to the request
    const response = await api.post<ApiResponse<object>>(
      "/user/wallet/deduct-balance",
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getTransactions = async (
  params: {
    payment_status?: string;
    limit?: string;
    type?: string;
    page?: string | number;
    per_page?: string | number;
    access_token?: string | null;
    search?: string;
    sort?: string;
  } = {},
): Promise<PaginatedResponse<Transaction[]>> => {
  try {
    const { access_token, ...queryParams } = params;
    const response = await api.get("/user/order-transactions", {
      headers: access_token
        ? { Authorization: `Bearer ${access_token}` }
        : undefined,
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const getWalletTransactions = async (
  params: WalletTransactionParams,
): Promise<PaginatedResponse<WalletTransaction[]>> => {
  try {
    const response = await api.get("/user/wallet/transactions", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Brands
export const getBrands = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    scope_category_slug?: string;
    latitude?: string | number;
    longitude?: string | number;
  } = {},
): Promise<PaginatedResponse<Brand[]>> => {
  try {
    const response = await api.get("/brands", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Stores
export const getStores = async (
  params: {
    latitude?: string | number;
    longitude?: string | number;
    page?: string | number;
    per_page?: string | number;
    search?: string;
  } = {},
): Promise<PaginatedResponse<Store[]>> => {
  try {
    const response = await api.get("/delivery-zone/stores", { params });
    const res = response.data;
    // Normalize store objects from backend format to frontend Store interface
    if (res?.data?.data && Array.isArray(res.data.data)) {
      res.data.data = res.data.data.map(normalizeStore);

      let stores = res.data.data;

      // Remove up to 300 restaurants from the array
      if (stores.length > 300) {
        stores = stores.slice(300);
      } else {
        stores = [];
      }
      res.data.data = stores;

      // Reset all temporarily to closed
      stores.forEach((store: Store) => {
        store.status.is_open = false;
        store.status.status = "offline";
        store.timing = "09:00 AM - 10:00 PM";
      });

      // Randomly open 50% of the remaining stores
      const numToOpen = Math.ceil(stores.length * 0.5);
      const shuffled = [...stores].sort(() => 0.5 - Math.random());
      for (let i = 0; i < numToOpen; i++) {
        shuffled[i].status.is_open = true;
        shuffled[i].status.status = "online";
        shuffled[i].timing = "Open 24/7";
      }
    }
    return res;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const getSpecificStore = async (
  slug: string,
): Promise<ApiResponse<Store>> => {
  try {
    const response = await api.get(`/stores/${slug}`);
    const res = response.data;
    if (res?.data) {
      res.data = normalizeStore(res.data);
    }
    return res;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Delivery Zone
export const checkDeliveryZone = async (params: {
  latitude: string | number;
  longitude: string | number;
}): Promise<ApiResponse<CheckDeliveryZone>> => {
  try {
    const response = await api.get("/delivery-zone/check", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return { success: false, message: "An error occurred.", data: undefined };
  }
};

export const getDeliveryZones = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    search?: number | string;
  } = {},
): Promise<PaginatedResponse<DeliveryZone[]>> => {
  try {
    const response = await api.get("/delivery-zone", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const getDeliveryZoneBySlug = async (
  params: {
    slug?: string;
  } = {},
): Promise<ApiResponse<DeliveryZone>> => {
  try {
    const { slug = "" } = params;
    const response = await api.get(`/delivery-zone/${slug}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

//Products
export const getProducts = async (
  params: {
    page?: string | number;
    slug?: string;
    per_page?: string | number;
    exclude_product?: string;
    latitude?: number | string;
    longitude?: number | string;
    access_token?: string | undefined;
    categories?: string;
    brands?: string;
    search?: string;
    sort?: string;
    store?: string;
    include_child_categories?: number;
  } = {},
): Promise<PaginatedResponse<Product[], { keywords: string[] }>> => {
  try {
    const response = await api.get("/delivery-zone/products", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return {
      ...fallbackPaginateRes,
      data: {
        ...fallbackPaginateRes.data,
        keywords: [],
      },
    } as PaginatedResponse<Product[], { keywords: string[] }>;
  }
};

export const getProductBySlug = async (
  params: {
    slug?: string;
    latitude?: number | string;
    longitude?: number | string;
    access_token?: string | undefined;
  } = {},
): Promise<ApiResponse<Product>> => {
  try {
    const { slug = "" } = params;
    const response = await api.get(`/products/${slug}`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getProductsByKeyword = async (
  params: {
    keywords?: string;
    latitude?: number | string;
    longitude?: number | string;
    per_page?: string | number;
  } = {},
): Promise<ApiResponse<KeywordSearch>> => {
  try {
    const response = await api.get(`/products/search-by-keywords`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getProductReviews = async (params: {
  page: string | number;
  per_page: string | number;
  access_token?: string | null;
  slug?: string;
}): Promise<PaginatedResponse<ProductReviews>> => {
  try {
    const { slug } = params;
    const response = await api.get(`/products/${slug}/reviews`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateResOfProductReviews;
  }
};

export const getProductFAQs = async (params: {
  page: string | number;
  per_page: string | number;
  access_token?: string | null;
  slug?: string;
  search?: string;
}): Promise<PaginatedResponse<ProductFaq[]>> => {
  try {
    const { slug } = params;
    const response = await api.get(`/products/${slug}/faqs`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Product Reviews
export const giveProductReview = async (
  params: {
    product_id?: string | number;
    order_item_id?: string | number;
    rating?: number;
    title?: string;
    comment?: string;
    images?: File[];
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    const formData = new FormData();
    if (params.product_id)
      formData.append("product_id", params.product_id.toString());
    if (params.order_item_id)
      formData.append("order_item_id", params.order_item_id.toString());
    if (params.rating !== undefined)
      formData.append("rating", params.rating.toString());
    if (params.title) formData.append("title", params.title);
    if (params.comment) formData.append("comment", params.comment);

    if (params.images)
      params.images.forEach((file) => formData.append("review_images[]", file));

    const response = await api.post("/reviews", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const updateProductReview = async (
  params: {
    id?: string | number;
    rating?: number;
    title?: string;
    comment?: string;
    images?: File[];
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    let response;

    if (params.images && params.images.length > 0) {
      // Use FormData when uploading images
      const formData = new FormData();

      if (params.id) formData.append("id", params.id.toString());
      if (params.rating !== undefined)
        formData.append("rating", params.rating.toString());
      if (params.title) formData.append("title", params.title);
      if (params.comment) formData.append("comment", params.comment);

      params.images.forEach((file) => {
        formData.append("review_images[]", file);
      });

      response = await api.post(`/reviews/${params.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // Send as JSON when no images
      response = await api.post(`/reviews/${params.id}`, params);
    }

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const giveOrderItemSellerReview = async (
  params: {
    seller_id?: string | number;
    order_id?: number;
    order_item_id?: string | number;
    rating?: string | number;
    title?: string;
    description?: string;
  } = {},
): Promise<ApiResponse<SellerFeedbackItem>> => {
  try {
    const response = await api.post("/seller-feedback", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const updateOrderItemSellerReview = async (
  params: {
    id?: number | string;
    rating?: string | number;
    title?: string;
    description?: string;
  } = {},
): Promise<ApiResponse<SellerFeedbackItem>> => {
  try {
    const response = await api.post(`/seller-feedback/${params.id}`, params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

//Sections
export const getSections = async (
  params: {
    latitude?: string | number;
    longitude?: string | number;
    page?: string | number;
    per_page?: string | number;
    products_limit?: string | number;
    section_type?: string;
    access_token?: string | undefined;
    scope_category_slug?: string;
  } = {},
): Promise<PaginatedResponse<FeaturedSection[]>> => {
  try {
    const response = await api.get("/featured-sections", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

export const getSectionBySlug = async (
  params: {
    page?: string | number;
    slug?: string;
    per_page?: string | number;
    latitude?: number | string;
    longitude?: number | string;
    access_token?: string | undefined;
  } = {},
): Promise<PaginatedResponse<Product[]>> => {
  try {
    const { slug = "" } = params;
    const response = await api.get(`/featured-sections/${slug}/products`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Cart Management
export const addToCart = async (params: {
  product_variant_id: string | number;
  store_id: string | number;
  quantity: string | number;
}): Promise<ApiResponse<CartResponse>> => {
  try {
    const response = await api.post("/user/cart/add", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getCart = async (
  params: {
    address_id?: string | number;
    promo_code?: string;
    rush_delivery?: boolean;
    use_wallet?: boolean;
    latitude?: number | string;
    longitude?: number | string;
  } = {},
): Promise<ApiResponse<CartResponse>> => {
  try {
    const response = await api.get("/user/cart", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getSaveForLaterItems = async (): Promise<
  ApiResponse<CartResponse>
> => {
  try {
    const response = await api.get("/user/cart/item/save-for-later");
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const saveCartItemToSaveForLater = async (
  cartItemId: string | number,
  quantity: string | number,
): Promise<ApiResponse<{}>> => {
  try {
    const response = await api.post(
      `/user/cart/item/save-for-later/${cartItemId}`,
      { quantity },
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const removeItemFromCart = async (
  cartItemId: string | number,
): Promise<ApiResponse<[]>> => {
  try {
    const response = await api.delete(`/user/cart/item/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const updateCartItemQuantity = async (
  cartItemId: string | number,
  quantity: string | number,
): Promise<ApiResponse<[]>> => {
  try {
    const response = await api.post(`/user/cart/item/${cartItemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const syncOfflineCart = async (params: {
  items: {
    store_id: number;
    product_variant_id: number;
    quantity: number;
  }[];
}): Promise<ApiResponse<CartSyncData>> => {
  try {
    const response = await api.post("/user/cart/sync", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const clearCart = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await api.get("/user/cart/clear-cart");
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

//Promo code
export const getPromoCodes = async (): Promise<ApiResponse<PromoCode[]>> => {
  try {
    const response = await api.get("/user/promos/available");
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const validatePromoCode = async (
  params: {
    cart_amount?: string | number;
    promo_code?: string;
    delivery_charge?: string | number;
  } = {},
): Promise<ApiResponse<{ promo_code: string; discount: string }>> => {
  try {
    const response = await api.get("/user/promos/validate", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Orders
export const getOrders = async (
  params: {
    per_page?: string | number;
    page?: string | number;
    access_token?: string | null;
  } = {},
): Promise<PaginatedResponse<Order[]>> => {
  try {
    const { access_token = "" } = params;
    const response = await api.get("/user/orders", {
      headers: access_token
        ? { Authorization: `Bearer ${access_token}` }
        : undefined,
      params: params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};
export const cancelOrderItem = async (
  params: {
    orderItemId?: string;
  } = {},
): Promise<ApiResponse<[]>> => {
  try {
    const response = await api.post(
      `/user/orders/items/${params.orderItemId}/cancel`,
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const returnOrderItem = async (
  params: {
    orderItemId?: string;
    reason?: string;
    images?: File[];
  } = {},
): Promise<ApiResponse<[]>> => {
  try {
    const formData = new FormData();

    // Do NOT send orderItemId in the body
    if (params.reason) {
      formData.append("reason", params.reason);
    }

    if (params?.images && params.images.length > 0) {
      params.images.forEach((file) => {
        formData.append("images[]", file);
      });
    }

    const response = await api.post(
      `/user/orders/items/${params.orderItemId}/return`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const cancelReturnReq = async (
  params: {
    orderItemId?: string;
  } = {},
): Promise<ApiResponse<[]>> => {
  try {
    const { orderItemId } = params;
    const response = await api.post(
      `/user/orders/items/${orderItemId}/return-cancel`,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getSpecificOrders = async (
  params: { slug?: string; access_token?: string | null } = {},
): Promise<ApiResponse<Order>> => {
  try {
    const { slug = "", access_token = "" } = params;
    const response = await api.get(`/user/orders/${slug}`, {
      headers: access_token
        ? { Authorization: `Bearer ${access_token}` }
        : undefined,
      params: params,
    });

    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const createOrder = async (
  params: {
    payment_type?: string;
    promo_code?: string;
    promo_discount?: string;
    gift_card?: string;
    gift_card_discount?: string;
    rush_delivery?: boolean | string | number;
    use_wallet?: boolean | string | number;
    address_id?: string | number;
    order_note?: string;
    transaction_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    redirect_url?: string;
  } = {},
): Promise<ApiResponse<OrderCheckoutResponse>> => {
  try {
    const response = await api.post("/user/orders", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const getDeliveryBoyLocation = async (
  orderSlug: string,
): Promise<ApiResponse<DeliveryLocationResponse>> => {
  try {
    const response = await api.get(
      `/user/orders/${orderSlug}/delivery-boy-location`,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// WishList Management
// get WishList with their Items
export const getWishListWithItems = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    access_token?: string | null;
  } = {},
): Promise<PaginatedResponse<Wishlist[]>> => {
  try {
    const response = await api.get("/user/wishlists", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

// Create a new wishlist or add item to the existing / new wishlist
export const CreateWishListWithItems = async (
  params: {
    wishlist_title?: null | string;
    product_id?: null | number;
    product_variant_id?: null | number;
    store_id?: null | number;
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    const response = await api.post("/user/wishlists", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const CreateWishListWithOutItems = async (
  params: {
    title?: null | string;
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    const response = await api.post("/user/wishlists/create", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// get all wishlist titles
export const getAllWishlistTitles = async (
  params: {
    access_token?: string | null;
  } = {},
): Promise<ApiResponse<WishTitle>> => {
  try {
    const response = await api.get("/user/wishlists/titles", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// getSpecificWishlist
export const getWishlistById = async (
  id: string,
): Promise<ApiResponse<Wishlist>> => {
  try {
    const response = await api.get(`/user/wishlists/${id}`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Update a wishlist
export const UpdateWishlistById = async (
  params: {
    id?: null | number;
    title?: string | null;
  } = {},
): Promise<ApiResponse<object>> => {
  const { id = "" } = params;

  try {
    const response = await api.put(`/user/wishlists/${id}`, params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// delete wishlist
export const deleteWishlistById = async (
  id: string,
): Promise<ApiResponse<object>> => {
  try {
    const response = await api.delete(`/user/wishlists/${id}`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Remove item from wishlist
export const deleteWishlistItemById = async (
  itemId: string | number,
): Promise<ApiResponse<object>> => {
  try {
    const response = await api.delete(`/user/wishlists/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Move item to another wishlist
export const moveItemFromAnotherWishList = async (
  params: {
    itemId?: null | number;
    target_wishlist_id?: string | number;
  } = {},
): Promise<ApiResponse<object>> => {
  const { itemId = "" } = params;

  try {
    const response = await api.put(
      `/user/wishlists/items/${itemId}/move`,
      params,
    );
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// FAQs
export const getFaqs = async (
  params: {
    page?: string | number;
    per_page?: string | number;
    search?: string;
  } = {},
): Promise<PaginatedResponse<FAQ[]>> => {
  try {
    const response = await api.get("/faqs", { params });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};

//Delivery Boy Review
export const giveDeliveryBoyReview = async (
  params: {
    delivery_boy_id?: string | number;
    order_id?: string | number;
    rating?: number;
    title?: string | number;
    description?: string;
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    const response = await api.post("/delivery-boy/feedback", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const updateDeliveryBoyReview = async (
  params: {
    id?: string | number;
    rating?: number;
    title?: string | number;
    description?: string;
  } = {},
): Promise<ApiResponse<object>> => {
  try {
    const { id } = params;
    const response = await api.post(`/delivery-boy/feedback/${id}`, params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// RazorPay
export const createRazorPayOrder = async (
  params: {
    amount?: string | number;
    currency?: string;
    receipt?: string;
  } = {},
): Promise<ApiResponse<RazorpayOrderData>> => {
  try {
    const response = await api.post("/razorpay/create-order", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// Stripe
export const createStripeIntent = async (
  params: {
    amount?: string | number;
    currency?: string;
  } = {},
): Promise<ApiResponse<{ clientSecret: string }>> => {
  try {
    const response = await api.post("/stripe/create-order", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

// PayStack
export const paystackCreateOrder = async (
  params: {
    amount?: string | number;
  } = {},
): Promise<ApiResponse<PaystackCreateOrderResponse>> => {
  try {
    const response = await api.post("/paystack/create-order", params);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackApiRes;
  }
};

export const sellerRegister = async (
  params:
    | FormData
    | {
      name?: string;
      email?: string;
      mobile?: string;
      password?: string;
      address?: string;
      city?: string;
      state?: string;
      landmark?: string;
      zipcode?: string;
      country?: string;
      latitude?: string;
      longitude?: string;
      business_license?: string | File;
      articles_of_incorporation?: string | File;
      national_identity_card?: string | File;
      authorized_signature?: string | File;
    },
): Promise<ApiResponse<PaystackCreateOrderResponse>> => {
  try {
    // Check if params is FormData
    const isFormData = params instanceof FormData;

    const response = await api.post("/seller/register", params, {
      headers: isFormData
        ? {
          // Let browser set Content-Type with boundary for FormData
          // Don't manually set 'Content-Type': 'multipart/form-data'
        }
        : {
          "Content-Type": "application/json",
        },
    });

    return response.data;
  } catch (error: any) {
    console.error("API error:", error);

    // Preserve error response if it exists (e.g., validation errors)
    if (error?.response?.data) {
      return error.response.data;
    }

    return fallbackApiRes;
  }
};

export const getSellerReviews = async (params: {
  seller_id?: string | number;
  page: string | number;
  per_page: string | number;
}): Promise<PaginatedResponse<SellerReview[]>> => {
  try {
    const response = await api.get(`seller-feedback`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    return fallbackPaginateRes;
  }
};
