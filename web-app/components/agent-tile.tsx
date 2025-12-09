"use client"

import { cn } from "@/lib/utils"
import type { AgentState } from "@/lib/store"
import {
  Sparkles,
  Package,
  CreditCard,
  Truck,
  Gift,
  HeadphonesIcon,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"

const agentIcons: Record<string, typeof Sparkles> = {
  recommendation: Sparkles,
  inventory: Package,
  payment: CreditCard,
  fulfillment: Truck,
  loyalty: Gift,
  postPurchase: HeadphonesIcon,
}

const statusColors: Record<string, string> = {
  idle: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  error: "bg-red-500/10 text-red-500 border-red-500/30",
}

interface AgentTileProps {
  agentKey: string
  agent: AgentState
  compact?: boolean
}

export function AgentTile({ agentKey, agent, compact = false }: AgentTileProps) {
  const Icon = agentIcons[agentKey] || Sparkles

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all",
          statusColors[agent.status],
        )}
      >
        {agent.status === "running" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : agent.status === "success" ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : agent.status === "error" ? (
          <XCircle className="h-3 w-3" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">{agent.name.replace(" Agent", "")}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-2 p-4 rounded-lg border transition-all", statusColors[agent.status])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <span className="font-medium text-sm">{agent.name}</span>
        </div>
        {agent.status === "running" && <Loader2 className="h-4 w-4 animate-spin" />}
        {agent.status === "success" && <CheckCircle2 className="h-4 w-4" />}
        {agent.status === "error" && <XCircle className="h-4 w-4" />}
      </div>

      {agent.timestamp && (
        <p className="text-xs opacity-70">
          {new Date(agent.timestamp).toLocaleTimeString()}
          {agent.duration && ` • ${agent.duration}ms`}
        </p>
      )}
    </div>
  )
}
