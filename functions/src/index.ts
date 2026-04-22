import * as admin from "firebase-admin";

import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

admin.initializeApp();

export const
sendNewOrderNotification =
onDocumentCreated(

  "orders/{orderId}",

  async (event) => {

    const order =
      event.data?.data();

    const tokensSnapshot =
      await admin
        .firestore()
        .collection(
          "adminTokens"
        )
        .get();

    const tokens =
      tokensSnapshot.docs
        .map((doc) =>
          doc.data().token
        )
        .filter(Boolean);

    if (!tokens.length) {

      console.log(
        "No admin tokens found"
      );

      return;
    }

    await admin
      .messaging()
      .sendEachForMulticast({

        tokens,

        data: {

          title:
            "Lecker",

          body:
            `طلب جديد باسم ${
              order?.customerName ||
              "زبون"
            }`,
        },

        webpush: {

          notification: {

            icon:
              "/favicon.svg",

            badge:
              "/favicon.svg",
          },
        },
      });

    console.log(
      "✅ Admin notification sent"
    );
  }
);

export const
sendOrderStatusNotification =
onDocumentUpdated(

  "orders/{orderId}",

  async (event) => {

    const before =
      event.data?.before.data();

    const after =
      event.data?.after.data();

    if (!before || !after)
      return;

    if (
      before.status ===
      after.status
    ) {
      return;
    }

    const phone =
      after.customerPhone;

    if (!phone) return;

    const tokenDoc =
      await admin
        .firestore()
        .collection(
          "customerTokens"
        )
        .doc(phone)
        .get();

    const token =
      tokenDoc.data()?.token;

    if (!token) {

      console.log(
        "customer token not found"
      );

      return;
    }

    let body =
      "تم تحديث حالة طلبك";

    if (
      after.status ===
      "preparing"
    ) {

      body =
        "طلبك قيد التحضير 👨‍🍳";
    }

    if (
      after.status ===
      "ready"
    ) {

      body =
        after.deliveryType ===
        "delivery"

          ? "طلبك جاهز وبالطريق إليك 🚗"

          : "طلبك جاهز للاستلام 😍";
    }

    if (
      after.status ===
      "delivered"
    ) {

      body =
        "تم تسليم الطلب ✅";
    }

    if (
      after.status ===
      "cancelled"
    ) {

      body =
        "تم إلغاء الطلب ❌";
    }

    await admin
      .messaging()
      .send({

        token,

        data: {

          title:
            "Lecker",

          body,
        },

        webpush: {

          notification: {

            icon:
              "/favicon.svg",
          },
        },
      });

    console.log(
      "✅ Customer notification sent"
    );
  }
);