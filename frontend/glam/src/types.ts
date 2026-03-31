export interface Product {
  id: number
  name: string
  price: number
  tag?: string
  description: string
  whatsapp?: string
  gradient: string
}

export interface CartItem extends Product {
  qty: number
}