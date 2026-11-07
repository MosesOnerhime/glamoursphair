export const NOVEMBER_SALE = Object.freeze({
  id: 'november-2026',
  name: 'Christmas Sales',
  startsAt: '2026-11-09T00:00:00+01:00',
  endsAt: '2026-11-16T00:00:00+01:00',
  timeZone: 'Africa/Lagos',
  maxDiscountPercent: 50,
  // Legacy selections only, until the database sale-membership migration is applied.
  productIds: [11, 112],
})

export function salePhase(now = new Date()) {
  const time = new Date(now).getTime()
  if (!Number.isFinite(time)) throw new Error('Invalid campaign time.')
  if (time < Date.parse(NOVEMBER_SALE.startsAt)) return 'upcoming'
  return time < Date.parse(NOVEMBER_SALE.endsAt) ? 'active' : 'ended'
}

export function salePrices(priceNgn, originalPriceNgn) {
  const saleKobo = Math.round(priceNgn * 100)
  if (!Number.isFinite(priceNgn) || !Number.isSafeInteger(saleKobo) || saleKobo <= 0) throw new Error('Invalid product price.')
  const comparisonKobo = Math.round(originalPriceNgn * 100)
  const regularKobo = Number.isFinite(originalPriceNgn) && Number.isSafeInteger(comparisonKobo) && comparisonKobo > saleKobo
    ? comparisonKobo : saleKobo
  const savingsKobo = regularKobo - saleKobo
  // Round down to one decimal so the badge never overstates the saved amount.
  const discountPercent = Math.floor(savingsKobo / regularKobo * 1000) / 10
  return { regularKobo, saleKobo, savingsKobo, discountPercent }
}

export function isChristmasSaleProduct(product) {
  if (product.isDeleted) return false
  return product.inChristmasSale ?? (NOVEMBER_SALE.productIds.includes(product.id) && product.showInCatalog !== false)
}

export function saleProducts(products) {
  return products.filter(isChristmasSaleProduct).map(product => {
    const { regularKobo, saleKobo, discountPercent } = salePrices(product.price, product.originalPrice)
    return { ...product, regularPrice: regularKobo / 100,
      originalPrice: regularKobo > saleKobo ? regularKobo / 100 : undefined,
      price: saleKobo / 100, campaignId: NOVEMBER_SALE.id, discountPercent }
  })
}
