import type { ConnectorConfig } from './config'
import { ProductService } from './services/product-service'
import { CategoryService } from './services/category-service'
import { CollectionService } from './services/collection-service'
import { OrderService } from './services/order-service'
import { CouponService } from './services/coupon-service'
import { AddressService } from './services/address-service'
import { ReviewService } from './services/review-service'
import { CartService } from './services/cart-service'
import { CountryService } from './services/country-service'
import { StateService } from './services/state-service'
import { CurrencyService } from './services/currency-service'
import { RegionService } from './services/region-service'
import { PageService } from './services/page-service'
import { BlogService } from './services/blog-service'
import { SettingService } from './services/settings-service'
import { StoreService } from './services/store-service'
import { PaymentMethodService } from './services/payment-method-service'
import { SearchService } from './services/search-service'
import { AutocompleteService } from './services/autocomplete-service'
import { UserService } from './services/user-service'
import { AuthService } from './services/auth-service'
import { ProfileService } from './services/profile-service'
import { WishlistService } from './services/wishlist-service'
import { VendorService } from './services/vendor-service'
import { CheckoutService } from './services/checkout-service'
import { UploadService } from './services/upload-service'
import { BannerService } from './services/banner-service'
import { ChatService } from './services/chat-service'
import { ContactService } from './services/contact-service'
import { DealService } from './services/deal-service'
import { DemoRequestService } from './services/demo-request-service'
import { EnquiryService } from './services/enquiry-service'
import { FaqService } from './services/faq-service'
import { FeedbackService } from './services/feedback-service'
import { GalleryService } from './services/gallery-service'
import { HomeService } from './services/home-service'
import { InitService } from './services/init-service'
import { MeilisearchService } from './services/meilisearch-service'
import { MenuService } from './services/menu-service'
import { PluginService } from './services/plugins-service'
import { PopularSearchService } from './services/popular-search-service'
import { PopularityService } from './services/popularity-service'
import { ReelsService } from './services/reels-service'

/**
 * WooCommerceConnector — entry point for the WooCommerce connector. Exposes all 43 services.
 * Methods for resources WooCommerce does not expose throw `NotSupportedError` (see README coverage table).
 */
export class WooCommerceConnector {
  readonly product: ProductService
  readonly category: CategoryService
  readonly collection: CollectionService
  readonly order: OrderService
  readonly coupon: CouponService
  readonly address: AddressService
  readonly review: ReviewService
  readonly cart: CartService
  readonly country: CountryService
  readonly state: StateService
  readonly currency: CurrencyService
  readonly region: RegionService
  readonly page: PageService
  readonly blog: BlogService
  readonly settings: SettingService
  readonly store: StoreService
  readonly paymentMethod: PaymentMethodService
  readonly search: SearchService
  readonly autocomplete: AutocompleteService
  readonly user: UserService
  readonly auth: AuthService
  readonly profile: ProfileService
  readonly wishlist: WishlistService
  readonly vendor: VendorService
  readonly checkout: CheckoutService
  readonly upload: UploadService
  readonly banner: BannerService
  readonly chat: ChatService
  readonly contact: ContactService
  readonly deal: DealService
  readonly demoRequest: DemoRequestService
  readonly enquiry: EnquiryService
  readonly faq: FaqService
  readonly feedback: FeedbackService
  readonly gallery: GalleryService
  readonly home: HomeService
  readonly init: InitService
  readonly meilisearch: MeilisearchService
  readonly menu: MenuService
  readonly plugins: PluginService
  readonly popularSearch: PopularSearchService
  readonly popularity: PopularityService
  readonly reels: ReelsService

  constructor(config: ConnectorConfig) {
    this.product = new ProductService(config)
    this.category = new CategoryService(config)
    this.collection = new CollectionService(config)
    this.order = new OrderService(config)
    this.coupon = new CouponService(config)
    this.address = new AddressService(config)
    this.review = new ReviewService(config)
    this.cart = new CartService(config)
    this.country = new CountryService(config)
    this.state = new StateService(config)
    this.currency = new CurrencyService(config)
    this.region = new RegionService(config)
    this.page = new PageService(config)
    this.blog = new BlogService(config)
    this.settings = new SettingService(config)
    this.store = new StoreService(config)
    this.paymentMethod = new PaymentMethodService(config)
    this.search = new SearchService(config)
    this.autocomplete = new AutocompleteService(config)
    this.user = new UserService(config)
    this.auth = new AuthService(config)
    this.profile = new ProfileService(config)
    this.wishlist = new WishlistService(config)
    this.vendor = new VendorService(config)
    this.checkout = new CheckoutService(config)
    this.upload = new UploadService(config)
    this.banner = new BannerService(config)
    this.chat = new ChatService(config)
    this.contact = new ContactService(config)
    this.deal = new DealService(config)
    this.demoRequest = new DemoRequestService(config)
    this.enquiry = new EnquiryService(config)
    this.faq = new FaqService(config)
    this.feedback = new FeedbackService(config)
    this.gallery = new GalleryService(config)
    this.home = new HomeService(config)
    this.init = new InitService(config)
    this.meilisearch = new MeilisearchService(config)
    this.menu = new MenuService(config)
    this.plugins = new PluginService(config)
    this.popularSearch = new PopularSearchService(config)
    this.popularity = new PopularityService(config)
    this.reels = new ReelsService(config)
  }
}

export function createClient(config: ConnectorConfig) { return new WooCommerceConnector(config) }
