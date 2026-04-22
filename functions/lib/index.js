"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNewOrderNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
admin.initializeApp();
exports.sendNewOrderNotification = (0, firestore_1.onDocumentCreated)("orders/{orderId}", async (event) => {
    var _a;
    const order = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const tokensSnapshot = await admin
        .firestore()
        .collection("adminTokens")
        .get();
    const tokens = tokensSnapshot.docs
        .map((doc) => doc.data().token)
        .filter(Boolean);
    if (!tokens.length) {
        console.log("No admin tokens found");
        return;
    }
    await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
            title: "🔔 طلب جديد",
            body: `طلب جديد باسم ${(order === null || order === void 0 ? void 0 : order.customerName) || "زبون"}`,
        },
        webpush: {
            notification: {
                icon: "/favicon.svg",
            },
        },
    });
    console.log("✅ Notification sent");
});
//# sourceMappingURL=index.js.map