# @misiki/woocommerce-connector

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

TypeScript API connector for **[WooCommerce](https://woocommerce.com)** — part of the [Litekart](https://litekart.in) connector suite.
Full 43-service surface mirroring [`@misiki/litekart-connector`](https://github.com/misiki-in/litekart-connector).

> **Coverage:** 2 of 43 services (`category`, `product`) are wired to the live WooCommerce API.
> The remaining 41 are present for interface parity and return empty placeholder data without
> contacting WooCommerce — except `client.auth`, which throws `NotSupportedError` rather than
> fabricating a session. See the coverage table below before relying on a service.

## Installation

```bash
npm install @misiki/woocommerce-connector
```

## Configuration

Pass `apiUrl` (store URL), `apiKey` (consumer key `ck_...`), `apiSecret` (consumer secret `cs_...`).
API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

## Usage

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

## Service coverage

| Service | Status |
| --- | --- |
| `client.product` | ✅ live |
| `client.category` | ✅ live |
| `client.collection` | ⚠️ placeholder (returns empty data) |
| `client.order` | ⚠️ placeholder (returns empty data) |
| `client.coupon` | ⚠️ placeholder (returns empty data) |
| `client.address` | ⚠️ placeholder (returns empty data) |
| `client.review` | ⚠️ placeholder (returns empty data) |
| `client.cart` | ⚠️ placeholder (returns empty data) |
| `client.country` | ⚠️ placeholder (returns empty data) |
| `client.state` | ⚠️ placeholder (returns empty data) |
| `client.currency` | ⚠️ placeholder (returns empty data) |
| `client.region` | ⚠️ placeholder (returns empty data) |
| `client.page` | ⚠️ placeholder (returns empty data) |
| `client.blog` | ⚠️ placeholder (returns empty data) |
| `client.settings` | ⚠️ placeholder (returns empty data) |
| `client.store` | ⚠️ placeholder (returns empty data) |
| `client.paymentMethod` | ⚠️ placeholder (returns empty data) |
| `client.search` | ⚠️ placeholder (returns empty data) |
| `client.autocomplete` | ⚠️ placeholder (returns empty data) |
| `client.user` | ⚠️ placeholder (returns empty data) |
| `client.auth` | ⛔ throws `NotSupportedError` |
| `client.profile` | ⚠️ placeholder (returns empty data) |
| `client.wishlist` | ⚠️ placeholder (returns empty data) |
| `client.vendor` | ⚠️ placeholder (returns empty data) |
| `client.checkout` | ⚠️ placeholder (returns empty data) |
| `client.upload` | ⚠️ placeholder (returns empty data) |
| `client.banner` | ⚠️ placeholder (returns empty data) |
| `client.chat` | ⚠️ placeholder (returns empty data) |
| `client.contact` | ⚠️ placeholder (returns empty data) |
| `client.deal` | ⚠️ placeholder (returns empty data) |
| `client.demoRequest` | ⚠️ placeholder (returns empty data) |
| `client.enquiry` | ⚠️ placeholder (returns empty data) |
| `client.faq` | ⚠️ placeholder (returns empty data) |
| `client.feedback` | ⚠️ placeholder (returns empty data) |
| `client.gallery` | ⚠️ placeholder (returns empty data) |
| `client.home` | ⚠️ placeholder (returns empty data) |
| `client.init` | ⚠️ placeholder (returns empty data) |
| `client.meilisearch` | ⚠️ placeholder (returns empty data) |
| `client.menu` | ⚠️ placeholder (returns empty data) |
| `client.plugins` | ⚠️ placeholder (returns empty data) |
| `client.popularSearch` | ⚠️ placeholder (returns empty data) |
| `client.popularity` | ⚠️ placeholder (returns empty data) |
| `client.reels` | ⚠️ placeholder (returns empty data) |

## Development

```bash
bun install && bun run typecheck && bun run build
```

## License

ISC © misiki-in
