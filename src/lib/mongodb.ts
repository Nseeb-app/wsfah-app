import { MongoClient, Db, Collection, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";

let client: MongoClient;
let db: Db;

async function getDb(): Promise<Db> {
  if (db) return db;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
  try {
    // Log masked URI for debugging
    const masked = MONGODB_URI.replace(/:([^@]+)@/, ':***@');
    console.log("[mongo] Connecting to:", masked);
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log("[mongo] Connected to MongoDB");
    return db;
  } catch (err) {
    // Reset so next call retries instead of using stale connection
    client = undefined as unknown as MongoClient;
    db = undefined as unknown as Db;
    throw err;
  }
}

// ─── Types ───

export interface ChatMessage {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  senderImage: string | null;
  body: string;
  createdAt: Date;
}

export interface ChatConversation {
  _id?: ObjectId;
  participantIds: string[];
  participants: { userId: string; name: string | null; image: string | null }[];
  lastMessage: { body: string; senderId: string; createdAt: Date } | null;
  lastReadAt: Record<string, Date>; // userId → last read timestamp
  updatedAt: Date;
  createdAt: Date;
}

// ─── Collections ───

export async function messagesCollection(): Promise<Collection<ChatMessage>> {
  const database = await getDb();
  return database.collection<ChatMessage>("messages");
}

export async function conversationsCollection(): Promise<Collection<ChatConversation>> {
  const database = await getDb();
  return database.collection<ChatConversation>("conversations");
}

// ─── Ensure indexes (called once on first use) ───

let indexesCreated = false;
export async function ensureIndexes() {
  if (indexesCreated) return;
  const msgs = await messagesCollection();
  const convs = await conversationsCollection();
  await msgs.createIndex({ conversationId: 1, createdAt: -1 });
  await msgs.createIndex({ senderId: 1 });
  await convs.createIndex({ participantIds: 1 });
  await convs.createIndex({ updatedAt: -1 });
  indexesCreated = true;
}

export { ObjectId };
