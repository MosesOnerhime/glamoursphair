import type { SalePhase, SaleProduct } from './novemberSale.js'
import type { NOVEMBER_SALE } from './novemberSale.js'

export interface SaleBagItem { id: number; qty: number }
export interface SaleSnapshot {
  campaign: typeof NOVEMBER_SALE
  phase: SalePhase
  serverTime: string
  products: SaleProduct[]
  paymentReady: boolean
}
export interface SaleQuote {
  currency: 'NGN'
  items: { id: number; name: string; slug?: string; image?: string; qty: number; regularKobo: number; unitKobo: number; lineKobo: number }[]
  subtotalKobo: number
  savingsKobo: number
  deliveryFeeKobo: number
  totalKobo: number
  deliveryLabel: string
}
export interface SaleCustomer { name: string; email: string; phone: string }
export interface SaleShipping {
  countryCode: string; countryName: string; address: string; city: string; state: string; deliveryLocationId: string
  deliveryNote: string; isGift: boolean; recipientName: string; recipientPhone: string
}
export interface SalePaymentSession {
  reference: string; accessCode: string; authorizationUrl: string; verificationToken: string; quote: SaleQuote
}
export interface SaleVerification {
  verified: boolean; status: string; reference: string
  order?: { campaignId: string; reference: string; createdAt: string; customer: SaleCustomer; shipping: SaleShipping & { country: string }; quote: SaleQuote }
}

const API = import.meta.env.VITE_SALES_API_URL ?? '/api/sales'
export const SALE_BAG_KEY = 'glamoursphair_november_2026_bag'
export const SALE_PAYMENT_KEY = 'glamoursphair_november_2026_payment'
export const money = (ngn: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: Number.isInteger(ngn) ? 0 : 2 }).format(ngn)
export const koboMoney = (kobo: number) => money(kobo / 100)

export function readSaleBag(): SaleBagItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SALE_BAG_KEY) || '[]')
    if (!Array.isArray(value)) return []
    const unique = new Map<number, SaleBagItem>()
    for (const item of value) {
      if (item && Number.isSafeInteger(item.id) && item.id > 0 && Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= 20) {
        unique.set(item.id, { id: item.id, qty: item.qty })
      }
    }
    return [...unique.values()].slice(0, 20)
  } catch { return [] }
}

export function readSalePayment(): SalePaymentSession | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(SALE_PAYMENT_KEY) || 'null') as SalePaymentSession | null
    if (!value || !/^GLAM-NOV-[a-f0-9-]{36}$/.test(value.reference) || !/^[a-f0-9]{64}$/.test(value.verificationToken) ||
      typeof value.accessCode !== 'string' || !value.accessCode || !/^https:\/\/checkout\.paystack\.com\//.test(value.authorizationUrl) ||
      !Number.isSafeInteger(value.quote?.totalKobo) || value.quote.totalKobo <= 0 || value.quote.currency !== 'NGN' ||
      !Array.isArray(value.quote.items) || !value.quote.items.length || !value.quote.items.every(item =>
        item && Number.isSafeInteger(item.id) && typeof item.name === 'string' && Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= 20 &&
        Number.isSafeInteger(item.unitKobo) && item.unitKobo > 0 && item.lineKobo === item.unitKobo * item.qty)) return null
    return value
  } catch { return null }
}

async function request<T>(init?: RequestInit): Promise<T> {
  const response = await fetch(API, { ...init, signal: init?.signal ?? AbortSignal.timeout(25000), cache: 'no-store', headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = await response.json().catch(() => null) as (T & { error?: string }) | null
  if (!response.ok || !data) throw new Error(data?.error || 'The sale service is unavailable. Please try again.')
  return data
}
export const fetchSale = (signal?: AbortSignal) => request<SaleSnapshot>({ signal })
export const initializeSalePayment = (items: SaleBagItem[], customer: SaleCustomer, shipping: SaleShipping, expectedAmountKobo: number) =>
  request<SalePaymentSession>({ method: 'POST', body: JSON.stringify({ action: 'initialize', items, customer, shipping, expectedAmountKobo }) })
export const verifySalePayment = (session: SalePaymentSession) => request<SaleVerification>({
  method: 'POST', body: JSON.stringify({ action: 'verify', reference: session.reference, verificationToken: session.verificationToken }),
})
