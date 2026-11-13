export interface ShareableProduct { id: number; slug?: string | null }
export function createProductUrl(product: ShareableProduct, pathname?: string): string
export function findProductForUrl<T extends ShareableProduct>(products: T[], search: URLSearchParams | string): T | null
