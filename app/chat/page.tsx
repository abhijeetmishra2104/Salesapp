"use client"

import { useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { ChatShell } from "@/components/chat-shell"
import { AgentTile } from "@/components/agent-tile"
import { useStore } from "@/lib/store"
import { fetchCustomer } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, ShoppingBag } from "lucide-react"

export default function ChatPage() {
  const { state, dispatch } = useStore()

  useEffect(() => {
    if (!state.customer) {
      fetchCustomer("cust_03").then((result) => {
        if (result.success) {
          dispatch({ type: "SET_CUSTOMER", customer: result.data })
        }
      })
    }
  }, [state.customer, dispatch])

  const tierColors: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-slate-400",
    gold: "bg-amber-400",
    platinum: "bg-slate-200",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Chat */}
          <ChatShell />

          {/* Sidebar */}
          <div className="space-y-4 hidden lg:block">
            {/* Customer Profile */}
            {state.customer && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Customer Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{state.customer.name}</span>
                    <Badge className={tierColors[state.customer.loyaltyTier]}>{state.customer.loyaltyTier}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{state.customer.loyaltyPoints.toLocaleString()} points</p>
                    <p>${state.customer.giftCardBalance.toFixed(2)} gift card</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Recent Purchases</p>
                    {state.customer.purchaseHistory
                      ?.slice(0, 2)
                      .map((purchase: { orderId: string; date: string; total: number }) => (
                        <div key={purchase.orderId} className="flex items-center gap-2 text-sm">
                          <ShoppingBag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{purchase.date}</span>
                          <span>${purchase.total}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agent Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Agent Orchestration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(state.agents).map(([key, agent]) => (
                  <AgentTile key={key} agentKey={key} agent={agent} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
