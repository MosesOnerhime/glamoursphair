import type { Product } from '../types'

export const HOME_PRODUCT_LIMIT: number
export const DEFAULT_HOME_PRODUCT_IDS: number[]
export function isHomepageProduct(product: Product): boolean
export function isCatalogProduct(product: Product): boolean
export function homepageProducts(products: Product[]): Product[]
export function catalogProducts(products: Product[]): Product[]
