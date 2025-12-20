import { NextResponse } from "next/server"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      sessionId = body.sessionId || crypto.randomUUID(),
      customerId,
      cart,
      userProfile = {},
    } = body

    // Call FastAPI Recommendation Agent
    console.log("Fetching recommendations from backend...")
    const res = await fetch(`${BACKEND_BASE_URL}/api/recommendations/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        customerId,
        cart,
        userProfile,
      }),
    })

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`)
    }

    const data = await res.json()

    return NextResponse.json({
      success: data.status === "success",
      data: {
        customerId,
        recommendations: data.recommendations,
        timestamp: new Date().toISOString(),
      },
      errors: data.errors || [],
    })
  } catch (error: any) {
    console.error("Recommendation API error:", error)

    return NextResponse.json(
      {
        success: false,
        data: null,
        errors: [
          {
            code: "RECOMMENDATION_FAILED",
            message: error.message || "Failed to fetch recommendations",
          },
        ],
      },
      { status: 500 },
    )
  }
}
