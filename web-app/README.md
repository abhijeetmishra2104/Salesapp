# Birla OneAI — Conversational Retail Agent

A production-ready demo website showcasing an AI Sales Agent orchestrating Worker Agents across multiple channels for seamless omnichannel retail experiences.

## Features

- **Omnichannel Session Continuity**: Switch between Web Chat, Mobile Chat, WhatsApp, In-store Kiosk, and Voice Assistant while preserving conversation context
- **Worker Agent Orchestration**: Visual real-time status for Recommendation, Inventory, Payment, Fulfillment, Loyalty, and Post-Purchase agents
- **Product Discovery**: Browse products with filtering, search, and quick-view modals
- **Checkout Flow**: Complete payment simulation with gift card, loyalty points, and fallback handling
- **Edge Case Handling**: Payment decline/retry, out-of-stock scenarios, network errors
- **Dev Console**: Toggle mock API behaviors and run scripted demos

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui components
- React Context for state management
- Mock API routes

## How to Run Locally

\`\`\`bash

# Install dependencies

npm install

# Start development server

npm run dev

# Open http://localhost:3000

\`\`\`

## How to Deploy to Vercel

1. Push to GitHub repository
2. Import project in Vercel dashboard
3. Deploy automatically

Or use the Vercel CLI:

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

## Mock API Endpoints

| Endpoint                | Method | Description              |
| ----------------------- | ------ | ------------------------ |
| `/api/mock/customers`   | GET    | Get customer data        |
| `/api/mock/products`    | GET    | Get product catalog      |
| `/api/mock/inventory`   | GET    | Check stock levels       |
| `/api/mock/recommend`   | POST   | Get AI recommendations   |
| `/api/mock/payment`     | POST   | Process payment          |
| `/api/mock/fulfillment` | POST   | Schedule delivery/pickup |
| `/api/mock/loyalty`     | POST   | Calculate discounts      |

## Scripted Demo Walkthrough

1. **Start**: Open Dev Console → Click "Run Scripted Demo"
2. **Mobile Chat**: Customer Emma (cust_03) asks about wedding shoes
3. **Recommendations**: Agent suggests 3 curated SKUs
4. **Cart**: User adds Crystal Elegance Stilettos
5. **Channel Switch**: Move to In-store Kiosk (conversation preserved)
6. **Inventory Check**: Shows low online stock, available at Store #2
7. **Reserve**: User selects in-store pickup
8. **Payment Decline**: First payment attempt fails
9. **Fallback**: Apply gift card + loyalty points
10. **Success**: Payment completes with discounts
11. **Fulfillment**: Pickup slot scheduled
12. **Confirmation**: Post-purchase notifications sent

## Dev Console Features

- **Mock Controls**: Toggle inventory (normal/low/out), payment (success/decline/error), loyalty rules
- **Activity Log**: Real-time timeline of agent invocations with payloads
- **Session State**: JSON inspector for current application state

## Project Structure

\`\`\`
├── app/
│ ├── page.tsx # Landing page
│ ├── chat/page.tsx # Chat interface
│ ├── products/page.tsx # Product catalog
│ ├── checkout/page.tsx # Checkout flow
│ ├── dev-console/page.tsx # Developer tools
│ └── api/mock/ # Mock API routes
├── components/
│ ├── chat-shell.tsx # Main chat component
│ ├── channel-switcher.tsx # Channel selection
│ ├── agent-tile.tsx # Agent status display
│ ├── product-card.tsx # Product display
│ ├── checkout-form.tsx # Payment form
│ └── navigation.tsx # Site navigation
├── lib/
│ ├── store.ts # State management
│ └── api.ts # API client helpers
└── mock/
├── customers.json # Customer data
├── products.json # Product catalog
└── inventory.json # Stock levels
\`\`\`

## License

MIT
