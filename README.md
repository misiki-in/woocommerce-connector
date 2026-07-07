# @misiki/woocommerce-connector

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

TypeScript API connector for **[WooCommerce](https://woocommerce.com)** — part of the [Litekart](https://litekart.in) connector suite.
Full 43-service surface mirroring [`@misiki/litekart-connector`](https://github.com/misiki-in/litekart-connector).

> **Coverage:** 17/43 services are wired to the live WooCommerce REST API.
> The rest are present for interface parity and throw `NotSupportedError` (WooCommerce has no equivalent endpoint).

## Installation

```bash
npm install @misiki/woocommerce-connector
```

## Configuration

Pass `baseUrl` (store URL), `apiKey` (consumer key `ck_...`), `apiSecret` (consumer secret `cs_...`).
API docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

## Usage

```ts
import { WooCommerceConnector } from '@misiki/woocommerce-connector'

const client = new WooCommerceConnector({
  "baseUrl": "https://store.example.com",
  "apiKey": "ck_xxx",
  "apiSecret": "cs_xxx"
})

const products = await client.product.list({ page: 1, perPage: 10 })
```

## Service coverage

| Service | Status |
| --- | --- |
| `client.product` | ✅ live |
| `client.category` | ✅ live |
| `client.collection` | ✅ live |
| `client.order` | ✅ live |
| `client.coupon` | ✅ live |
| `client.address` | ⚠️ stub (NotSupported) |
| `client.review` | ✅ live |
| `client.cart` | ⚠️ stub (NotSupported) |
| `client.country` | ✅ live |
| `client.state` | ⚠️ stub (NotSupported) |
| `client.currency` | ✅ live |
| `client.region` | ✅ live |
| `client.page` | ⚠️ stub (NotSupported) |
| `client.blog` | ⚠️ stub (NotSupported) |
| `client.settings` | ✅ live |
| `client.store` | ✅ live |
| `client.paymentMethod` | ✅ live |
| `client.search` | ✅ live |
| `client.autocomplete` | ✅ live |
| `client.user` | ✅ live |
| `client.auth` | ✅ live |
| `client.profile` | ✅ live |
| `client.wishlist` | ⚠️ stub (NotSupported) |
| `client.vendor` | ⚠️ stub (NotSupported) |
| `client.checkout` | ⚠️ stub (NotSupported) |
| `client.upload` | ⚠️ stub (NotSupported) |
| `client.banner` | ⚠️ stub (NotSupported) |
| `client.chat` | ⚠️ stub (NotSupported) |
| `client.contact` | ⚠️ stub (NotSupported) |
| `client.deal` | ⚠️ stub (NotSupported) |
| `client.demoRequest` | ⚠️ stub (NotSupported) |
| `client.enquiry` | ⚠️ stub (NotSupported) |
| `client.faq` | ⚠️ stub (NotSupported) |
| `client.feedback` | ⚠️ stub (NotSupported) |
| `client.gallery` | ⚠️ stub (NotSupported) |
| `client.home` | ⚠️ stub (NotSupported) |
| `client.init` | ⚠️ stub (NotSupported) |
| `client.meilisearch` | ⚠️ stub (NotSupported) |
| `client.menu` | ⚠️ stub (NotSupported) |
| `client.plugins` | ⚠️ stub (NotSupported) |
| `client.popularSearch` | ⚠️ stub (NotSupported) |
| `client.popularity` | ⚠️ stub (NotSupported) |
| `client.reels` | ⚠️ stub (NotSupported) |

## Development

```bash
bun install && bun run typecheck && bun run build
```

## License

ISC © misiki-in
