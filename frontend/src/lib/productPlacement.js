export const HOME_PRODUCT_LIMIT = 6
export const DEFAULT_HOME_PRODUCT_IDS = [2, 101, 102, 103, 104, 105]

export function isHomepageProduct(product) {
  return product.showOnHomepage ?? DEFAULT_HOME_PRODUCT_IDS.includes(product.id)
}

export function isCatalogProduct(product) {
  return product.showInCatalog !== false
}

export function homepageProducts(products) {
  return products.filter(isHomepageProduct).slice(0, HOME_PRODUCT_LIMIT)
}

export function catalogProducts(products) {
  return products.filter(isCatalogProduct)
}
