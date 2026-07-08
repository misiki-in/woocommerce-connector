import { type Product, type Category, ProductStatus } from '../types'

/** Read a dotted path (supports numeric array indices) from an object. */
export function getPath(obj: any, path: string): any {
  if (!path) return obj
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

const num = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v) : v
  return Number.isFinite(n) ? n : 0
}

export type FieldMap = {
  id?: string; title?: string; slug?: string; price?: string; mrp?: string
  currency?: string; description?: string; image?: string; images?: string; stock?: string
}

/** Map an arbitrary vendor product object into a litekart Product via a field map. */
export function mapProductGeneric(raw: any, fm: FieldMap, opts: { storeId?: string } = {}): Product {
  const img = fm.image ? getPath(raw, fm.image) : undefined
  const price = num(getPath(raw, fm.price || 'price'))
  return {
    id: String(getPath(raw, fm.id || 'id') ?? ''),
    active: true,
    status: ProductStatus.PUBLISHED,
    type: 'physical',
    vendorId: opts.storeId || '',
    categoryId: null,
    currency: (fm.currency ? getPath(raw, fm.currency) : null) ?? null,
    instructions: null,
    description: (fm.description ? getPath(raw, fm.description) : null) ?? null,
    hsnCode: null,
    images: img ? JSON.stringify([img]) : null,
    featuredImage: img ?? null,
    thumbnail: img ?? null,
    keywords: null, link: null, metaTitle: null, metaDescription: null,
    title: String(getPath(raw, fm.title || 'name') ?? getPath(raw, 'title') ?? ''),
    subtitle: null, popularity: 0, rank: 0,
    slug: (fm.slug ? getPath(raw, fm.slug) : null) ?? null,
    expiryDate: null, weight: null, mfgDate: null,
    mrp: num(getPath(raw, fm.mrp || fm.price || 'price')) || price,
    price,
    costPerItem: 0,
    sku: null,
    stock: num(getPath(raw, fm.stock || 'stock')),
    allowBackorder: false, manageInventory: true,
    shippingWeight: null, shippingHeight: null, shippingLen: null, shippingWidth: null,
    height: null, width: null, len: null,
    barcode: null, shippingCost: null, returnAllowed: false, replaceAllowed: false,
    originCountry: null, weightUnit: 'kg', dimensionUnit: 'cm', metadata: null, collectionId: null,
    options: [], variants: []
  }
}

export function mapCategoryGeneric(raw: any, fm: FieldMap): Category {
  return {
    id: String(getPath(raw, fm.id || 'id') ?? ''),
    title: String(getPath(raw, fm.title || 'name') ?? ''),
    slug: (fm.slug ? getPath(raw, fm.slug) : null) ?? null,
    parentId: null, description: null, image: null
  }
}
