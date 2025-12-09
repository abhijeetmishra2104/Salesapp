import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  const {
    amount,
    paymentMethod,
    customerId,
    mode = "success", // success, declined, network-error, delayed
    useGiftCard = false,
    useLoyaltyPoints = false,
    giftCardAmount = 0,
    loyaltyPointsUsed = 0,
  } = body

  // Simulate processing time
  const delay = mode === "delayed" ? 3000 : 800
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (mode === "network-error") {
    return NextResponse.json(
      { success: false, error: "Network timeout. Please try again.", code: "NETWORK_ERROR" },
      { status: 503 },
    )
  }

  if (mode === "declined") {
    return NextResponse.json({
      success: false,
      error: "Payment declined. Please check your card details or try another payment method.",
      code: "CARD_DECLINED",
      data: {
        transactionId: `TXN-${Date.now()}`,
        status: "declined",
        suggestedActions: ["retry", "change-payment", "use-gift-card"],
      },
    })
  }

  // Calculate final amount after gift card and loyalty points
  let finalAmount = amount
  let appliedGiftCard = 0
  let appliedPoints = 0
  let pointsValue = 0

  if (useGiftCard && giftCardAmount > 0) {
    appliedGiftCard = Math.min(giftCardAmount, finalAmount)
    finalAmount -= appliedGiftCard
  }

  if (useLoyaltyPoints && loyaltyPointsUsed > 0) {
    pointsValue = loyaltyPointsUsed * 0.01 // 1 point = $0.01
    appliedPoints = Math.min(pointsValue, finalAmount)
    finalAmount -= appliedPoints
  }

  return NextResponse.json({
    success: true,
    data: {
      transactionId: `TXN-${Date.now()}`,
      status: "approved",
      originalAmount: amount,
      giftCardApplied: appliedGiftCard,
      loyaltyPointsApplied: appliedPoints,
      loyaltyPointsUsed: Math.floor(appliedPoints / 0.01),
      finalAmount,
      paymentMethod,
      customerId,
      timestamp: new Date().toISOString(),
      earnedPoints: Math.floor(finalAmount * 10), // 10 points per dollar
    },
  })
}
