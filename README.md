# WooCommerce Connector

A powerful API connector for integrating WooCommerce with svelte-commerce platform. This package provides seamless integration between WooCommerce and Svelte Commerce, enabling you to synchronize products, orders, and other e-commerce data between the two platforms.

## Features

- Seamless integration between WooCommerce and Svelte Commerce
- TypeScript support
- Modular service architecture
- Easy to use and extend
- Comprehensive API coverage
- REST API v3 compatibility

## Installation

```bash
# Using npm
npm install @misiki/woocommerce-connector

# Using yarn
yarn add @misiki/woocommerce-connector

# Using bun
bun add @misiki/woocommerce-connector
```

## Usage

```typescript
import { WooCommerceConnector } from '@misiki/woocommerce-connector'

// Initialize the connector
const connector = new WooCommerceConnector({
  siteUrl: 'https://your-woocommerce-store.com',
  consumerKey: 'your-consumer-key',
  consumerSecret: 'your-consumer-secret'
})

// Use specific services
import { ProductService } from '@misiki/woocommerce-connector/services'

const productService = new ProductService()
BaseService.setWooCommerceCredentials(
  'https://your-woocommerce-store.com',
  'your-consumer-key',
  'your-consumer-secret'
)
```

## Available Services

- ProductService
- OrderService
- UserService
- AuthService
- CategoryService
- CouponService
- PaymentMethodService

## Authentication

To use the WooCommerce REST API, you need to generate API keys:

1. Log in to your WordPress admin dashboard
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add Key** and create a new API key
4. Copy the **Consumer Key** and **Consumer Secret**

### Security Notes

- Always use HTTPS for API requests
- Keep your API keys secure and never expose them in client-side code
- Use restrictive permissions for API keys when possible

## Development

```bash
# Install dependencies
bun install

# Start development mode
bun run dev

# Build the package
bun run build

# Run linter
bun run lint

# Format code
bun run format
```

## Authentication

To use the WooCommerce REST API, you need to generate API keys:

1. Log in to your WordPress admin dashboard
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add Key** and create a new API key
4. Copy the **Consumer Key** and **Consumer Secret**

### Security Notes

- Always use HTTPS for API requests
- Keep your API keys secure and never expose them in client-side code
- Use restrictive permissions for API keys when possible

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.
