const storefrontOrigin = 'https://www.glamoursphairluxury.com'

export function createProductUrl(product, pathname = '/') {
  const url = new URL(pathname, storefrontOrigin)
  url.searchParams.set('product', product.slug || String(product.id))
  url.searchParams.set('productId', String(product.id))
  return url.toString()
}

export function findProductForUrl(products, search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search)
  const productId = params.get('productId')
  if (productId) {
    const byId = products.find(product => String(product.id) === productId)
    if (byId) return byId
  }

  const product = params.get('product')
  if (!product) return null
  return products.find(item => item.slug === product || String(item.id) === product) ?? null
}
