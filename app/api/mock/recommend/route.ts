import { NextResponse } from "next/server"
import productsData from "@/mock/products.json"

const intentKeywords: Record<string, string[]> = {
  wedding: ["wedding-collection", "bridal", "elegant"],
  comfort: ["comfortable", "flats", "sneakers"],
  formal: ["heels", "pumps", "evening"],
  casual: ["sneakers", "flats"],
  sale: ["sale"],
}

export async function POST(request: Request) {
  const body = await request.json()
  const { customerId, intent, excludeSkus = [] } = body

  await new Promise((resolve) => setTimeout(resolve, 400))

  let recommendations = [...productsData]

  // Filter by intent keywords
  if (intent) {
    const keywords = Object.entries(intentKeywords)
      .filter(([key]) => intent.toLowerCase().includes(key))
      .flatMap(([, values]) => values)

    if (keywords.length > 0) {
      recommendations = recommendations.filter(
        (p) =>
          p.badges.some((b) => keywords.includes(b)) ||
          keywords.includes(p.category) ||
          keywords.includes(p.subcategory),
      )
    }
  }

  // Exclude already selected SKUs
  recommendations = recommendations.filter((p) => !excludeSkus.includes(p.sku))

  // Sort by rating and limit to 3
  recommendations = recommendations.sort((a, b) => b.rating - a.rating).slice(0, 3)

  return NextResponse.json({
    success: true,
    data: {
      customerId,
      intent,
      recommendations,
      timestamp: new Date().toISOString(),
    },
  })
}
