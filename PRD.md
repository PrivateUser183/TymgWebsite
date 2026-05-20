# TymG - Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** TymG
**Type:** Multi-vendor Local Marketplace Platform
**Description:** TymG is a full-featured multi-vendor marketplace enabling customers to browse products from multiple stores, add items to cart, checkout with multiple payment methods, track deliveries in real-time, and manage their accounts. It supports sellers/vendors, delivery personnel, and admin management.

**Live URLs:**
- Customer Website: https://tymg-customer-web.vercel.app
- Backend API: https://tymg-api.duckdns.org/api/v1

**Tech Stack:**
- Frontend (Customer): Next.js 16, React 19, Tailwind CSS 4, HeroUI, Redux Toolkit
- Frontend (Admin): React 18, Ant Design, Redux Toolkit
- Backend: Laravel (PHP), MySQL 8, Docker, Laravel Sanctum

---

## 2. User Roles

| Role | Description |
|------|-------------|
| Customer | Browse products, add to cart, place orders, track delivery, manage account |
| Seller/Vendor | Manage stores, products, orders, earnings, withdrawals |
| Delivery Boy | Accept delivery assignments, update status, track earnings |
| Admin | Full platform management, users, orders, payments, settings |
| Manager | Limited admin access for customer and product management |
| Moderator | Lightweight admin for content moderation |

---

## 3. Customer Website Features

### 3.1 Authentication
- **Login:** Email/mobile + password, Google OAuth, Apple OAuth
- **Registration:** Name, email, phone, country, password with verification
- **Forgot Password:** Email-based password reset flow
- **Session Management:** Token stored in cookies, auto-logout on 401
- **Firebase Integration:** FCM token for push notifications

### 3.2 Home Page
- Hero banner carousel (Swiper.js)
- Category grid with icons
- Brand showcase
- Store listings with distance
- Featured sections: Newly Added, Top Rated, Trending, Best Sellers, On Sale, Recommended
- Recently viewed products
- Service highlights (shipping, returns, safety, support)
- App download section

### 3.3 Product Browsing
- **Product Listing:** Infinite scroll, 18 items per page
- **Product Cards:** Image, title, price, rating, stock status, veg/non-veg badge
- **Categories:** Hierarchical (parent + subcategories), category pages with banners
- **Brands:** Brand pages with filtered products
- **Delivery Zones:** Zone-based store and product availability
- **Feature Sections:** Curated collections (trending, best sellers, etc.)
- **Search:** Global keyword search with autocomplete
- **Filters:** By category, brand, color/attributes, price sort (asc/desc)
- **Sorting:** Relevance, price ascending, price descending

### 3.4 Product Detail Page
- Product images with lightbox gallery
- Variant selector (size, color, specifications)
- Price display with special pricing
- Stock availability indicator
- Add to cart with quantity controls (min/max/step enforcement)
- Product description (rich HTML)
- Product FAQs section
- Customer reviews with star ratings (1-5), images, rating breakdown
- Seller information with rating
- Similar products carousel
- Breadcrumb navigation
- SEO schema markup (Product, BreadcrumbList)

### 3.5 Shopping Cart
- **Add to Cart:** Single-click for simple products, modal for variant products
- **Cart Management:** Update quantities, remove items, save for later
- **Offline Cart:** Redux-persisted cart for non-logged-in users, auto-sync on login
- **Multi-Store:** Items from multiple stores in one cart
- **Quantity Constraints:** Minimum order quantity, maximum allowed, step size, stock limit
- **Cart Page:** Store-wise grouping, subtotal, delivery charges, handling fees, promo discount

### 3.6 Checkout Flow
1. **Address Selection:** Choose saved address or add new (Google Maps integration)
2. **Delivery Options:** Standard or express/rush delivery
3. **Promo Code:** Apply discount codes with validation
4. **Wallet Balance:** Optional wallet deduction
5. **Tip Section:** Optional delivery tip
6. **Payment Method:** Select from available gateways
7. **Order Confirmation:** Order placed with transaction details

### 3.7 Payment Gateways
| Gateway | Type |
|---------|------|
| Cash on Delivery | Pay at delivery |
| Stripe | Credit/debit cards |
| Razorpay | Indian payment instruments |
| Paystack | African payments |
| Flutterwave | African payments |
| Bank Transfer | Direct bank transfer |
| Wallet | Internal wallet balance |

### 3.8 Order Management
- **Order History:** Paginated list with status badges
- **Order Detail:** Items, pricing breakdown, delivery info, payment info, timeline
- **Order Statuses:** Awaiting store response, Confirmed, Ready for Pickup, Assigned, Out for Delivery, Delivered, Cancelled
- **Cancel Items:** Within cancellation window
- **Return Items:** Within return window with reason and images
- **Track Delivery:** Real-time delivery boy location on Google Maps / OpenStreetMap

### 3.9 User Account
- **Profile:** Edit name, email, phone, country, avatar
- **Addresses:** CRUD address book with Google Maps picker
- **Wallet:** Balance, recharge via Razorpay, transaction history (deposits, withdrawals, payments, refunds, referral earnings)
- **Transactions:** Order payment history with status
- **Wishlists:** Multiple named lists, add/remove/move products between lists
- **Refer & Earn:** Unique referral code, share via social/email, earnings tracking
- **Shopping List:** Keyword-based product collection

### 3.10 Store Pages
- Store listing with search
- Store detail: logo, banner, hours, status, distance, average rating
- Store products with filtering

### 3.11 Seller Registration
- Multi-step form: personal info, business address, location (map), document uploads (license, ID, signature)

### 3.12 Internationalization
- English and French language support
- Cookie-based language persistence
- Dynamic language switching

### 3.13 Legal/Info Pages
- About Us, FAQs, Privacy Policy, Terms & Conditions, Shipping Policy, Return & Refund Policy

### 3.14 PWA & Offline
- Service worker, web manifest, installable
- Offline cart with sync on reconnection

### 3.15 SEO
- Dynamic meta tags, Open Graph, canonical URLs
- JSON-LD schema: Product, Organization, BreadcrumbList, LocalBusiness, CollectionPage

### 3.16 Responsive Design
- Mobile-first with bottom navigation
- Desktop: full sidebar and navigation
- Breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)

---

## 4. Admin Panel Features

### 4.1 Dashboard
- Order count trends (weekly charts)
- Sales revenue visualization
- Order status distribution (pie charts)
- Top 5 customers and products
- Role-based dashboards (Admin, Seller, Manager, Deliveryman)

### 4.2 Order Management
- Orders Board (main management)
- Delivery, Dine-In, Pickup, Kiosk, Scheduled orders
- Order status updates with timeline
- Order reviews and refunds
- Order export

### 4.3 User Management
- Customers, Staff, Deliverymen CRUD
- Role management with permissions
- Wallet management
- Deliveryman zones, time slots, payment settings

### 4.4 Product/Catalog Management
- Products CRUD with variants, extras, attributes
- Product import/export
- Stock management
- Categories (product, combo, recipe, menu)
- Brands, Units, Addons

### 4.5 Shop/Store Management
- Shops CRUD with clone/import
- Delivery zone configuration per shop
- Working days/hours, closed days
- Shop tags and categories
- Branch and kitchen management

### 4.6 Delivery Management
- Deliveryman list with GPS map tracking
- Delivery order assignment
- Delivery zones (template and custom)
- Deliveryman statistics and reviews

### 4.7 Promotions & Marketing
- Coupons/Discounts CRUD
- Bonuses (system, shop, product)
- Banners and advertisements
- Cashback programs
- Referral system configuration

### 4.8 Payments & Finance
- Transaction history and details
- Payment gateway configuration
- Seller payments (pending/completed)
- Deliveryman payments
- Payout/withdrawal requests

### 4.9 Content Management
- Blog posts, Stories, Custom pages
- FAQ management, Gallery
- Career listings

### 4.10 Analytics & Reporting
- Revenue, Order, Product, Stock, Category reports
- Date range filtering, chart visualizations
- Data export

### 4.11 Settings
- General, Auth, UI, Business settings
- Notifications (Firebase, SMS, Email)
- Currencies and payment methods
- Languages and translations (with AI translation)
- Backup, cache, system info, database updates

### 4.12 Reservations & POS
- Table booking with QR codes
- Point of Sale system
- Parcel order management

### 4.13 Chat
- Admin-to-user messaging with media support

---

## 5. Backend API Features

### 5.1 Authentication
- Sanctum token-based auth
- Firebase OAuth (Google, Apple)
- Email/mobile + password login/register
- Role-based middleware (auth:sanctum, ValidateSeller, ValidateAdmin)

### 5.2 Cart API
- POST /user/cart/add - Add item (requires: product_variant_id, store_id, quantity)
- POST /user/cart/item/{id} - Update quantity
- DELETE /user/cart/item/{id} - Remove item
- GET /user/cart - Get cart with pricing
- POST /user/cart/sync - Sync offline cart
- GET /user/cart/clear-cart - Clear cart

### 5.3 Order API
- POST /user/orders - Create order
- GET /user/orders - List orders (paginated)
- GET /user/orders/{slug} - Order detail
- POST /user/orders/items/{id}/cancel - Cancel item
- POST /user/orders/items/{id}/return - Return item

### 5.4 Product API
- GET /products/search-by-keywords - Search
- GET /products/{slug} - Product detail
- GET /products/{slug}/reviews - Reviews
- GET /delivery-zone/products - Location-based products

### 5.5 Payment Webhooks
- Razorpay, Stripe, Paystack, Flutterwave webhook endpoints
- Signature verification on all webhooks

### 5.6 Delivery Boy API
- Accept/manage deliveries
- Real-time location updates
- Earnings, withdrawals, cash collections
- Feedback system

### 5.7 Validation Rules
- AddToCart: product_variant_id (required, exists), store_id (required, exists), quantity (integer, 1-999)
- UpdateQuantity: quantity (required, integer, 1-999)
- Business logic: stock check, store online check, checkout type enforcement

---

## 6. Critical User Flows to Test

### 6.1 Customer Purchase Flow
1. User lands on homepage
2. Browses products by category/search
3. Views product detail page
4. Selects variant if applicable
5. Adds product to cart
6. Views cart, adjusts quantities
7. Proceeds to checkout
8. Selects/adds delivery address
9. Applies promo code (optional)
10. Selects payment method
11. Completes payment
12. Receives order confirmation
13. Tracks delivery in real-time
14. Receives order delivery
15. Leaves product review

### 6.2 Authentication Flow
1. User clicks login
2. Enters email/phone + password
3. Successfully logs in
4. Access token stored in cookies
5. Protected pages accessible
6. Logout clears session

### 6.3 Seller Registration Flow
1. Navigate to seller registration
2. Fill personal information
3. Enter business address with map
4. Upload required documents
5. Submit registration
6. Await approval

### 6.4 Cart Edge Cases
- Add to cart while logged out (offline cart)
- Login and sync offline cart
- Add items from multiple stores
- Exceed stock quantity
- Apply invalid promo code
- Remove all items from cart

### 6.5 Order Management
- View order history
- Track active delivery
- Cancel order item
- Request return with images
- View transaction history

### 6.6 Account Management
- Update profile information
- Add/edit/delete addresses
- Recharge wallet
- Create and manage wishlists
- Share referral code

---

## 7. API Response Format

All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": { ... }
}
```

Paginated responses:
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [...],
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

---

## 8. Environment Configuration

### Required Environment Variables (Website)
- NEXT_PUBLIC_ADMIN_PANEL_URL - Backend API base URL
- NEXT_PUBLIC_SITE_URL - Website URL
- NEXT_PUBLIC_SSR - Enable server-side rendering
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY - Google Maps API key

### Required Headers
- Accept: application/json (critical for proper API responses)
- Content-Type: application/json
- Authorization: Bearer {token} (for authenticated endpoints)
