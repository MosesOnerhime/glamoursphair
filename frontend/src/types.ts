export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number 
  slug?: string
  tag?: string
  description: string
  whatsapp?: string
  gradient: string
  image?: string
  images?: string[] 
  instagramLink?: string
}

export interface CartItem extends Product {
  qty: number
}
