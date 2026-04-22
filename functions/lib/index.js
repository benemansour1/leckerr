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
exports.sendOrderStatusNotification = exports.sendNewOrderNotification = void 0;
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
    await admin
        .messaging()
        .sendEachForMulticast({
        tokens,
        data: {
            title: "Lecker",
            body: `طلب جديد باسم ${(order === null || order === void 0 ? void 0 : order.customerName) ||
                "زبون"}`,
        },
        webpush: {
            notification: {
                icon: "/favicon.svg",
                badge: "/favicon.svg",
            },
        },
    });
    console.log("✅ Admin notification sent");
});
exports.sendOrderStatusNotification = (0, firestore_1.onDocumentUpdated)("orders/{orderId}", async (event) => {
    var _a, _b, _c;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    if (before.status ===
        after.status) {
        return;
    }
    const phone = after.customerPhone;
    if (!phone)
        return;
    const tokenDoc = await admin
        .firestore()
        .collection("customerTokens")
        .doc(phone)
        .get();
    const token = (_c = tokenDoc.data()) === null || _c === void 0 ? void 0 : _c.token;
    if (!token) {
        console.log("customer token not found");
        return;
    }
    let body = "تم تحديث حالة طلبك";
    if (after.status ===
        "preparing") {
        body =
            "طلبك قيد التحضير 👨‍🍳";
    }
    if (after.status ===
        "ready") {
        body =
            after.deliveryType ===
                "delivery"
                ? "طلبك جاهز وبالطريق إليك 🚗"
                : "طلبك جاهز للاستلام 😍";
    }
    if (after.status ===
        "delivered") {
        body =
            "تم تسليم الطلب ✅";
    }
    if (after.status ===
        "cancelled") {
        body =
            "تم إلغاء الطلب ❌";
    }
    await admin
        .messaging()
        .send({
        token,
        data: {
            title: "Lecker",
            body,
        },
        webpush: {
            notification: {
                icon: "/favicon.svg",
            },
        },
    });
    console.log("✅ Customer notification sent");
});
//# sourceMappingURL=index.js.map