import { NextResponse } from "next/server"
import inventoryData from "@/mock/inventory.json"

export async function POST(request: Request) {
  const body = await request.json()
  const { orderId, items, fulfillmentType, storeId, preferredDate } = body

  await new Promise((resolve) => setTimeout(resolve, 350))

  const store = storeId ? inventoryData.stores.find((s) => s.id === storeId) : null

  // Generate available slots
  const today = new Date()
  const slots = []

  if (fulfillmentType === "pickup") {
    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      slots.push({
        date: date.toISOString().split("T")[0],
        times: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
      })
    }
  } else {
    for (let i = 2; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      slots.push({
        date: date.toISOString().split("T")[0],
        times: ["9:00 AM - 12:00 PM", "12:00 PM - 5:00 PM", "5:00 PM - 9:00 PM"],
      })
    }
  }

  // If preferred date provided, schedule it
  let scheduledSlot = null
  if (preferredDate) {
    scheduledSlot = {
      date: preferredDate.date,
      time: preferredDate.time,
      confirmationCode: `CONF-${Date.now().toString(36).toUpperCase()}`,
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      orderId,
      fulfillmentType,
      store: store || null,
      availableSlots: slots,
      scheduledSlot,
      estimatedReady: fulfillmentType === "pickup" ? "2 hours" : "2-5 business days",
      items,
      timestamp: new Date().toISOString(),
    },
  })
}
