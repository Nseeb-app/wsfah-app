import admin from "firebase-admin";
import { prisma } from "./prisma";

// Initialize Firebase Admin (once)
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      // Fix private key newlines (some platforms store \n as literal newlines)
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (err) {
      console.error("Firebase init failed — push notifications disabled:", err);
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
      console.warn("[push] Skipped: Firebase Admin not initialized");
      return;
    }

    // Get user's push tokens (mobile FCM tokens)
    const subscriptions = await prisma.mobilePushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (subscriptions.length === 0) {
      console.log(`[push] No tokens for user ${userId}`);
      return;
    }
    console.log(`[push] Sending to ${subscriptions.length} token(s) for user ${userId}`);

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
    console.log(`[push] Result: ${response.successCount} success, ${response.failureCount} failure`);

    // Remove invalid tokens
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        console.error(`[push] Token failed:`, resp.error?.code, resp.error?.message);
        if (resp.error?.code === "messaging/registration-token-not-registered") {
          failedTokens.push(tokens[idx]);
        }
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
