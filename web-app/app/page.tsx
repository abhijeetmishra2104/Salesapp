"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { fetchCustomer } from "@/lib/api"
import {
  MessageSquare,
  Smartphone,
  MessageCircle,
  Monitor,
  Mic,
  Play,
  Sparkles,
  Package,
  CreditCard,
  Truck,
  Gift,
  HeadphonesIcon,
  ArrowRight,
  Zap,
} from "lucide-react"

const channels = [
  { id: "web-chat", label: "Web Chat", icon: MessageSquare, description: "Browser-based chat interface" },
  { id: "mobile-chat", label: "Mobile Chat", icon: Smartphone, description: "Mobile-optimized experience" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, description: "WhatsApp simulation" },
  { id: "kiosk", label: "In-store Kiosk", icon: Monitor, description: "Retail kiosk interface" },
  { id: "voice", label: "Voice Assistant", icon: Mic, description: "Voice-enabled assistant" },
]

const agents = [
  { name: "Recommendation", icon: Sparkles, description: "AI-powered product suggestions based on intent" },
  { name: "Inventory", icon: Package, description: "Real-time stock checking across channels" },
  { name: "Payment", icon: CreditCard, description: "Secure payment processing with fallbacks" },
  { name: "Fulfillment", icon: Truck, description: "Delivery and pickup scheduling" },
  { name: "Loyalty", icon: Gift, description: "Points, discounts, and promotions" },
  { name: "Post-Purchase", icon: HeadphonesIcon, description: "Tracking, returns, and support" },
]

export default function HomePage() {
  const { state, dispatch } = useStore()

  useEffect(() => {
    // Load default customer on mount
    if (!state.customer) {
      fetchCustomer("cust_03").then((result) => {
        if (result.success) {
          dispatch({ type: "SET_CUSTOMER", customer: result.data })
        }
      })
    }
  }, [state.customer, dispatch])

  const startDemo = () => {
    dispatch({ type: "SET_DEMO_MODE", active: true })
    dispatch({ type: "SET_CHANNEL", channel: "mobile-chat" })
    dispatch({ type: "SET_MESSAGES", messages: [] })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <Badge variant="secondary" className="text-sm">
            <Zap className="h-3 w-3 mr-1" />
            AI-Powered Retail Demo
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">OmniSales AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Experience the future of retail with our conversational AI agent orchestrating Worker Agents across multiple
            channels for seamless shopping experiences.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                <MessageSquare className="h-5 w-5" />
                Start Shopping
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent" onClick={startDemo}>
              <Play className="h-5 w-5" />
              Run Scripted Demo
            </Button>
          </div>
        </section>

        {/* Channel Selection */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Choose Your Channel</h2>
            <p className="text-muted-foreground">
              Experience omnichannel session continuity — switch channels without losing context
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon
              return (
                <Link key={channel.id} href="/chat">
                  <Card
                    className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() =>
                      dispatch({ type: "SET_CHANNEL", channel: channel.id as typeof state.currentChannel })
                    }
                  >
                    <CardContent className="flex flex-col items-center text-center p-6 gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{channel.label}</p>
                        <p className="text-xs text-muted-foreground hidden md:block">{channel.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Worker Agents */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Worker Agent Orchestration</h2>
            <p className="text-muted-foreground">
              Watch how our Sales Agent coordinates specialized agents in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const Icon = agent.icon
              return (
                <Card key={agent.name}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{agent.name} Agent</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Demo Features */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Demo Features</h2>
            <p className="text-muted-foreground">Toggle mock API behaviors to test edge cases</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Test success, decline, retry flows, and gift card fallbacks
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inventory States</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Simulate normal, low-stock, and out-of-stock scenarios
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channel Switching</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Preserve conversation context across all channels
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/dev-console">
              <Button variant="outline" className="gap-2 bg-transparent">
                Open Dev Console
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>OmniSales AI Demo — Built with Next.js, React, and Tailwind CSS</p>
          <p className="mt-1">Ready for Vercel deployment</p>
        </div>
      </footer>
    </div>
  )
}
