import type { Product } from '../types'

export type SalePhase = 'upcoming' | 'active' | 'ended'
export interface SaleProduct extends Product {
  regularPrice: number
  campaignId: string
  discountPercent: number
}
export const NOVEMBER_SALE: {
  readonly id: string; readonly name: string; readonly startsAt: string; readonly endsAt: string
  readonly timeZone: string; readonly maxDiscountPercent: number; readonly productIds: number[]
}
export function salePhase(now?: Date | string | number): SalePhase
export function salePrices(priceNgn: number, originalPriceNgn?: number): { regularKobo: number; saleKobo: number; savingsKobo: number; discountPercent: number }
export function saleProducts(products: Product[]): SaleProduct[]
export function isChristmasSaleProduct(product: Product & { isDeleted?: boolean }): boolean
