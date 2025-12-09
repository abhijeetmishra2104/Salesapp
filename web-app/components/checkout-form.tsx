"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { processPayment, getLoyaltyInfo, scheduleFulfillment } from "@/lib/api"
import { CreditCard, Wallet, Gift, Loader2, CheckCircle, XCircle, AlertTriangle, Truck, Store } from "lucide-react"
import { cn } from "@/lib/utils"

export function CheckoutForm() {
  const { state, dispatch } = useStore()
  const [paymentMethod, setPaymentMethod] = useState("saved-card")
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery")
  const [useGiftCard, setUseGiftCard] = useState(false)
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<"success" | "declined" | "error" | null>(null)
  const [loyaltyData, setLoyaltyData] = useState<Record<string, unknown> | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)

  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const fetchLoyalty = async () => {
    if (!state.customer) return

    const result = await getLoyaltyInfo({
      customerId: state.customer.id,
      cartTotal,
      cartItems: state.cart.map((i) => ({ sku: i.sku })),
      promoCode,
      active: state.mockSettings.loyaltyActive,
    })

    if (result.success) {
      setLoyaltyData(result.data)
    }
  }

  const handlePayment = async () => {
    if (!state.customer) return

    setIsProcessing(true)
    setPaymentResult(null)

    dispatch({
      type: "UPDATE_AGENT",
      name: "payment",
      state: { status: "running", timestamp: new Date().toISOString() },
    })

    const giftCardAmount = useGiftCard ? state.customer.giftCardBalance || 0 : 0
    const loyaltyPointsUsed = useLoyaltyPoints ? state.customer.loyaltyPoints || 0 : 0

    const result = await processPayment({
      amount: cartTotal - (loyaltyData as Record<string, number> | null)?.totalDiscount || 0,
      paymentMethod,
      customerId: state.customer.id,
      mode: state.mockSettings.paymentMode,
      useGiftCard,
      useLoyaltyPoints,
      giftCardAmount,
      loyaltyPointsUsed,
    })

    const duration = 800

    if (result.success) {
      dispatch({ type: "UPDATE_AGENT", name: "payment", state: { status: "success", lastResult: result, duration } })
      setPaymentResult("success")

      // Schedule fulfillment
      dispatch({ type: "UPDATE_AGENT", name: "fulfillment", state: { status: "running" } })

      const fulfillmentResult = await scheduleFulfillment({
        orderId: result.data.transactionId,
        items: state.cart.map((i) => ({ sku: i.sku, quantity: i.quantity })),
        fulfillmentType,
        storeId: fulfillmentType === "pickup" ? "store_002" : undefined,
        preferredDate: selectedSlot || undefined,
      })

      if (fulfillmentResult.success) {
        dispatch({
          type: "UPDATE_AGENT",
          name: "fulfillment",
          state: { status: "success", lastResult: fulfillmentResult },
        })

        // Create order
        dispatch({
          type: "SET_ORDER",
          order: {
            id: result.data.transactionId,
            items: [...state.cart],
            total: result.data.finalAmount,
            status: "confirmed",
            fulfillmentType,
            scheduledSlot: fulfillmentResult.data.scheduledSlot,
            createdAt: new Date().toISOString(),
          },
        })

        dispatch({ type: "CLEAR_CART" })

        // Post-purchase agent
        dispatch({ type: "UPDATE_AGENT", name: "postPurchase", state: { status: "running" } })
        setTimeout(() => {
          dispatch({ type: "UPDATE_AGENT", name: "postPurchase", state: { status: "success" } })
        }, 1000)
      }
    } else {
      dispatch({ type: "UPDATE_AGENT", name: "payment", state: { status: "error", lastResult: result, duration } })
      setPaymentResult(result.code === "NETWORK_ERROR" ? "error" : "declined")
    }

    setIsProcessing(false)
  }

  if (state.cart.length === 0 && !state.currentOrder) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-muted-foreground">Add some items to proceed with checkout</p>
        </CardContent>
      </Card>
    )
  }

  if (state.currentOrder) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
            Order Confirmed!
          </CardTitle>
          <CardDescription>Order ID: {state.currentOrder.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium">
              {state.currentOrder.fulfillmentType === "pickup" ? "Pickup Details" : "Delivery Details"}
            </p>
            {state.currentOrder.scheduledSlot && (
              <p className="text-sm text-muted-foreground">
                Scheduled: {state.currentOrder.scheduledSlot.date} at {state.currentOrder.scheduledSlot.time}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Confirmation: {state.currentOrder.scheduledSlot?.confirmationCode}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Items:</p>
            {state.currentOrder.items.map((item) => (
              <div key={item.sku} className="flex justify-between text-sm">
                <span>
                  {item.name} {item.size && `(Size ${item.size})`}
                </span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total Paid</span>
              <span>${state.currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-transparent"
            variant="outline"
            onClick={() => dispatch({ type: "SET_ORDER", order: null })}
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cart Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.cart.map((item) => (
            <div key={`${item.sku}-${item.size}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded bg-muted" />
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size && `Size ${item.size} • `}Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          {loyaltyData && (
            <>
              {(loyaltyData as Record<string, number>).tierDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    {(loyaltyData as Record<string, string>).tier} Discount (
                    {(loyaltyData as Record<string, number>).tierPercentage}%)
                  </span>
                  <span>-${(loyaltyData as Record<string, number>).tierDiscount.toFixed(2)}</span>
                </div>
              )}
              {(loyaltyData as Record<string, number>).promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Promo Discount</span>
                  <span>-${(loyaltyData as Record<string, number>).promoDiscount.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${((loyaltyData as Record<string, number> | null)?.finalTotal ?? cartTotal).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fulfillment Type */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Method</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={fulfillmentType} onValueChange={(v) => setFulfillmentType(v as "delivery" | "pickup")}>
            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                fulfillmentType === "delivery" && "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                <Truck className="h-5 w-5" />
                <div>
                  <p className="font-medium">Ship to Home</p>
                  <p className="text-sm text-muted-foreground">2-5 business days</p>
                </div>
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors mt-2",
                fulfillmentType === "pickup" && "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                <Store className="h-5 w-5" />
                <div>
                  <p className="font-medium">Store Pickup</p>
                  <p className="text-sm text-muted-foreground">Ready in 2 hours</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            {state.customer?.savedCards?.map((card) => (
              <div
                key={card.last4}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                  paymentMethod === "saved-card" && "border-primary bg-primary/5",
                )}
              >
                <RadioGroupItem value="saved-card" id="saved-card" />
                <Label htmlFor="saved-card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-5 w-5" />
                  {card.brand} •••• {card.last4} (exp {card.expiry})
                </Label>
              </div>
            ))}
            <div
              className={cn(
                "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors",
                paymentMethod === "upi" && "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                <Wallet className="h-5 w-5" />
                UPI / Digital Wallet
              </Label>
            </div>
          </RadioGroup>

          <Separator />

          {/* Gift Card & Loyalty Points */}
          {state.customer && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gift Card Balance</p>
                    <p className="text-xs text-muted-foreground">
                      ${state.customer.giftCardBalance.toFixed(2)} available
                    </p>
                  </div>
                </div>
                <Switch
                  checked={useGiftCard}
                  onCheckedChange={setUseGiftCard}
                  disabled={state.customer.giftCardBalance === 0}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Use Loyalty Points</p>
                  <p className="text-xs text-muted-foreground">
                    {state.customer.loyaltyPoints} points (${(state.customer.loyaltyPoints * 0.01).toFixed(2)})
                  </p>
                </div>
                <Switch
                  checked={useLoyaltyPoints}
                  onCheckedChange={setUseLoyaltyPoints}
                  disabled={state.customer.loyaltyPoints === 0}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Promo Code */}
          <div className="flex gap-2">
            <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
            <Button variant="outline" onClick={fetchLoyalty}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Result Messages */}
      {paymentResult === "declined" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="font-medium text-red-800">Payment Declined</p>
              <p className="text-sm text-red-600">Please try another payment method or use your gift card balance.</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setPaymentMethod("upi")}>
                  Try UPI
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUseGiftCard(true)
                    setUseLoyaltyPoints(true)
                  }}
                >
                  Use Gift Card + Points
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentResult === "error" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">Network Error</p>
              <p className="text-sm text-amber-600">Connection timed out. Please try again.</p>
              <Button size="sm" className="mt-3" onClick={handlePayment}>
                Retry Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button className="w-full" size="lg" onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay ${((loyaltyData as Record<string, number> | null)?.finalTotal ?? cartTotal).toFixed(2)}</>
        )}
      </Button>
    </div>
  )
}
