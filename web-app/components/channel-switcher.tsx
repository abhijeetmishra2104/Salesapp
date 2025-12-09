"use client"

import { cn } from "@/lib/utils"
import { useStore, type Channel } from "@/lib/store"
import { MessageSquare, Smartphone, MessageCircle, Monitor, Mic } from "lucide-react"

const channels: Array<{ id: Channel; label: string; icon: typeof MessageSquare }> = [
  { id: "web-chat", label: "Web Chat", icon: MessageSquare },
  { id: "mobile-chat", label: "Mobile", icon: Smartphone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "kiosk", label: "In-store Kiosk", icon: Monitor },
  { id: "voice", label: "Voice", icon: Mic },
]

export function ChannelSwitcher() {
  const { state, dispatch } = useStore()

  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => {
        const Icon = channel.icon
        const isActive = state.currentChannel === channel.id
        return (
          <button
            key={channel.id}
            onClick={() => dispatch({ type: "SET_CHANNEL", channel: channel.id })}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{channel.label}</span>
          </button>
        )
      })}
    </div>
  )
}
