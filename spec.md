# Specification

## Summary
**Goal:** Add multi-currency support (INR and USD) to the GreenLeaf Store frontend, allowing users to switch currencies and see all prices updated accordingly.

**Planned changes:**
- Create a `useCurrency` React context/hook (in `frontend/src/hooks/useCurrency.tsx`) that exposes the current currency, a setter, and a `formatPrice(amount)` utility
- Define a single named constant for the INR-to-USD conversion rate (1 USD = 83 INR) in a utility/constants file
- Add a currency selector (dropdown or toggle) in the site header for switching between INR (₹) and USD ($)
- Persist the selected currency in `localStorage` and default to INR when no preference is stored
- Update all price-displaying components (ProductCard, ProductDetails, Cart, Checkout, order summaries) to use `formatPrice` from `useCurrency` instead of inline formatting
- Remove any hardcoded `₹` or `INR` symbols scattered across components

**User-visible outcome:** Users can switch between INR and USD from a currency selector in the header; all prices, cart totals, and checkout costs instantly reflect the chosen currency with the correct symbol, and the preference is remembered across page reloads.
