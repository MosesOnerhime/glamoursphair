export function initialHomepageSection(location, navigationType) {
  if (location.pathname !== '/' || navigationType === 'back_forward') return null
  const params = new URLSearchParams(location.search)
  if (params.has('product') || params.has('admin')) return null
  if (!location.hash) return 'collection'
  const section = location.hash.slice(1)
  return ['home', 'collection', 'about', 'shopping-support', 'contact', 'main-content'].includes(section) ? section : null
}
