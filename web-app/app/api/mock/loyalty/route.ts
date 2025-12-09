import { NextResponse } from "next/server"
import customersData from "@/mock/customers.json"

const tierDiscounts: Record<string, number> = {
  bronze: 0.05,
  silver: 0.1,
  gold: 0.15,
  platinum: 0.2,
}

const activePromotions = [
  { code: "WEDDING20", discount: 0.2, description: "20% off wedding collection", validCategories: ["heels", "flats"] },
  {
    code: "FREESHIP",
    discount: 0,
    description: "Free shipping on orders over $100",
    freeShipping: true,
    minOrder: 100,
  },
  { code: "LOYALTY2X", discount: 0, description: "Double loyalty points this week", pointsMultiplier: 2 },
]

export async function POST(request: Request) {
  const body = await request.json()
  const { customerId, cartTotal, cartItems, promoCode, active = true } = body

  await new Promise((resolve) => setTimeout(resolve, 250))

  if (!active) {
    return NextResponse.json({
      success: true,
      data: {
        loyaltyDiscount: 0,
        tierDiscount: 0,
        promoDiscount: 0,
        finalTotal: cartTotal,
        message: "Loyalty rules are currently disabled",
      },
    })
  }

  const customer = customersData.find((c) => c.id === customerId)
  if (!customer) {
    return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 })
  }

  const tierDiscount = tierDiscounts[customer.loyaltyTier] || 0
  const tierSavings = cartTotal * tierDiscount

  let promoSavings = 0
  let appliedPromo = null
  if (promoCode) {
    const promo = activePromotions.find((p) => p.code === promoCode.toUpperCase())
    if (promo) {
      promoSavings = cartTotal * promo.discount
      appliedPromo = promo
    }
  }

  const totalDiscount = tierSavings + promoSavings
  const finalTotal = Math.max(0, cartTotal - totalDiscount)

  return NextResponse.json({
    success: true,
    data: {
      customerId,
      tier: customer.loyaltyTier,
      currentPoints: customer.loyaltyPoints,
      giftCardBalance: customer.giftCardBalance,
      tierDiscount: tierSavings,
      tierPercentage: tierDiscount * 100,
      promoDiscount: promoSavings,
      appliedPromo,
      availablePromos: activePromotions,
      totalDiscount,
      originalTotal: cartTotal,
      finalTotal,
      pointsToEarn: Math.floor(finalTotal * 10),
      timestamp: new Date().toISOString(),
    },
  })
}
