"use client"

import type React from "react"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

// Types
export type Channel = "web-chat" | "mobile-chat" | "whatsapp" | "kiosk" | "voice"

export type AgentStatus = "idle" | "running" | "success" | "error"

export interface AgentState {
  name: string
  status: AgentStatus
  lastPayload?: Record<string, unknown>
  lastResult?: Record<string, unknown>
  timestamp?: string
  duration?: number
}

export interface Message {
  id: string
  role: "user" | "agent" | "system"
  content: string
  timestamp: string
  channel: Channel
  agentInvoked?: string
  isVoice?: boolean
  quickReplies?: string[]
}

export interface CartItem {
  sku: string
  name: string
  price: number
  quantity: number
  size?: string
  image: string
}

export interface Customer {
  id: string
  name: string
  email: string
  loyaltyTier: string
  loyaltyPoints: number
  giftCardBalance: number
  savedCards: Array<{ last4: string; brand: string; expiry: string }>
}

export interface MockSettings {
  inventoryMode: "normal" | "low-stock" | "out-of-stock"
  paymentMode: "success" | "declined" | "network-error" | "delayed"
  loyaltyActive: boolean
  networkDelay: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  fulfillmentType: "delivery" | "pickup"
  scheduledSlot?: { date: string; time: string; confirmationCode: string }
  trackingNumber?: string
  createdAt: string
}

export interface State {
  currentChannel: Channel
  messages: Message[]
  cart: CartItem[]
  customer: Customer | null
  agents: Record<string, AgentState>
  activityLog: Array<{ timestamp: string; agent: string; action: string; payload?: unknown; result?: unknown }>
  mockSettings: MockSettings
  currentOrder: Order | null
  isTyping: boolean
  demoMode: boolean
  demoStep: number
}

type Action =
  | { type: "SET_CHANNEL"; channel: Channel }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "SET_MESSAGES"; messages: Message[] }
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "REMOVE_FROM_CART"; sku: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_CUSTOMER"; customer: Customer }
  | { type: "UPDATE_AGENT"; name: string; state: Partial<AgentState> }
  | { type: "ADD_ACTIVITY"; entry: State["activityLog"][0] }
  | { type: "SET_MOCK_SETTINGS"; settings: Partial<MockSettings> }
  | { type: "SET_ORDER"; order: Order | null }
  | { type: "SET_TYPING"; isTyping: boolean }
  | { type: "SET_DEMO_MODE"; active: boolean }
  | { type: "SET_DEMO_STEP"; step: number }
  | { type: "RESET_STATE" }
  | { type: "HYDRATE"; state: Partial<State> }

const initialAgents: Record<string, AgentState> = {
  recommendation: { name: "Recommendation Agent", status: "idle" },
  inventory: { name: "Inventory Agent", status: "idle" },
  payment: { name: "Payment Agent", status: "idle" },
  fulfillment: { name: "Fulfillment Agent", status: "idle" },
  loyalty: { name: "Loyalty & Offers Agent", status: "idle" },
  postPurchase: { name: "Post-Purchase Agent", status: "idle" },
}

const initialState: State = {
  currentChannel: "mobile-chat",
  messages: [],
  cart: [],
  customer: null,
  agents: initialAgents,
  activityLog: [],
  mockSettings: {
    inventoryMode: "normal",
    paymentMode: "success",
    loyaltyActive: true,
    networkDelay: 0,
  },
  currentOrder: null,
  isTyping: false,
  demoMode: false,
  demoStep: 0,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CHANNEL":
      return { ...state, currentChannel: action.channel }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] }
    case "SET_MESSAGES":
      return { ...state, messages: action.messages }
    case "ADD_TO_CART": {
      const existing = state.cart.find((i) => i.sku === action.item.sku && i.size === action.item.size)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.sku === action.item.sku && i.size === action.item.size
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        }
      }
      return { ...state, cart: [...state.cart, action.item] }
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((i) => i.sku !== action.sku) }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "SET_CUSTOMER":
      return { ...state, customer: action.customer }
    case "UPDATE_AGENT":
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.name]: { ...state.agents[action.name], ...action.state },
        },
      }
    case "ADD_ACTIVITY":
      return { ...state, activityLog: [action.entry, ...state.activityLog].slice(0, 100) }
    case "SET_MOCK_SETTINGS":
      return { ...state, mockSettings: { ...state.mockSettings, ...action.settings } }
    case "SET_ORDER":
      return { ...state, currentOrder: action.order }
    case "SET_TYPING":
      return { ...state, isTyping: action.isTyping }
    case "SET_DEMO_MODE":
      return { ...state, demoMode: action.active, demoStep: action.active ? 0 : state.demoStep }
    case "SET_DEMO_STEP":
      return { ...state, demoStep: action.step }
    case "RESET_STATE":
      return { ...initialState, customer: state.customer }
    case "HYDRATE":
      return { ...state, ...action.state }
    default:
      return state
  }
}

const StoreContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("omnisales-state")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: "HYDRATE", state: parsed })
      } catch (e) {
        console.error("Failed to hydrate state:", e)
      }
    }
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    const toSave = {
      currentChannel: state.currentChannel,
      messages: state.messages,
      cart: state.cart,
      customer: state.customer,
      currentOrder: state.currentOrder,
      mockSettings: state.mockSettings,
    }
    localStorage.setItem("omnisales-state", JSON.stringify(toSave))
  }, [state.currentChannel, state.messages, state.cart, state.customer, state.currentOrder, state.mockSettings])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
