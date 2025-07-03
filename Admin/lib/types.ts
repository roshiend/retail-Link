export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  active: boolean
  shop_id: number
  created_at: string
  updated_at: string
}

export interface Shop {
  id: number
  name: string
  domain: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface ProductsResponse {
  products: Product[]
}

export interface SalesData {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  weeklyGrowth: number
} 