import { NextResponse } from "next/server"
import productsData from "@/mock/products.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sku = searchParams.get("sku")
  const category = searchParams.get("category")

  await new Promise((resolve) => setTimeout(resolve, 150))

  let products = [...productsData]

  if (sku) {
    const product = products.find((p) => p.sku === sku)
    if (product) {
      return NextResponse.json({ success: true, data: product })
    }
    return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
  }

  if (category) {
    products = products.filter((p) => p.category === category)
  }

  return NextResponse.json({ success: true, data: products })
}
