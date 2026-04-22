import * as admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

admin.initializeApp();

export const sendNewOrderNotification = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const order = event.data?.data();

    const tokensSnapshot = await admin
      .firestore()
      .collection("adminTokens")
      .get();

    const tokens = tokensSnapshot.docs.map((doc) => doc.id);

    if (!tokens.length) {
      console.log("No admin tokens found");
      return;
    }

    await admin.messaging().sendEachForMulticast({
      tokens,

      notification: {
        title: "🔔 طلب جديد",
        body: `طلب جديد باسم ${order?.customerName || "زبون"}`,
      },

      webpush: {
        notification: {
          icon: "/favicon.svg",
        },
      },
    });

    console.log("✅ Notification sent");
  }
);