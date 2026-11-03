export const NOVEMBER_SALE = Object.freeze({
  id: 'november-2026',
  name: 'November Sales',
  startsAt: '2026-11-09T00:00:00+01:00',
  endsAt: '2026-11-16T00:00:00+01:00',
  timeZone: 'Africa/Lagos',
  discountPercent: 20,
  // Current published inventory, selected as replaceable campaign placeholders.
  productIds: [11, 112],
})

export function salePhase(now = new Date()) {
  const time = new Date(now).getTime()
  if (!Number.isFinite(time)) throw new Error('Invalid campaign time.')
  if (time < Date.parse(NOVEMBER_SALE.startsAt)) return 'upcoming'
  return time < Date.parse(NOVEMBER_SALE.endsAt) ? 'active' : 'ended'
}

export function salePrices(priceNgn) {
  const regularKobo = Math.round(priceNgn * 100)
  if (!Number.isSafeInteger(regularKobo) || regularKobo <= 0) throw new Error('Invalid product price.')
  const saleKobo = Math.round(regularKobo * (100 - NOVEMBER_SALE.discountPercent) / 100)
  return { regularKobo, saleKobo, savingsKobo: regularKobo - saleKobo }
}

export function saleProducts(products) {
  const byId = new Map(products.map(product => [product.id, product]))
  return NOVEMBER_SALE.productIds.flatMap(id => {
    const product = byId.get(id)
    if (!product || product.isDeleted || product.showInCatalog === false) return []
    const { regularKobo, saleKobo } = salePrices(product.price)
    return [{ ...product, regularPrice: regularKobo / 100, originalPrice: regularKobo / 100,
      price: saleKobo / 100, campaignId: NOVEMBER_SALE.id, discountPercent: NOVEMBER_SALE.discountPercent }]
  })
}
