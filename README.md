# @misiki/woocommerce-connector

[![NPM Version](https://img.shields.io/npm/v/@misiki/woocommerce-connector.svg)](https://www.npmjs.com/package/@misiki/woocommerce-connector)
[![License](https://img.shields.io/npm/l/@misiki/woocommerce-connector.svg)](https://github.com/misiki-in/woocommerce-connector/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**The Official TypeScript API Connector for connecting `svelte-commerce` to WooCommerce E-Commerce Backend.**

`@misiki/woocommerce-connector` provides a production-ready, fully-typed API client and integration layer that seamlessly bridges [svelte-commerce](https://github.com/misiki-in/svelte-commerce) storefronts with [WooCommerce](https://woocommerce.com) headless e-commerce backends — part of the [Litekart](https://litekart.in) connector suite, mirroring the full 43-service surface of [`@misiki/litekart-connector`](https://github.com/misiki-in/litekart-connector).

> **Coverage:** 27 of 43 services are wired to the live WooCommerce API.
> The remaining 16 have no WooCommerce equivalent and return empty placeholder
> data — except `client.auth`, which throws `NotSupportedError` rather than fabricating a
> session. Each placeholder says why in a comment at the top of its service file.

---

## 🚀 Step-by-Step Integration Guide

Follow these steps to connect `svelte-commerce` with `woocommerce-connector` and your WooCommerce backend.

### 1. Install the Connector

Inside your `svelte-commerce` project directory, run:

```bash
bun i @misiki/woocommerce-connector
```

*(Or using npm / pnpm / yarn):*
```bash
npm install @misiki/woocommerce-connector
# or
pnpm add @misiki/woocommerce-connector
```

### 2. Configure `kitcommerce.config.ts`

In `svelte-commerce`, open `kitcommerce.config.ts` and change the `export *` line to import from `@misiki/woocommerce-connector`:

```typescript
// kitcommerce.config.ts
export * from '@misiki/woocommerce-connector';
```

### 3. Configure Credentials

Pass `apiUrl` (store URL), `apiKey` (consumer key `ck_...`), `apiSecret` (consumer secret `cs_...`).
API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

```ts
import { WooCommerceConnector } from '@misiki/woocommerce-connector'

// Credentials are set once, statically — the constructor only takes an optional fetch.
WooCommerceConnector.setCredentials({
  apiUrl: 'https://store.example.com',
  apiKey: 'ck_xxx',
  apiSecret: 'cs_xxx'
})

const client = new WooCommerceConnector()

const products = await client.product.list({ page: 1, sort: '-createdAt' })
```

### 4. Build and Run the Project

Run the development server in `svelte-commerce`:

```bash
bun dev
```

To build and run the production application:

```bash
# Build the project
bun run build

# Preview the built application
bun run preview
```

## Service coverage

| Service | Status |
| --- | --- |
| `client.product` | ✅ live |
| `client.category` | ✅ live |
| `client.collection` | ✅ live |
| `client.order` | ✅ live |
| `client.coupon` | ✅ live |
| `client.address` | ✅ live |
| `client.review` | ✅ live |
| `client.cart` | ✅ live |
| `client.country` | ✅ live |
| `client.state` | ✅ live |
| `client.currency` | ✅ live |
| `client.region` | ✅ live |
| `client.page` | ✅ live |
| `client.blog` | ✅ live |
| `client.settings` | ✅ live |
| `client.store` | ✅ live |
| `client.paymentMethod` | ✅ live |
| `client.search` | ✅ live |
| `client.autocomplete` | ✅ live |
| `client.user` | ✅ live |
| `client.auth` | ⛔ throws `NotSupportedError` |
| `client.profile` | ✅ live |
| `client.wishlist` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.vendor` | ✅ live |
| `client.checkout` | ✅ live |
| `client.upload` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.banner` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.chat` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.contact` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.deal` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.demoRequest` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.enquiry` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.faq` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.feedback` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.gallery` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.home` | ✅ live |
| `client.init` | ✅ live |
| `client.meilisearch` | ✅ live |
| `client.menu` | ✅ live |
| `client.plugins` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.popularSearch` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.popularity` | ⚠️ placeholder (no WooCommerce equivalent) |
| `client.reels` | ⚠️ placeholder (no WooCommerce equivalent) |

## Development

```bash
bun install && bun run typecheck && bun run build
```

## License

MIT © misiki-in
