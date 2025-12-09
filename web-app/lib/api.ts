// Client-side API helpers

export async function fetchCustomer(customerId: string) {
  const res = await fetch(`/api/mock/customers?id=${customerId}`)
  return res.json()
}

export async function fetchProducts(category?: string) {
  const url = category ? `/api/mock/products?category=${category}` : "/api/mock/products"
  const res = await fetch(url)
  return res.json()
}

export async function fetchProduct(sku: string) {
  const res = await fetch(`/api/mock/products?sku=${sku}`)
  return res.json()
}

export async function fetchInventory(sku: string, mode = "normal") {
  const res = await fetch(`/api/mock/inventory?sku=${sku}&mode=${mode}`)
  return res.json()
}

export async function getRecommendations(customerId: string, intent: string, excludeSkus: string[] = []) {
  const res = await fetch("/api/mock/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, intent, excludeSkus }),
  })
  return res.json()
}

export async function processPayment(payload: {
  amount: number
  paymentMethod: string
  customerId: string
  mode?: string
  useGiftCard?: boolean
  useLoyaltyPoints?: boolean
  giftCardAmount?: number
  loyaltyPointsUsed?: number
}) {
  const res = await fetch("/api/mock/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function scheduleFulfillment(payload: {
  orderId: string
  items: Array<{ sku: string; quantity: number }>
  fulfillmentType: "pickup" | "delivery"
  storeId?: string
  preferredDate?: { date: string; time: string }
}) {
  const res = await fetch("/api/mock/fulfillment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function getLoyaltyInfo(payload: {
  customerId: string
  cartTotal: number
  cartItems: Array<{ sku: string }>
  promoCode?: string
  active?: boolean
}) {
  const res = await fetch("/api/mock/loyalty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return res.json()
}
