"use server";

import { db } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(notificationId: string) {
  if (!db) return { ok: false, error: "DB no inicializada" };

  try {
    await db.collection("notifications").doc(notificationId).update({
      read: true,
      readAt: FieldValue.serverTimestamp()
    });

    revalidatePath("/resident/notifications");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error marcando notificación como leída" };
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  if (!db) return { ok: false, error: "DB no inicializada" };

  try {
    const notifications = await db.collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    const batch = db.batch();
    notifications.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    revalidatePath("/resident/notifications");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Error marcando todas las notificaciones como leídas" };
  }
}