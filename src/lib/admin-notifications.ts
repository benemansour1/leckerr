import { getMessaging, getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function registerAdminNotifications() {
  try {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    const messaging = getMessaging();

    const token = await getToken(messaging, {
      vapidKey:
        "BPNI8-U9eQCXSgH6TDLqfmGXvPc2ctLJYkem7Z3tUvfx_6oBystcKIUAZykJoSiSc1yxjOdsEOkwYTCuH5hYyr4",
    });

    if (!token) return;

    await setDoc(doc(db, "adminTokens", token), {
      token,
      createdAt: new Date(),
    });

    console.log("✅ Admin notification token saved");
  } catch (err) {
    console.log("❌ Notification error", err);
  }
}