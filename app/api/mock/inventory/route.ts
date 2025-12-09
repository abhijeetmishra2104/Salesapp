import { NextResponse } from "next/server"
import inventoryData from "@/mock/inventory.json"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sku = searchParams.get("sku")
  const mode = searchParams.get("mode") || "normal" // normal, low-stock, out-of-stock

  await new Promise((resolve) => setTimeout(resolve, 300))

  const stores = inventoryData.stores

  const inventory: Record<string, Record<string, number>> = JSON.parse(JSON.stringify(inventoryData.inventory))

  // Apply mock mode overrides
  if (mode === "low-stock") {
    Object.keys(inventory).forEach((key) => {
      const item = inventory[key]
      if (typeof item === "object" && item.online !== undefined) {
        item.online = Math.min(item.online, 2) // Low online stock
        // Store inventory stays normal - this is the key demo point
      }
    })
  } else if (mode === "out-of-stock") {
    Object.keys(inventory).forEach((key) => {
      const item = inventory[key]
      if (typeof item === "object") {
        Object.keys(item).forEach((loc) => {
          item[loc] = 0
        })
      }
    })
  }

  if (sku) {
    const skuInventory = inventory[sku]
    if (skuInventory) {
      const storesWithStock = stores
        .filter((store) => (skuInventory[store.id] || 0) > 0)
        .map((store) => ({
          ...store,
          quantity: skuInventory[store.id] || 0,
        }))

      return NextResponse.json({
        success: true,
        data: {
          sku,
          inventory: skuInventory,
          stores,
          storesWithStock,
          onlineStock: skuInventory.online || 0,
          totalStoreStock: Object.entries(skuInventory)
            .filter(([key]) => key !== "online")
            .reduce((sum, [, qty]) => sum + qty, 0),
        },
      })
    }
    return NextResponse.json({ success: false, error: "SKU not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: { stores, inventory },
  })
}
