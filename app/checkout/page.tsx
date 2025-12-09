"use client"

import { Navigation } from "@/components/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { AgentTile } from "@/components/agent-tile"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutPage() {
  const { state } = useStore()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <CheckoutForm />

            {/* Agent Status Sidebar */}
            <div className="space-y-4 hidden lg:block">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Agent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["payment", "fulfillment", "loyalty", "postPurchase"].map((key) => (
                    <AgentTile key={key} agentKey={key} agent={state.agents[key]} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
