const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendNewOrderNotification = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const order = event.data.data();

    const tokensSnap = await admin.firestore().collection("adminTokens").get();
    const tokens = tokensSnap.docs.map(doc => doc.data().token);

    if (!tokens.length) {
      console.log("No admin tokens found");
      return;
    }

    const message = {
      notification: {
        title: "طلب جديد 🔥",
        body: `طلب جديد من ${order.customerName}`,
      },
      tokens,
    };

    await admin.messaging().sendMulticast(message);
  }
);