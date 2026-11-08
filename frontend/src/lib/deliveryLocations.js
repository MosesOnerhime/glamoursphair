// Shared checkout options; prices are NGN and must stay aligned with server quotes.
export const deliveryLocations = [
  { id: 'abuja', countryCodes: ['NG'], label: 'Abuja', fee: 5000, note: 'Delivery within Abuja' },
  { id: 'within-nigeria', countryCodes: ['NG'], label: 'Within Nigeria', fee: 10000, note: 'Delivery elsewhere in Nigeria' },
  { id: 'uk', countryCodes: ['GB'], label: 'UK', fee: 89000, note: 'Delivery within the United Kingdom' },
  { id: 'usa-canada', countryCodes: ['US', 'CA'], label: 'USA / Canada', fee: 98000, note: 'Delivery to the United States or Canada' },
  { id: 'other-countries', countryCodes: ['*'], label: 'Other countries', fee: 169000, note: 'Delivery to other international destinations' },
  { id: 'pickup', countryCodes: ['NG'], label: 'Pick up at Abuja studio', fee: 0, note: 'Collect from 3rd Floor, Cappador Galaxy Mall, 81 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria' },
]

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const countries = letters.split('').flatMap(first => letters.split('').flatMap(second => {
  const code = `${first}${second}`
  const name = regionNames.of(code)
  return name && name !== code && code !== 'UK' ? [{ code, name }] : []
})).sort((a, b) => a.name.localeCompare(b.name))

export function normalizeCountryCode(countryCode) {
  const value = String(countryCode ?? '').trim().toUpperCase()
  if (['UK', 'UNITED KINGDOM', 'UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND'].includes(value)) return 'GB'
  return value
}

export function deliveryOptionsForCountry(countryCode) {
  const normalizedCode = normalizeCountryCode(countryCode)
  return deliveryLocations.filter(location => location.countryCodes.includes('*')
    ? !['NG', 'GB', 'US', 'CA'].includes(normalizedCode)
    : location.countryCodes.includes(normalizedCode))
}
