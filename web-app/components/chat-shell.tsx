"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStore, type Message, type Channel } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChannelSwitcher } from "@/components/channel-switcher";
import { AgentTile } from "@/components/agent-tile";
import {
  Send,
  Mic,
  User,
  Bot,
  Loader2,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";
import {
  getRecommendations,
  fetchInventory,
  scheduleFulfillment,
  getLoyaltyInfo,
} from "@/lib/api";
import Link from "next/link";

const channelStyles: Record<Channel, string> = {
  "web-chat": "bg-background",
  "mobile-chat":
    "bg-background rounded-3xl border-4 border-foreground/10 max-w-sm mx-auto",
  whatsapp: "bg-emerald-950/20",
  kiosk: "bg-background border-8 border-foreground/20 rounded-2xl",
  voice: "bg-background",
};

export function ChatShell() {
  const { state, dispatch } = useStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const invokeAgent = useCallback(
    async (
      agentName: string,
      action: () => Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
      }>,
      onSuccess?: (data: unknown) => void
    ) => {
      const startTime = Date.now();
      dispatch({
        type: "UPDATE_AGENT",
        name: agentName,
        state: { status: "running", timestamp: new Date().toISOString() },
      });

      try {
        const result = await action();
        const duration = Date.now() - startTime;

        dispatch({
          type: "UPDATE_AGENT",
          name: agentName,
          state: {
            status: result.success ? "success" : "error",
            lastResult: result as Record<string, unknown>,
            duration,
          },
        });

        dispatch({
          type: "ADD_ACTIVITY",
          entry: {
            timestamp: new Date().toISOString(),
            agent: agentName,
            action: result.success ? "completed" : "failed",
            result,
          },
        });

        if (result.success && onSuccess) {
          onSuccess(result.data);
        }

        return result;
      } catch (error) {
        dispatch({
          type: "UPDATE_AGENT",
          name: agentName,
          state: { status: "error", duration: Date.now() - startTime },
        });
        return { success: false, error: String(error) };
      }
    },
    [dispatch]
  );

  const addAgentMessage = useCallback(
    (content: string, agentInvoked?: string, quickReplies?: string[]) => {
      const message: Message = {
        id: `msg-${Date.now()}`,
        role: "agent",
        content,
        timestamp: new Date().toISOString(),
        channel: state.currentChannel,
        agentInvoked,
        quickReplies,
      };
      dispatch({ type: "ADD_MESSAGE", message });
    },
    [dispatch, state.currentChannel]
  );

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      channel: state.currentChannel,
    };
    dispatch({ type: "ADD_MESSAGE", message: userMessage });
    setInput("");
    dispatch({ type: "SET_TYPING", isTyping: true });

    // Simple intent detection for demo
    const lowerInput = input.toLowerCase();

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      lowerInput.includes("wedding") ||
      lowerInput.includes("shoe") ||
      lowerInput.includes("recommend")
    ) {
      // Invoke recommendation agent
      await invokeAgent(
        "recommendation",
        () =>
          getRecommendations(
            state.customer?.id || "cust_03",
            input,
            state.cart.map((i) => i.sku)
          ),
        (data: unknown) => {
          const typedData = data as {
            recommendations: Array<{
              name: string;
              sku: string;
              price: number;
              salePrice?: number;
            }>;
          };
          const recs = typedData.recommendations;
          if (recs && recs.length > 0) {
            const recList = recs
              .map(
                (r: {
                  name: string;
                  sku: string;
                  price: number;
                  salePrice?: number;
                }) => `• ${r.name} - $${r.salePrice || r.price}`
              )
              .join("\n");
            addAgentMessage(
              `Perfect! For a wedding, I'd recommend these elegant options:\n\n${recList}\n\nWould you like to see more details or add any to your cart?`,
              "recommendation",
              ["View details", "Add first to cart", "Show more options"]
            );
          }
        }
      );
    } else if (
      lowerInput.includes("stock") ||
      lowerInput.includes("available") ||
      lowerInput.includes("inventory")
    ) {
      await invokeAgent(
        "inventory",
        () =>
          fetchInventory(
            state.cart[0]?.sku || "SKU-HEEL-001",
            state.mockSettings.inventoryMode
          ),
        (data: unknown) => {
          const typedData = data as {
            inventory: Record<string, number>;
            stores: Array<{ name: string }>;
          };
          const inv = typedData.inventory;
          const online = inv?.online || 0;
          if (online > 5) {
            addAgentMessage(
              `Great news! This item is in stock online with ${online} units available. Would you like to proceed to checkout?`,
              "inventory",
              ["Proceed to checkout", "Check store availability"]
            );
          } else if (online > 0) {
            addAgentMessage(
              `This item is running low online (${online} left). However, it's available at nearby stores. Would you like to reserve for in-store pickup?`,
              "inventory",
              ["Reserve in-store", "Ship to home", "Check other stores"]
            );
          } else {
            addAgentMessage(
              `This item is currently out of stock online, but I found availability at Store #2 (Mall of America). Would you like to reserve it for pickup?`,
              "inventory",
              [
                "Reserve at Store #2",
                "Notify when available",
                "Show similar items",
              ]
            );
          }
        }
      );
    } else if (
      lowerInput.includes("checkout") ||
      lowerInput.includes("pay") ||
      lowerInput.includes("buy")
    ) {
      addAgentMessage(
        `Ready to checkout! You have ${state.cart.length} item(s) in your cart. Would you like to proceed with payment?`,
        undefined,
        ["Proceed to payment", "Review cart", "Apply promo code"]
      );
    } else if (
      lowerInput.includes("reserve") ||
      lowerInput.includes("pickup")
    ) {
      await invokeAgent(
        "fulfillment",
        () =>
          scheduleFulfillment({
            orderId: `ORD-${Date.now()}`,
            items: state.cart.map((i) => ({
              sku: i.sku,
              quantity: i.quantity,
            })),
            fulfillmentType: "pickup",
            storeId: "store_002",
          }),
        (data: unknown) => {
          const typedData = data as {
            availableSlots: Array<{ date: string; times: string[] }>;
            store: { name: string };
          };
          const slots = typedData.availableSlots;
          if (slots && slots.length > 0) {
            addAgentMessage(
              `I can reserve this for pickup at ${
                typedData.store?.name || "our store"
              }. Available slots:\n\n• ${slots[0].date}: ${slots[0].times
                .slice(0, 3)
                .join(", ")}\n\nWhich time works best for you?`,
              "fulfillment",
              slots[0].times.slice(0, 3).map((t) => `${slots[0].date} ${t}`)
            );
          }
        }
      );
    } else if (
      lowerInput.includes("point") ||
      lowerInput.includes("loyalty") ||
      lowerInput.includes("discount")
    ) {
      await invokeAgent(
        "loyalty",
        () =>
          getLoyaltyInfo({
            customerId: state.customer?.id || "cust_03",
            cartTotal: state.cart.reduce(
              (sum, i) => sum + i.price * i.quantity,
              0
            ),
            cartItems: state.cart.map((i) => ({ sku: i.sku })),
            active: state.mockSettings.loyaltyActive,
          }),
        (data: unknown) => {
          const typedData = data as {
            tier: string;
            tierPercentage: number;
            currentPoints: number;
            giftCardBalance: number;
          };
          addAgentMessage(
            `As a ${typedData.tier} member, you get ${
              typedData.tierPercentage
            }% off! You have ${typedData.currentPoints} points (worth $${(
              typedData.currentPoints * 0.01
            ).toFixed(2)}) and $${
              typedData.giftCardBalance
            } gift card balance. Would you like to apply these to your order?`,
            "loyalty",
            ["Apply points", "Apply gift card", "Apply both", "Skip for now"]
          );
        }
      );
    } else {
      // Default consultative response
      addAgentMessage(
        `I'd love to help you find the perfect item! Could you tell me more about what you're looking for? For example:\n\n• What's the occasion?\n• Any preferred style or color?\n• What's your budget range?`,
        undefined,
        ["Shopping for wedding", "Looking for comfort", "Browse sale items"]
      );
    }

    dispatch({ type: "SET_TYPING", isTyping: false });
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const handleVoiceInput = () => {
    const voiceMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: "Shopping for wedding shoes",
      timestamp: new Date().toISOString(),
      channel: state.currentChannel,
      isVoice: true,
    };
    dispatch({ type: "ADD_MESSAGE", message: voiceMessage });
    setInput("Shopping for wedding shoes");
    setTimeout(() => handleSend(), 500);
  };

  const activeAgents = Object.entries(state.agents).filter(
    ([, a]) => a.status === "running" || a.status === "success"
  );

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-8rem)] transition-all",
        channelStyles[state.currentChannel]
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Birla OneAI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {state.customer
                ? `Hello, ${state.customer.name}`
                : "Your personal shopping assistant"}
            </p>
          </div>
          {state.cart.length > 0 && (
            <Link href="/checkout">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <ShoppingCart className="h-4 w-4" />
                {state.cart.length} items
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        <ChannelSwitcher />

        {/* Active agents indicator */}
        {activeAgents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeAgents.map(([key, agent]) => (
              <AgentTile key={key} agentKey={key} agent={agent} compact />
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Welcome to Birla OneAI</p>
            <p className="text-sm">
              Start a conversation or try a quick action below
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                "Shopping for wedding shoes",
                "Show me sale items",
                "Check my loyalty points",
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {state.messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              message.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "flex flex-col gap-2 rounded-2xl px-4 py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {message.isVoice && (
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <Mic className="h-3 w-3" />
                  Voice input
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.quickReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="secondary"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
              <span className="text-xs opacity-50">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {state.isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Agent is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleVoiceInput}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
