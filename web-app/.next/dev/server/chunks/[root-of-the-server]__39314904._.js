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
"[project]/mock/inventory.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"stores":[{"id":"store_001","name":"Downtown Flagship","address":"123 Main St, New York, NY","phone":"(212) 555-0101"},{"id":"store_002","name":"Mall of America","address":"456 Shopping Blvd, Minneapolis, MN","phone":"(612) 555-0202"},{"id":"store_003","name":"Beverly Hills Boutique","address":"789 Rodeo Dr, Beverly Hills, CA","phone":"(310) 555-0303"},{"id":"store_004","name":"Chicago Magnificent Mile","address":"321 Michigan Ave, Chicago, IL","phone":"(312) 555-0404"},{"id":"store_005","name":"Miami Beach Store","address":"555 Ocean Dr, Miami Beach, FL","phone":"(305) 555-0505"}],"inventory":{"SKU-HEEL-001":{"online":45,"store_001":8,"store_002":12,"store_003":5,"store_004":10,"store_005":6},"SKU-HEEL-002":{"online":30,"store_001":6,"store_002":8,"store_003":4,"store_004":7,"store_005":5},"SKU-HEEL-003":{"online":55,"store_001":10,"store_002":15,"store_003":8,"store_004":12,"store_005":9},"SKU-HEEL-004":{"online":3,"store_001":0,"store_002":2,"store_003":0,"store_004":1,"store_005":0},"SKU-HEEL-005":{"online":25,"store_001":5,"store_002":6,"store_003":3,"store_004":4,"store_005":3},"SKU-FLAT-001":{"online":80,"store_001":15,"store_002":20,"store_003":10,"store_004":18,"store_005":12},"SKU-FLAT-002":{"online":0,"store_001":0,"store_002":5,"store_003":0,"store_004":3,"store_005":0},"SKU-BOOT-001":{"online":35,"store_001":7,"store_002":10,"store_003":5,"store_004":8,"store_005":4},"SKU-SNEAK-001":{"online":100,"store_001":20,"store_002":25,"store_003":15,"store_004":22,"store_005":18},"SKU-SNEAK-002":{"online":40,"store_001":8,"store_002":12,"store_003":6,"store_004":10,"store_005":7},"SKU-BAG-001":{"online":60,"store_001":12,"store_002":15,"store_003":8,"store_004":14,"store_005":10},"SKU-BAG-002":{"online":2,"store_001":1,"store_002":0,"store_003":2,"store_004":0,"store_005":1}}});}),
"[project]/app/api/mock/fulfillment/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mock$2f$inventory$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/mock/inventory.json (json)");
;
;
async function POST(request) {
    const body = await request.json();
    const { orderId, items, fulfillmentType, storeId, preferredDate } = body;
    await new Promise((resolve)=>setTimeout(resolve, 350));
    const store = storeId ? __TURBOPACK__imported__module__$5b$project$5d2f$mock$2f$inventory$2e$json__$28$json$29$__["default"].stores.find((s)=>s.id === storeId) : null;
    // Generate available slots
    const today = new Date();
    const slots = [];
    if (fulfillmentType === "pickup") {
        for(let i = 0; i < 5; i++){
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            slots.push({
                date: date.toISOString().split("T")[0],
                times: [
                    "10:00 AM",
                    "12:00 PM",
                    "2:00 PM",
                    "4:00 PM",
                    "6:00 PM"
                ]
            });
        }
    } else {
        for(let i = 2; i < 7; i++){
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            slots.push({
                date: date.toISOString().split("T")[0],
                times: [
                    "9:00 AM - 12:00 PM",
                    "12:00 PM - 5:00 PM",
                    "5:00 PM - 9:00 PM"
                ]
            });
        }
    }
    // If preferred date provided, schedule it
    let scheduledSlot = null;
    if (preferredDate) {
        scheduledSlot = {
            date: preferredDate.date,
            time: preferredDate.time,
            confirmationCode: `CONF-${Date.now().toString(36).toUpperCase()}`
        };
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: {
            orderId,
            fulfillmentType,
            store: store || null,
            availableSlots: slots,
            scheduledSlot,
            estimatedReady: fulfillmentType === "pickup" ? "2 hours" : "2-5 business days",
            items,
            timestamp: new Date().toISOString()
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__39314904._.js.map