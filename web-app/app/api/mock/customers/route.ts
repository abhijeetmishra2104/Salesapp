import { NextResponse } from "next/server"
import customersData from "@/mock/customers.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("id")

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (customerId) {
    const customer = customersData.find((c) => c.id === customerId)
    if (customer) {
      return NextResponse.json({ success: true, data: customer })
    }
    return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: customersData })
}
