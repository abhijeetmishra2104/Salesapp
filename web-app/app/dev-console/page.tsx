"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AgentTile } from "@/components/agent-tile"
import { Settings, Activity, Database, Play, RotateCcw, ChevronRight, Clock } from 'lucide-react'
import {
  fetchCustomer,
  getRecommendations,
  fetchInventory,
  processPayment,
  scheduleFulfillment,
  getLoyaltyInfo,
} from "@/lib/api"

const demoSteps = [
  { step: 1, description: "Customer cust_03 (Emma) starts on Mobile Chat asking about wedding shoes" },
  { step: 2, description: "Recommendation Agent returns 3 curated SKUs" },
  { step: 3, description: "User selects SKU-HEEL-001 (Crystal Elegance Stilettos)" },
  { step: 4, description: "Switch to In-store Kiosk — conversation preserved" },
  { step: 5, description: "Inventory Agent shows low stock online, available at Store #2" },
  { step: 6, description: 'User selects "Reserve in-store"' },
  { step: 7, description: "Payment attempt with simulated decline" },
  { step: 8, description: "Fallback: apply loyalty points & gift card" },
  { step: 9, description: "Payment success" },
  { step: 10, description: "Fulfillment Agent schedules pickup slot" },
  { step: 11, description: "Post-Purchase Agent sends confirmation" },
]

export default function DevConsolePage() {
  const { state, dispatch } = useStore()
  const [demoRunning, setDemoRunning] = useState(false)
  const [currentDemoStep, setCurrentDemoStep] = useState(0)

  const updateMockSetting = (key: string, value: unknown) => {
    dispatch({ type: "SET_MOCK_SETTINGS", settings: { [key]: value } })
  }

  const resetState = () => {
    dispatch({ type: "RESET_STATE" })
    fetchCustomer("cust_03").then((result) => {
      if (result.success) {
        dispatch({ type: "SET_CUSTOMER", customer: result.data })
      }
    })
  }

  const runScriptedDemo = async () => {
    setDemoRunning(true)
    setCurrentDemoStep(0)

    // Reset state first
    dispatch({ type: "RESET_STATE" })

    // Load customer
    const customerResult = await fetchCustomer("cust_03")
    if (customerResult.success) {
      dispatch({ type: "SET_CUSTOMER", customer: customerResult.data })
    }

    // Step 1: Set channel to mobile
    setCurrentDemoStep(1)
    dispatch({ type: "SET_CHANNEL", channel: "mobile-chat" })
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-1",
        role: "user",
        content: "Hi! I'm shopping for wedding shoes",
        timestamp: new Date().toISOString(),
        channel: "mobile-chat",
      },
    })
    await new Promise((r) => setTimeout(r, 1000))

    // Step 2: Recommendation Agent
    setCurrentDemoStep(2)
    dispatch({ type: "UPDATE_AGENT", name: "recommendation", state: { status: "running" } })
    const recResult = await getRecommendations("cust_03", "wedding shoes", [])
    dispatch({
      type: "UPDATE_AGENT",
      name: "recommendation",
      state: { status: "success", lastResult: recResult as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "recommendation", action: "completed", result: recResult },
    })

    if (recResult.success) {
      const recs = recResult.data.recommendations
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: "demo-2",
          role: "agent",
          content: `Perfect choice! For your wedding, I recommend:\n\n• ${recs[0].name} - $${recs[0].salePrice || recs[0].price}\n• ${recs[1].name} - $${recs[1].salePrice || recs[1].price}\n• ${recs[2].name} - $${recs[2].salePrice || recs[2].price}\n\nWould you like to see any of these?`,
          timestamp: new Date().toISOString(),
          channel: "mobile-chat",
          agentInvoked: "recommendation",
        },
      })
    }
    await new Promise((r) => setTimeout(r, 1500))

    // Step 3: User selects first item
    setCurrentDemoStep(3)
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-3",
        role: "user",
        content: "I love the Crystal Elegance Stilettos! Add to cart please.",
        timestamp: new Date().toISOString(),
        channel: "mobile-chat",
      },
    })
    dispatch({
      type: "ADD_TO_CART",
      item: {
        sku: "SKU-HEEL-001",
        name: "Crystal Elegance Stilettos",
        price: 159.99,
        quantity: 1,
        size: "7",
        image: "/crystal-stiletto-heels.jpg",
      },
    })
    await new Promise((r) => setTimeout(r, 1000))

    // Step 4: Switch to kiosk
    setCurrentDemoStep(4)
    dispatch({ type: "SET_CHANNEL", channel: "kiosk" })
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-4",
        role: "system",
        content: "Channel switched to In-store Kiosk. Your conversation and cart have been preserved.",
        timestamp: new Date().toISOString(),
        channel: "kiosk",
      },
    })
    await new Promise((r) => setTimeout(r, 1000))

    setCurrentDemoStep(5)
    dispatch({ type: "SET_MOCK_SETTINGS", settings: { inventoryMode: "low-stock" } })
    dispatch({ type: "UPDATE_AGENT", name: "inventory", state: { status: "running" } })
    
    const invResult = await fetchInventory("SKU-HEEL-001", "low-stock")
    console.log("[v0] Inventory result:", invResult)
    
    dispatch({
      type: "UPDATE_AGENT",
      name: "inventory",
      state: { status: "success", lastResult: invResult as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "inventory", action: "completed", result: invResult },
    })

    const onlineStock = invResult.data?.onlineStock ?? 2
    const store002Stock = invResult.data?.inventory?.store_002 ?? 12
    const storeName = invResult.data?.storesWithStock?.find((s: { id: string }) => s.id === "store_002")?.name ?? "Mall of America"
    
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-5",
        role: "agent",
        content: `⚠️ This item is running low online (only ${onlineStock} left). However, I found ${store002Stock} pairs available at ${storeName} (Store #2). Would you like to reserve for in-store pickup?`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "inventory",
      },
    })
    await new Promise((r) => setTimeout(r, 1500))

    // Step 6: Reserve in-store
    setCurrentDemoStep(6)
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-6",
        role: "user",
        content: "Yes, reserve at Store #2 please!",
        timestamp: new Date().toISOString(),
        channel: "kiosk",
      },
    })
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-6b",
        role: "agent",
        content: `Great! I've reserved the Crystal Elegance Stilettos at ${storeName}. Let's proceed to checkout.`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "inventory",
      },
    })
    await new Promise((r) => setTimeout(r, 1000))

    setCurrentDemoStep(7)
    dispatch({ type: "SET_MOCK_SETTINGS", settings: { paymentMode: "declined" } })
    dispatch({ type: "UPDATE_AGENT", name: "payment", state: { status: "running" } })
    
    // Small delay to ensure mock settings are applied
    await new Promise((r) => setTimeout(r, 100))
    
    const payResult1 = await processPayment({
      amount: 159.99,
      paymentMethod: "saved-card",
      customerId: "cust_03",
      mode: "declined",
    })
    console.log("[v0] Payment decline result:", payResult1)
    
    dispatch({
      type: "UPDATE_AGENT",
      name: "payment",
      state: { status: "error", lastResult: payResult1 as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "payment", action: "failed", result: payResult1 },
    })

    const customerGiftCard = customerResult.data?.giftCardBalance ?? 50
    const customerPoints = customerResult.data?.loyaltyPoints ?? 2100
    const pointsValue = (customerPoints * 0.01).toFixed(2)
    
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-7",
        role: "agent",
        content: `❌ Payment declined. Don't worry! I can help.\n\nYou have:\n• $${customerGiftCard.toFixed(2)} gift card balance\n• ${customerPoints.toLocaleString()} loyalty points ($${pointsValue} value)\n\nWould you like to apply these to complete your purchase?`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "payment",
      },
    })
    await new Promise((r) => setTimeout(r, 1500))

    // Step 8: Apply fallback
    setCurrentDemoStep(8)
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-8",
        role: "user",
        content: "Yes, use my gift card and loyalty points!",
        timestamp: new Date().toISOString(),
        channel: "kiosk",
      },
    })

    dispatch({ type: "UPDATE_AGENT", name: "loyalty", state: { status: "running" } })
    const loyaltyResult = await getLoyaltyInfo({
      customerId: "cust_03",
      cartTotal: 159.99,
      cartItems: [{ sku: "SKU-HEEL-001" }],
    })
    dispatch({
      type: "UPDATE_AGENT",
      name: "loyalty",
      state: { status: "success", lastResult: loyaltyResult as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "loyalty", action: "completed", result: loyaltyResult },
    })
    await new Promise((r) => setTimeout(r, 1000))

    // Step 9: Payment success
    setCurrentDemoStep(9)
    dispatch({ type: "SET_MOCK_SETTINGS", settings: { paymentMode: "success" } })
    dispatch({ type: "UPDATE_AGENT", name: "payment", state: { status: "running" } })
    
    const payResult2 = await processPayment({
      amount: 159.99,
      paymentMethod: "saved-card",
      customerId: "cust_03",
      mode: "success",
      useGiftCard: true,
      useLoyaltyPoints: true,
      giftCardAmount: customerGiftCard,
      loyaltyPointsUsed: customerPoints,
    })
    console.log("[v0] Payment success result:", payResult2)
    
    dispatch({
      type: "UPDATE_AGENT",
      name: "payment",
      state: { status: "success", lastResult: payResult2 as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "payment", action: "completed", result: payResult2 },
    })

    const originalAmount = payResult2.data?.originalAmount ?? 159.99
    const giftCardApplied = payResult2.data?.giftCardApplied ?? customerGiftCard
    const loyaltyApplied = payResult2.data?.loyaltyPointsApplied ?? (customerPoints * 0.01)
    const tierDiscount = (originalAmount - giftCardApplied - loyaltyApplied) * 0.1 // 10% silver discount
    const finalAmount = payResult2.data?.finalAmount ?? (originalAmount - giftCardApplied - loyaltyApplied - tierDiscount)
    const earnedPoints = payResult2.data?.earnedPoints ?? Math.floor(finalAmount * 10)

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-9",
        role: "agent",
        content: `✅ Payment successful!\n\nOriginal: $${originalAmount.toFixed(2)}\nGift Card: -$${giftCardApplied.toFixed(2)}\nLoyalty Points: -$${loyaltyApplied.toFixed(2)}\n\nTotal Paid: $${finalAmount.toFixed(2)}\n\nYou earned ${earnedPoints.toLocaleString()} new points!`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "payment",
      },
    })
    await new Promise((r) => setTimeout(r, 1500))

    // Step 10: Fulfillment
    setCurrentDemoStep(10)
    dispatch({ type: "UPDATE_AGENT", name: "fulfillment", state: { status: "running" } })
    const fulfillResult = await scheduleFulfillment({
      orderId: payResult2.data?.transactionId || "DEMO-ORDER",
      items: [{ sku: "SKU-HEEL-001", quantity: 1 }],
      fulfillmentType: "pickup",
      storeId: "store_002",
      preferredDate: { date: new Date(Date.now() + 86400000).toISOString().split("T")[0], time: "2:00 PM" },
    })
    dispatch({
      type: "UPDATE_AGENT",
      name: "fulfillment",
      state: { status: "success", lastResult: fulfillResult as Record<string, unknown> },
    })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: { timestamp: new Date().toISOString(), agent: "fulfillment", action: "completed", result: fulfillResult },
    })

    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-10",
        role: "agent",
        content: `🎉 Pickup scheduled!\n\n📍 ${storeName}\n📅 ${fulfillResult.data?.scheduledSlot?.date} at ${fulfillResult.data?.scheduledSlot?.time}\n🔑 Confirmation: ${fulfillResult.data?.scheduledSlot?.confirmationCode}\n\nWe'll notify the store staff when you arrive!`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "fulfillment",
      },
    })
    await new Promise((r) => setTimeout(r, 1500))

    // Step 11: Post-purchase
    setCurrentDemoStep(11)
    dispatch({ type: "UPDATE_AGENT", name: "postPurchase", state: { status: "running" } })
    await new Promise((r) => setTimeout(r, 800))
    dispatch({ type: "UPDATE_AGENT", name: "postPurchase", state: { status: "success" } })
    dispatch({
      type: "ADD_ACTIVITY",
      entry: {
        timestamp: new Date().toISOString(),
        agent: "postPurchase",
        action: "completed",
        result: { emailSent: true, smsSent: true },
      },
    })

    const customerEmail = customerResult.data?.email ?? "emma.w@email.com"
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: "demo-11",
        role: "agent",
        content: `📧 Confirmation sent to ${customerEmail}\n📱 SMS notification enabled\n\nThank you for shopping with Birla OneAI! Is there anything else I can help you with?`,
        timestamp: new Date().toISOString(),
        channel: "kiosk",
        agentInvoked: "postPurchase",
      },
    })

    setDemoRunning(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Dev Console</h1>
            <p className="text-muted-foreground">Toggle mock API behaviors and inspect state</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetState} className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reset State
            </Button>
            <Button onClick={runScriptedDemo} disabled={demoRunning} className="gap-2">
              <Play className="h-4 w-4" />
              {demoRunning ? "Running Demo..." : "Run Scripted Demo"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="controls" className="space-y-4">
          <TabsList>
            <TabsTrigger value="controls" className="gap-2">
              <Settings className="h-4 w-4" />
              Mock Controls
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="state" className="gap-2">
              <Database className="h-4 w-4" />
              Session State
            </TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Inventory Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inventory Response</CardTitle>
                  <CardDescription>Control stock levels in API responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={state.mockSettings.inventoryMode}
                    onValueChange={(v) => updateMockSetting("inventoryMode", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock (1-2 units)</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Payment Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Response</CardTitle>
                  <CardDescription>Simulate payment outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={state.mockSettings.paymentMode}
                    onValueChange={(v) => updateMockSetting("paymentMode", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="network-error">Network Error</SelectItem>
                      <SelectItem value="delayed">Delayed (3s)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Loyalty Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Loyalty Rules</CardTitle>
                  <CardDescription>Toggle loyalty discounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loyalty-toggle">Active</Label>
                    <Switch
                      id="loyalty-toggle"
                      checked={state.mockSettings.loyaltyActive}
                      onCheckedChange={(v) => updateMockSetting("loyaltyActive", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Script */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scripted Demo Flow</CardTitle>
                <CardDescription>The demo will execute these steps automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {demoSteps.map((step) => (
                    <div
                      key={step.step}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        currentDemoStep === step.step
                          ? "bg-primary/10 text-primary"
                          : currentDemoStep > step.step
                            ? "text-muted-foreground"
                            : ""
                      }`}
                    >
                      <Badge
                        variant={currentDemoStep >= step.step ? "default" : "outline"}
                        className="w-6 h-6 p-0 flex items-center justify-center"
                      >
                        {step.step}
                      </Badge>
                      <span className="text-sm flex-1">{step.description}</span>
                      {currentDemoStep === step.step && demoRunning && (
                        <ChevronRight className="h-4 w-4 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid lg:grid-cols-[1fr_300px] gap-4">
              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {state.activityLog.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No activity yet. Start chatting or run the demo!
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {state.activityLog.map((entry, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <div className="flex flex-col items-center">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div className="w-px flex-1 bg-border" />
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {entry.agent}
                                </Badge>
                                <span className={entry.action === "completed" ? "text-emerald-600" : "text-red-600"}>
                                  {entry.action}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              {entry.result && (
                                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                  {JSON.stringify(entry.result, null, 2).slice(0, 200)}...
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Agent Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Agent Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(state.agents).map(([key, agent]) => (
                    <AgentTile key={key} agentKey={key} agent={agent} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="state">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Session State</CardTitle>
                <CardDescription>Raw JSON view of the application state</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(
                      {
                        currentChannel: state.currentChannel,
                        customer: state.customer,
                        cart: state.cart,
                        messagesCount: state.messages.length,
                        mockSettings: state.mockSettings,
                        currentOrder: state.currentOrder,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
