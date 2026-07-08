import type { Credentials } from './config'
import { BaseService } from './services/base.service'
import { AddressService } from './services/address-service'
import { AuthService } from './services/auth-service'
import { AutocompleteService } from './services/autocomplete-service'
import { BannerService } from './services/banner-service'
import { BlogService } from './services/blog-service'
import { CartService } from './services/cart-service'
import { CategoryService } from './services/category-service'
import { ChatService } from './services/chat-service'
import { CheckoutService } from './services/checkout-service'
import { CollectionService } from './services/collection-service'
import { ContactService } from './services/contact-service'
import { CountryService } from './services/country-service'
import { CouponService } from './services/coupon-service'
import { CurrencyService } from './services/currency-service'
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
import { OrderService } from './services/order-service'
import { PageService } from './services/page-service'
import { PaymentMethodService } from './services/payment-method-service'
import { PluginService } from './services/plugins-service'
import { PopularSearchService } from './services/popular-search-service'
import { PopularityService } from './services/popularity-service'
import { ProductService } from './services/product-service'
import { ProfileService } from './services/profile-service'
import { ReelsService } from './services/reels-service'
import { RegionService } from './services/region-service'
import { ReviewService } from './services/review-service'
import { SearchService } from './services/search-service'
import { SettingService } from './services/settings-service'
import { StateService } from './services/state-service'
import { StoreService } from './services/store-service'
import { UploadService } from './services/upload-service'
import { UserService } from './services/user-service'
import { VendorService } from './services/vendor-service'
import { WishlistService } from './services/wishlist-service'

/** WooCommerceConnector — server-side entry (custom fetch per request). Client-side imports singletons. */
export class WooCommerceConnector {
  readonly address: AddressService
  readonly auth: AuthService
  readonly autocomplete: AutocompleteService
  readonly banner: BannerService
  readonly blog: BlogService
  readonly cart: CartService
  readonly category: CategoryService
  readonly chat: ChatService
  readonly checkout: CheckoutService
  readonly collection: CollectionService
  readonly contact: ContactService
  readonly country: CountryService
  readonly coupon: CouponService
  readonly currency: CurrencyService
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
  readonly order: OrderService
  readonly page: PageService
  readonly paymentMethod: PaymentMethodService
  readonly plugins: PluginService
  readonly popularSearch: PopularSearchService
  readonly popularity: PopularityService
  readonly product: ProductService
  readonly profile: ProfileService
  readonly reels: ReelsService
  readonly region: RegionService
  readonly review: ReviewService
  readonly search: SearchService
  readonly settings: SettingService
  readonly state: StateService
  readonly store: StoreService
  readonly upload: UploadService
  readonly user: UserService
  readonly vendor: VendorService
  readonly wishlist: WishlistService
  constructor(fetchFn?: typeof fetch) {
    this.address = new AddressService(fetchFn)
    this.auth = new AuthService(fetchFn)
    this.autocomplete = new AutocompleteService(fetchFn)
    this.banner = new BannerService(fetchFn)
    this.blog = new BlogService(fetchFn)
    this.cart = new CartService(fetchFn)
    this.category = new CategoryService(fetchFn)
    this.chat = new ChatService(fetchFn)
    this.checkout = new CheckoutService(fetchFn)
    this.collection = new CollectionService(fetchFn)
    this.contact = new ContactService(fetchFn)
    this.country = new CountryService(fetchFn)
    this.coupon = new CouponService(fetchFn)
    this.currency = new CurrencyService(fetchFn)
    this.deal = new DealService(fetchFn)
    this.demoRequest = new DemoRequestService(fetchFn)
    this.enquiry = new EnquiryService(fetchFn)
    this.faq = new FaqService(fetchFn)
    this.feedback = new FeedbackService(fetchFn)
    this.gallery = new GalleryService(fetchFn)
    this.home = new HomeService(fetchFn)
    this.init = new InitService(fetchFn)
    this.meilisearch = new MeilisearchService(fetchFn)
    this.menu = new MenuService(fetchFn)
    this.order = new OrderService(fetchFn)
    this.page = new PageService(fetchFn)
    this.paymentMethod = new PaymentMethodService(fetchFn)
    this.plugins = new PluginService(fetchFn)
    this.popularSearch = new PopularSearchService(fetchFn)
    this.popularity = new PopularityService(fetchFn)
    this.product = new ProductService(fetchFn)
    this.profile = new ProfileService(fetchFn)
    this.reels = new ReelsService(fetchFn)
    this.region = new RegionService(fetchFn)
    this.review = new ReviewService(fetchFn)
    this.search = new SearchService(fetchFn)
    this.settings = new SettingService(fetchFn)
    this.state = new StateService(fetchFn)
    this.store = new StoreService(fetchFn)
    this.upload = new UploadService(fetchFn)
    this.user = new UserService(fetchFn)
    this.vendor = new VendorService(fetchFn)
    this.wishlist = new WishlistService(fetchFn)
  }
  static setCredentials(creds: Partial<Credentials>): void { BaseService.setCredentials(creds) }
}
export function createClient(fetchFn?: typeof fetch): WooCommerceConnector { return new WooCommerceConnector(fetchFn) }
