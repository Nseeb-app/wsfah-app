import admin from "firebase-admin";
import { prisma } from "./prisma";

// Initialize Firebase Admin (once)
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } catch {
      console.error("Firebase init failed — push notifications disabled");
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled");
  }
}

/**
 * Send push notification to a user.
 * Looks up their push tokens and sends via FCM.
 * Fire-and-forget — never blocks the caller.
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    if (!admin.apps.length) {
      console.warn("Push skipped: Firebase Admin not initialized");
      return;
    }

    // Get user's push tokens (mobile FCM tokens)
    const subscriptions = await prisma.mobilePushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (subscriptions.length === 0) return;

    const tokens = subscriptions.map((s) => s.token).filter(Boolean);
    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Remove invalid tokens
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === "messaging/registration-token-not-registered") {
        failedTokens.push(tokens[idx]);
      }
    });

    if (failedTokens.length > 0) {
      await prisma.mobilePushToken.deleteMany({
        where: { token: { in: failedTokens } },
      });
    }
  } catch (err) {
    console.error("Push notification error:", err);
  }
}
