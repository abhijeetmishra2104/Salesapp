module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/mock/payment/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function POST(request) {
    const body = await request.json();
    const { amount, paymentMethod, customerId, mode = "success", useGiftCard = false, useLoyaltyPoints = false, giftCardAmount = 0, loyaltyPointsUsed = 0 } = body;
    // Simulate processing time
    const delay = mode === "delayed" ? 3000 : 800;
    await new Promise((resolve)=>setTimeout(resolve, delay));
    if (mode === "network-error") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Network timeout. Please try again.",
            code: "NETWORK_ERROR"
        }, {
            status: 503
        });
    }
    if (mode === "declined") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Payment declined. Please check your card details or try another payment method.",
            code: "CARD_DECLINED",
            data: {
                transactionId: `TXN-${Date.now()}`,
                status: "declined",
                suggestedActions: [
                    "retry",
                    "change-payment",
                    "use-gift-card"
                ]
            }
        });
    }
    // Calculate final amount after gift card and loyalty points
    let finalAmount = amount;
    let appliedGiftCard = 0;
    let appliedPoints = 0;
    let pointsValue = 0;
    if (useGiftCard && giftCardAmount > 0) {
        appliedGiftCard = Math.min(giftCardAmount, finalAmount);
        finalAmount -= appliedGiftCard;
    }
    if (useLoyaltyPoints && loyaltyPointsUsed > 0) {
        pointsValue = loyaltyPointsUsed * 0.01; // 1 point = $0.01
        appliedPoints = Math.min(pointsValue, finalAmount);
        finalAmount -= appliedPoints;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: {
            transactionId: `TXN-${Date.now()}`,
            status: "approved",
            originalAmount: amount,
            giftCardApplied: appliedGiftCard,
            loyaltyPointsApplied: appliedPoints,
            loyaltyPointsUsed: Math.floor(appliedPoints / 0.01),
            finalAmount,
            paymentMethod,
            customerId,
            timestamp: new Date().toISOString(),
            earnedPoints: Math.floor(finalAmount * 10)
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7cbf7d02._.js.map