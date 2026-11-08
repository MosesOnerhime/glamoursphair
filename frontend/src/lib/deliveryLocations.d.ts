export interface DeliveryLocation {
  id: string; countryCodes: string[]; label: string; fee: number; note: string
}
export interface DeliveryCountry { code: string; name: string }
export const deliveryLocations: DeliveryLocation[]
export const countries: DeliveryCountry[]
export function normalizeCountryCode(countryCode: string): string
export function deliveryOptionsForCountry(countryCode: string): DeliveryLocation[]
