# BrewCraft — Implementation Instructions (Batches 1–6)

## Project Overview

- **Framework:** Next.js 16.1.6 with Turbopack, App Router
- **Database:** Prisma v5 with SQLite (`file:./dev.db`), schema at `prisma/schema.prisma`
- **Auth:** NextAuth v5 beta with JWT strategy, helper at `src/lib/auth.ts`
- **Validation:** Zod v4 via `zod/v4` import, schemas in `src/lib/validation.ts`
- **Styling:** Tailwind CSS, dark mode via `html.dark` class
- **Dev server:** `npx next dev --hostname 0.0.0.0` (LAN access at `192.168.1.27:3000`)

---

## Batch 0 — ALREADY COMPLETE (Do NOT redo)

The following are done and building cleanly:

- **Zod validation** on all API routes — `src/lib/validation.ts`
- **Rate limiting** — `src/lib/rate-limit.ts` (in-memory sliding window)
- **Audit logging** — `src/lib/audit.ts` (`logAudit()` + `AUDIT` constants)
- **Security headers** — `next.config.ts` (X-Frame-Options, CSP, etc.)
- **File upload hardening** — `src/app/api/upload/route.ts` (magic numbers, EXIF strip, crypto UUID)
- **Transaction-safe rating** — `src/app/api/recipes/[id]/rate/route.ts`
- **OTP security** — hashed storage in `OtpToken` model, expiry, attempt limiting
- **Response sanitization** — `src/lib/sanitize.ts`
- **Models added:** `OtpToken`, `AuditLog`, `GalleryPostLike`, `RecipeRating`

---

## Coding Conventions (MUST follow)

### API Route Pattern
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseBody, someSchema } from "@/lib/validation";
import { logAudit, AUDIT } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = parseBody(someSchema, body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { field1, field2 } = parsed.data;
  // ... business logic ...

  logAudit(session.user.id, AUDIT.SOME_ACTION, "entity", entityId);
  return NextResponse.json(result, { status: 201 });
}
```

### Dynamic Route Params (Next.js 16)
```typescript
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // MUST await
  // ...
}
```

### Validation Schema Pattern
Add schemas to `src/lib/validation.ts`:
```typescript
export const mySchema = z.object({
  field: z.string().min(1).max(200),
  optional: z.string().optional(),
});
```

### Key Rules
1. **Auth check** on all write operations: `if (!session?.user?.id) return 401`
2. **Validate** all input with Zod `parseBody()` + check `if (!parsed.ok)`
3. **Audit log** all security-sensitive operations
4. **Dark mode** support on all new UI (use `dark:` Tailwind prefixes)
5. **Strip passwords** from any user object sent to client
6. **`prisma.$transaction()`** for any operation updating aggregated counts
7. **Client components** need `"use client"` directive at top of file
8. Pages are **Server Components** by default

### Existing Utilities to Reuse
| Utility | Path | Usage |
|---------|------|-------|
| `prisma` | `src/lib/prisma.ts` | `import { prisma } from "@/lib/prisma"` |
| `auth()` | `src/lib/auth.ts` | `import { auth } from "@/lib/auth"` — returns `session` with `session.user.id` |
| `parseBody()` | `src/lib/validation.ts` | `import { parseBody, schema } from "@/lib/validation"` |
| `logAudit()` | `src/lib/audit.ts` | `import { logAudit, AUDIT } from "@/lib/audit"` |
| `rateLimitAuth/Write/Read` | `src/lib/rate-limit.ts` | `import { rateLimitWrite } from "@/lib/rate-limit"` |
| `sanitizeUser()` | `src/lib/sanitize.ts` | Strips password from user objects |
| `commentSchema` | `src/lib/validation.ts` | Already defined: `{ body, parentId? }` |

### User Roles
- `USER` — default
- `CREATOR` — can create recipes
- `BRAND_ADMIN` — owns companies, can post gallery/stories
- `SUPERADMIN` — full admin access

---

## Batch 1 — Comments & Collections

### 1A: Prisma Schema — Comments

Add to `prisma/schema.prisma`:
```prisma
model Comment {
  id        String   @id @default(cuid())
  body      String
  authorId  String
  recipeId  String?
  postId    String?
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author  User         @relation(fields: [authorId], references: [id], onDelete: Cascade)
  recipe  Recipe?      @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  post    GalleryPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  parent  Comment?     @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies Comment[]    @relation("CommentReplies")
}
```

Add relations to existing models:
- `User`: add `comments Comment[]`
- `Recipe`: add `comments Comment[]`
- `GalleryPost`: add `comments Comment[]`

### 1A: API Routes — Comments

**`src/app/api/recipes/[id]/comments/route.ts`**
- `GET`: paginated comments for recipe (include author name/image, replies), `?limit=20&cursor=`
- `POST`: auth required, validate with `commentSchema`, create comment, create notification for recipe author

**`src/app/api/gallery/[id]/comments/route.ts`**
- Same pattern but for gallery posts (`postId` instead of `recipeId`)

**`src/app/api/comments/[id]/route.ts`**
- `PATCH`: auth required, only own comments, validate body with `commentSchema`
- `DELETE`: auth required, own comments OR role === `SUPERADMIN`

### 1A: Components

**`src/components/CommentSection.tsx`** — `"use client"`
- Props: `{ recipeId?: string; postId?: string }`
- Fetches comments via GET, displays list with author avatar/name, timestamps
- Reply button → inline reply form
- Edit/delete buttons for own comments
- "Load more" pagination
- Dark mode support

### 1A: Page Modifications
- `src/app/recipe/[id]/page.tsx` — add `<CommentSection recipeId={id} />` below recipe content
- `src/app/explore/[id]/page.tsx` — add `<CommentSection postId={id} />`

---

### 1B: Prisma Schema — Collections

```prisma
model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  isPublic    Boolean  @default(false)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipes CollectionRecipe[]
}

model CollectionRecipe {
  id           String   @id @default(cuid())
  collectionId String
  recipeId     String
  addedAt      DateTime @default(now())

  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  recipe     Recipe     @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([collectionId, recipeId])
}
```

Add relations:
- `User`: add `collections Collection[]`
- `Recipe`: add `collectionRecipes CollectionRecipe[]`

### 1B: Validation Schemas

Add to `src/lib/validation.ts`:
```typescript
export const collectionCreateSchema = z.object({
  name: z.string().min(1, "Name required").max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const collectionUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});
```

### 1B: API Routes — Collections

**`src/app/api/collections/route.ts`**
- `GET`: auth required, return user's collections with recipe count
- `POST`: auth required, validate `collectionCreateSchema`, create collection

**`src/app/api/collections/[id]/route.ts`**
- `GET`: return collection with recipes (public collections visible to all, private only to owner)
- `PATCH`: auth required, own only, validate `collectionUpdateSchema`
- `DELETE`: auth required, own only

**`src/app/api/collections/[id]/recipes/route.ts`**
- `POST`: auth required, own collection only, body `{ recipeId }`, create CollectionRecipe
- `DELETE`: auth required, own collection only, body `{ recipeId }`, delete CollectionRecipe

### 1B: Pages

**`src/app/collections/page.tsx`** — `"use client"`
- List user's collections as cards (name, recipe count, public/private badge)
- "Create Collection" button → inline form

**`src/app/collections/[id]/page.tsx`** — `"use client"`
- Collection header (name, description, edit button if owner)
- Recipe grid (reuse card design from explore/search pages)

### 1B: Components

**`src/components/AddToCollectionModal.tsx`** — `"use client"`
- Props: `{ recipeId: string; onClose: () => void }`
- Fetches user's collections, shows checkboxes for add/remove
- "Create new collection" inline form at bottom

### 1B: Page Modifications
- `src/app/recipe/[id]/page.tsx` — add "Add to Collection" button (bookmark icon), opens `AddToCollectionModal`

### Batch 1 Verification
```bash
npx prisma db push
npx next build
# Test: Create comment on recipe, reply to comment, edit, delete
# Test: Create collection, add recipe, remove recipe, delete collection
```

---

## Batch 2 — Activity Feed, Stories & Notifications

### 2A: Prisma Schema — Activity Feed

```prisma
model ActivityEvent {
  id         String   @id @default(cuid())
  userId     String
  type       String
  entityId   String?
  entityType String?
  metadata   String?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

Add to `User`: `activities ActivityEvent[]`

### 2A: Helper

**`src/lib/activity.ts`**
```typescript
import { prisma } from "@/lib/prisma";

export async function recordActivity(
  userId: string,
  type: string,
  entityId?: string,
  entityType?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activityEvent.create({
      data: { userId, type, entityId, entityType, metadata: metadata ? JSON.stringify(metadata) : null },
    });
  } catch {
    // fire-and-forget
  }
}
```

### 2A: API & Pages

**`src/app/api/feed/route.ts`**
- `GET`: auth required, get followed user IDs, query ActivityEvents from those users, paginated with cursor, include user info

**`src/app/feed/page.tsx`** — `"use client"`
- Activity feed showing cards for different event types
- Infinite scroll or "Load more"

**`src/components/ActivityCard.tsx`** — `"use client"`
- Renders activity based on type (recipe created, liked, followed, commented)
- Links to relevant entity

### 2A: Modifications
Add `recordActivity()` calls to:
- Recipe create route
- Like/unlike routes
- Follow route
- Comment create route

---

### 2B: Prisma Schema — Stories

```prisma
model Story {
  id        String   @id @default(cuid())
  mediaUrl  String
  mediaType String   @default("image")
  caption   String?
  companyId String
  expiresAt DateTime
  viewCount Int      @default(0)
  createdAt DateTime @default(now())

  company Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  views   StoryView[]
}

model StoryView {
  id        String   @id @default(cuid())
  storyId   String
  userId    String
  createdAt DateTime @default(now())

  story Story @relation(fields: [storyId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([storyId, userId])
}
```

Add relations:
- `Company`: add `stories Story[]`
- `User`: add `storyViews StoryView[]`

### 2B: Validation

```typescript
export const storyCreateSchema = z.object({
  mediaUrl: z.string().min(1).max(500),
  mediaType: z.enum(["image", "video"]).optional(),
  caption: z.string().max(500).optional(),
  companyId: z.string().min(1),
});
```

### 2B: API Routes

**`src/app/api/stories/route.ts`**
- `GET`: return stories where `expiresAt > now()`, grouped by company, include company info
- `POST`: auth required, brand admin only, validate `storyCreateSchema`, verify company ownership, set `expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)`

**`src/app/api/stories/[id]/view/route.ts`**
- `POST`: auth required, upsert StoryView (unique storyId+userId), increment viewCount

### 2B: Components

**`src/components/StoriesBar.tsx`** — `"use client"`
- Horizontal scroll of brand circles
- Gradient ring (#25f459) for unviewed stories, gray ring for viewed
- Click opens StoryViewer

**`src/components/StoryViewer.tsx`** — `"use client"`
- Fullscreen overlay with dark background
- Progress bar at top (auto-advance every 5s)
- Tap left/right to navigate
- Close button (X)
- Shows caption + brand name
- Records view via POST

### 2B: Modifications
- `src/app/page.tsx` — add `<StoriesBar />` at top of home page
- `src/app/brand/[id]/page.tsx` — "Add Story" button for company owners

---

### 2C: Prisma Schema — Push Subscriptions

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

Add to `User`: `pushSubscriptions PushSubscription[]`

### 2C: Helper

**`src/lib/notify.ts`**
```typescript
import { prisma } from "@/lib/prisma";

export async function notify(
  userId: string,
  type: string,
  title: string,
  body: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
    // TODO: web push delivery (future)
  } catch {
    // fire-and-forget
  }
}
```

### 2C: API Routes
- `src/app/api/push/subscribe/route.ts` — POST: save push subscription
- `src/app/api/push/unsubscribe/route.ts` — POST: delete push subscription

### 2C: Modifications
- Replace direct `prisma.notification.create()` in follow/like/comment routes with `notify()`
- `src/app/notifications/page.tsx` — add filter tabs (All, Likes, Follows, Comments, System)
- `src/app/settings/page.tsx` — add push notification toggle

### Batch 2 Verification
```bash
npx prisma db push
npx next build
# Test: Activity feed shows actions from followed users
# Test: Create story as brand admin, view as user, verify expiry
# Test: Notifications appear for likes/follows/comments
```

---

## Batch 3 — Monetization & Brand Value

### 3A: Schema Changes — Company Promotion Fields

Add to `Company` model in `prisma/schema.prisma`:
```prisma
isPromoted         Boolean   @default(false)
promotionTier      String?
promotionExpiresAt DateTime?
```

### 3A: Modifications
- `src/app/page.tsx` — query promoted companies (where `isPromoted && promotionExpiresAt > now`), show with gold border + "Sponsored" label
- `src/app/explore/page.tsx` — inject sponsored posts every 6 items

---

### 3B: Prisma Schema — Brand Views

```prisma
model BrandView {
  id        String   @id @default(cuid())
  companyId String
  userId    String?
  page      String
  entityId  String?
  createdAt DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@index([companyId])
  @@index([createdAt])
}
```

Add to `Company`: `brandViews BrandView[]`

### 3B: API Routes

**`src/app/api/analytics/track/route.ts`**
- `POST`: body `{ companyId, page, entityId? }`, create BrandView, no auth required (anonymous tracking OK)

**`src/app/api/analytics/brand/[id]/route.ts`**
- `GET`: auth required, company owner only
- Return: total views, unique visitors (distinct userId), views by page, views per day (last 30 days)

### 3B: Pages

**`src/app/brand/[id]/analytics/page.tsx`** — `"use client"`
- Stats cards: total views, unique visitors, recipe views, product views
- CSS bar chart showing views per day (no external chart library)
- Owner-only guard (redirect if not owner)

### 3B: Modifications
- `src/app/brand/[id]/page.tsx` — add "Analytics" link for owners, fire tracking call on page load

---

### 3C: Schema Changes — Subscription Tiers

Add to `Company` model:
```prisma
subscriptionTier      String    @default("free")
subscriptionExpiresAt DateTime?
```

### 3C: Feature Gates

**`src/lib/features.ts`**
```typescript
export const TIER_LIMITS = {
  free:    { products: 5,  recipes: 10,  analytics: false, stories: false },
  basic:   { products: 20, recipes: 50,  analytics: true,  stories: true  },
  premium: { products: -1, recipes: -1,  analytics: true,  stories: true  }, // -1 = unlimited
};

export function getTierLimits(tier: string) {
  return TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
}

export function canCreate(tier: string, currentCount: number, resource: "products" | "recipes"): boolean {
  const limits = getTierLimits(tier);
  const limit = limits[resource];
  return limit === -1 || currentCount < limit;
}
```

### 3C: Modifications
- Product POST route — check `canCreate(company.subscriptionTier, productCount, "products")`
- Recipe POST route — if `brandId`, check `canCreate(company.subscriptionTier, recipeCount, "recipes")`
- Story POST route — check `getTierLimits(company.subscriptionTier).stories`

### Batch 3 Verification
```bash
npx prisma db push
npx next build
# Test: Promoted brands appear with gold border on home page
# Test: Brand analytics shows view counts for owner
# Test: Free tier companies blocked from creating >5 products
```

---

## Batch 4 — Social & Community

### 4A: Prisma Schema — Direct Messaging

```prisma
model Conversation {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  participants ConversationParticipant[]
  messages     Message[]
}

model ConversationParticipant {
  id             String   @id @default(cuid())
  conversationId String
  userId         String
  lastReadAt     DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  senderId       String
  body           String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
}
```

Add to `User`: `conversationParticipants ConversationParticipant[]`, `messages Message[]`

### 4A: Validation

```typescript
export const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export const conversationCreateSchema = z.object({
  userId: z.string().min(1, "User ID required"),
});
```

### 4A: API Routes

**`src/app/api/messages/conversations/route.ts`**
- `GET`: auth required, list conversations where user is participant, include last message + other participant info, ordered by updatedAt
- `POST`: auth required, validate `conversationCreateSchema`, find existing conversation or create new one with both participants

**`src/app/api/messages/conversations/[id]/route.ts`**
- `GET`: auth required, must be participant, return messages paginated (newest first), update lastReadAt
- `PATCH`: auth required, mark as read (update lastReadAt)

**`src/app/api/messages/conversations/[id]/messages/route.ts`**
- `POST`: auth required, must be participant, validate `messageSchema`, create message, update conversation updatedAt, notify recipient

### 4A: Pages

**`src/app/messages/page.tsx`** — `"use client"`
- Inbox list: other user's name/avatar, last message preview, timestamp, unread indicator
- Click → navigate to conversation

**`src/app/messages/[id]/page.tsx`** — `"use client"`
- Chat view: messages in bubbles (own = right/green, other = left/gray)
- Input bar at bottom with send button
- Poll for new messages every 5 seconds with `setInterval`
- Header with other user's name, back button

### 4A: Modifications
- `src/app/profile/[id]/page.tsx` — add "Message" button (navigates to `/messages` with conversation creation)
- `src/components/BottomNav.tsx` — add messages icon with unread count badge (query unread count)

---

### 4B: Prisma Schema — Community Groups

```prisma
model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String?
  isPublic    Boolean  @default(true)
  creatorId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creator User         @relation(fields: [creatorId], references: [id])
  members GroupMember[]
  posts   GroupPost[]
}

model GroupMember {
  id       String   @id @default(cuid())
  groupId  String
  userId   String
  role     String   @default("MEMBER")
  joinedAt DateTime @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
}

model GroupPost {
  id        String   @id @default(cuid())
  groupId   String
  authorId  String
  body      String
  imageUrl  String?
  createdAt DateTime @default(now())

  group  Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  author User  @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

Add to `User`: `groups Group[]`, `groupMemberships GroupMember[]`, `groupPosts GroupPost[]`

### 4B: Validation

```typescript
export const groupCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const groupPostSchema = z.object({
  body: z.string().min(1).max(2000),
  imageUrl: z.string().max(500).optional(),
});
```

### 4B: API Routes

**`src/app/api/groups/route.ts`**
- `GET`: list public groups with member count, search by name
- `POST`: auth required, validate `groupCreateSchema`, create group + add creator as ADMIN member

**`src/app/api/groups/[id]/route.ts`**
- `GET`: group detail with members count, recent posts
- `PATCH`: auth required, admin only, update name/description
- `DELETE`: auth required, creator only

**`src/app/api/groups/[id]/members/route.ts`**
- `POST`: auth required, join group (public groups)
- `DELETE`: auth required, leave group

**`src/app/api/groups/[id]/posts/route.ts`**
- `GET`: paginated posts, members only for private groups
- `POST`: auth required, must be member, validate `groupPostSchema`

### 4B: Pages

**`src/app/groups/page.tsx`** — `"use client"`
- Discovery: search groups, list with name/description/member count
- "Create Group" button
- "My Groups" tab

**`src/app/groups/[id]/page.tsx`** — `"use client"`
- Group header (name, description, member count, join/leave button)
- Post feed with author info
- Post composer at top (for members)

---

### 4C: Prisma Schema — Events

```prisma
model Event {
  id          String    @id @default(cuid())
  title       String
  description String?
  imageUrl    String?
  location    String?
  startDate   DateTime
  endDate     DateTime?
  hostId      String
  companyId   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  host    User        @relation(fields: [hostId], references: [id])
  company Company?    @relation(fields: [companyId], references: [id])
  rsvps   EventRsvp[]
}

model EventRsvp {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  status    String   @default("GOING")
  createdAt DateTime @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
}
```

Add to `User`: `hostedEvents Event[]`, `eventRsvps EventRsvp[]`
Add to `Company`: `events Event[]`

### 4C: Validation

```typescript
export const eventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().max(500).optional(),
  location: z.string().max(500).optional(),
  startDate: z.string().min(1),  // ISO date string
  endDate: z.string().optional(),
  companyId: z.string().optional(),
});

export const rsvpSchema = z.object({
  status: z.enum(["GOING", "INTERESTED"]),
});
```

### 4C: API Routes

**`src/app/api/events/route.ts`**
- `GET`: upcoming events (`startDate > now`), paginated
- `POST`: auth required, validate `eventCreateSchema`

**`src/app/api/events/[id]/route.ts`**
- `GET`: event detail with RSVP count, user's RSVP status
- `PATCH`: auth required, host only
- `DELETE`: auth required, host only

**`src/app/api/events/[id]/rsvp/route.ts`**
- `POST`: auth required, toggle RSVP (create or delete), validate `rsvpSchema`

### 4C: Pages

**`src/app/events/page.tsx`** — `"use client"`
- List upcoming events as cards (title, date, location, RSVP count)
- "Create Event" button for authenticated users

**`src/app/events/[id]/page.tsx`** — `"use client"`
- Event detail: title, description, date/time, location, host info
- RSVP button (Going / Interested / Cancel)
- Attendee count

---

### 4D: Prisma Schema — Product Reviews

```prisma
model ProductReview {
  id        String   @id @default(cuid())
  productId String
  userId    String
  rating    Float
  body      String?
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId])
}
```

Add to `Product`: `avgRating Float @default(0)`, `reviewCount Int @default(0)`, `reviews ProductReview[]`
Add to `User`: `productReviews ProductReview[]`

### 4D: Validation

```typescript
export const productReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  body: z.string().max(1000).optional(),
});
```

### 4D: API & Components

**`src/app/api/products/[id]/reviews/route.ts`**
- `GET`: paginated reviews with author info
- `POST`: auth required, one per user (upsert), validate `productReviewSchema`, recalc avgRating + reviewCount in `$transaction`

**`src/components/ProductReviews.tsx`** — `"use client"`
- Star rating display, review list, submit form

---

### 4E: Leaderboards

**`src/app/api/leaderboard/route.ts`**
- `GET`: `?sort=points|recipes|followers`, return top 50 users with rank, name, image, score

**`src/app/leaderboard/page.tsx`** — `"use client"`
- Tabbed: Points / Recipes / Followers
- Rank list with medal icons for top 3

### Batch 4 Verification
```bash
npx prisma db push
npx next build
# Test: Send/receive messages, conversation list shows unread
# Test: Create group, join, post, leave
# Test: Create event, RSVP, view attendees
# Test: Submit product review, verify avg recalculation
# Test: Leaderboard shows correct rankings
```

---

## Batch 5 — Advanced Features

### 5A: AI Recipe Recommendations (No External AI)

**`src/lib/recommendations.ts`**
- `getRecommendations(userId, limit = 10)`:
  1. Fetch user's liked/saved/rated recipes → build category weights + difficulty preference
  2. Fetch candidate recipes (exclude already engaged)
  3. Score each: categoryMatch × 3 + difficultyMatch × 2 + popularity × 1 + recency × 1
  4. Return top N sorted by score

**`src/app/api/recommendations/route.ts`**
- `GET`: auth required, call `getRecommendations(session.user.id)`, return recipes with author/brand info

**`src/components/RecommendedRecipes.tsx`** — `"use client"`
- Horizontal scroll card list, title "Recommended for You"

**Modify:** `src/app/page.tsx` — add `<RecommendedRecipes />` section for logged-in users (below stories)

---

### 5B: Prisma Schema — Brew Journal

```prisma
model BrewLog {
  id          String   @id @default(cuid())
  userId      String
  recipeId    String?
  title       String
  notes       String?
  rating      Float?
  grindSize   String?
  waterTemp   Float?
  brewTime    Int?
  coffeeGrams Float?
  waterMl     Float?
  imageUrl    String?
  brewDate    DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe Recipe? @relation(fields: [recipeId], references: [id])
}
```

Add to `User`: `brewLogs BrewLog[]`
Add to `Recipe`: `brewLogs BrewLog[]`

### 5B: Validation

```typescript
export const brewLogSchema = z.object({
  title: z.string().min(1).max(200),
  recipeId: z.string().optional(),
  notes: z.string().max(2000).optional(),
  rating: z.number().min(1).max(5).optional(),
  grindSize: z.string().max(50).optional(),
  waterTemp: z.number().min(0).max(120).optional(),
  brewTime: z.number().int().min(1).max(86400).optional(),
  coffeeGrams: z.number().min(0).max(10000).optional(),
  waterMl: z.number().min(0).max(50000).optional(),
  imageUrl: z.string().max(500).optional(),
  brewDate: z.string().optional(),
});
```

### 5B: API Routes

**`src/app/api/journal/route.ts`**
- `GET`: auth required, user's brew logs, paginated, filterable by `?month=2026-03`
- `POST`: auth required, validate `brewLogSchema`, create BrewLog

**`src/app/api/journal/[id]/route.ts`**
- `GET`: auth required, own only
- `PATCH`: auth required, own only, validate `brewLogSchema.partial()`
- `DELETE`: auth required, own only

**`src/app/api/journal/stats/route.ts`**
- `GET`: auth required, return: total brews, brews this week, brews this month, current streak (consecutive days)

### 5B: Pages

**`src/app/journal/page.tsx`** — `"use client"`
- Stats summary cards at top
- Calendar month view showing which days had brews (colored dots)
- List of brew logs below calendar
- "Log a Brew" button

**`src/app/journal/new/page.tsx`** — `"use client"`
- Form: title, recipe selector (optional), notes, rating stars, grind size, water temp, brew time, coffee grams, water ml, image upload, date picker
- Query param `?recipeId=X` to pre-fill recipe

**`src/components/BrewCalendar.tsx`** — `"use client"`
- Month grid (7 columns for days of week)
- Green dot on days with brews
- Navigation arrows for prev/next month

**Modify:** `src/app/recipe/[id]/page.tsx` — add "Log this brew" button linking to `/journal/new?recipeId={id}`

---

### 5C: Multi-Language (i18n) — SKIP/DEFER
This requires route restructuring and translating every page. Recommend deferring to a dedicated phase.

---

### 5D: PWA / Offline Mode

**`public/manifest.json`**
```json
{
  "name": "BrewCraft",
  "short_name": "BrewCraft",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#25f459",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`public/sw.js`** — Service worker:
- Cache-first for static assets (`/_next/static/`, images, fonts)
- Network-first for API routes (`/api/`)
- Offline fallback → `/offline`

**`src/app/offline/page.tsx`**
- Simple page: "You're offline. Connect to the internet to continue."

**`public/icons/`** — Create placeholder icons (192x192 and 512x512 PNG)

**Modify:** `src/app/layout.tsx`
- Add `<link rel="manifest" href="/manifest.json" />`
- Add `<meta name="theme-color" content="#25f459" />`
- Add SW registration script in a `<script>` tag

### Batch 5 Verification
```bash
npx prisma db push
npx next build
# Test: Recommendations appear on home page for logged-in users
# Test: Create brew log, view in journal, see calendar dots
# Test: PWA installs from browser, offline page shows when disconnected
```

---

## Batch 6 — Admin & Operations

### 6A: Admin Guard Helper

**`src/lib/admin.ts`**
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  // Check role from DB (don't trust session alone)
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (!user || user.role !== "SUPERADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }
  return { error: null, session };
}
```

### 6A: Admin Pages

**`src/app/admin/layout.tsx`** — Server component
- Check auth + role, redirect to `/` if not SUPERADMIN
- Sidebar nav: Dashboard, Users, Brands, Recipes, Moderation, Verification, Analytics

**`src/app/admin/page.tsx`** — Stats dashboard
- Cards: total users, total recipes, total brands, total points issued
- Recent signups, recent recipes

**`src/app/admin/users/page.tsx`** — `"use client"`
- Searchable user list with pagination
- Each row: name, email, role dropdown (USER/CREATOR/BRAND_ADMIN/SUPERADMIN), status toggle (ACTIVE/SUSPENDED)
- Role change → audit log

**`src/app/admin/brands/page.tsx`** — `"use client"`
- List all companies with status filter (PENDING/APPROVED/REJECTED)
- Approve/Reject buttons → PATCH status

**`src/app/admin/recipes/page.tsx`** — `"use client"`
- Recipe list with feature/verify/delete actions

### 6A: Admin API Routes

**`src/app/api/admin/stats/route.ts`**
- `GET`: admin only, return aggregated counts

**`src/app/api/admin/users/route.ts`**
- `GET`: admin only, paginated users with search
- `PATCH`: admin only, body `{ userId, role?, status? }`, audit log the change

**`src/app/api/admin/brands/route.ts`**
- `GET`: admin only, all companies with owner info
- `PATCH`: admin only, body `{ companyId, status }`, audit log

### 6A: Middleware
- `src/middleware.ts` — add check: if path starts with `/admin`, verify SUPERADMIN role (can check via cookie/session)

---

### 6B: Prisma Schema — Reports

```prisma
model Report {
  id         String   @id @default(cuid())
  reporterId String
  reason     String
  details    String?
  entityType String
  entityId   String
  status     String   @default("PENDING")
  reviewedBy String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  reporter User @relation(fields: [reporterId], references: [id], onDelete: Cascade)

  @@index([status])
}
```

Add to `User`: `reports Report[]`

### 6B: Validation

```typescript
export const reportSchema = z.object({
  reason: z.enum(["spam", "inappropriate", "harassment", "misinformation", "other"]),
  details: z.string().max(1000).optional(),
  entityType: z.enum(["recipe", "comment", "gallery_post", "user"]),
  entityId: z.string().min(1),
});
```

### 6B: API & Pages

**`src/app/api/reports/route.ts`**
- `POST`: auth required, rate limited (10/day per user), validate `reportSchema`, prevent duplicate reports

**`src/app/api/admin/reports/route.ts`**
- `GET`: admin only, pending reports queue with reporter info
- `PATCH`: admin only, body `{ reportId, status, action? }`, audit log

**`src/app/admin/moderation/page.tsx`** — `"use client"`
- Report queue: entity preview, reporter info, reason, action buttons (Dismiss / Take Action)

**`src/components/ReportButton.tsx`** — `"use client"`
- Dropdown or modal with reason selector + optional details
- Shows on recipe detail, gallery post detail, comments

---

### 6C: Prisma Schema — Brand Applications

```prisma
model BrandApplication {
  id          String   @id @default(cuid())
  companyId   String
  applicantId String
  documents   String?
  status      String   @default("PENDING")
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  applicant User    @relation(fields: [applicantId], references: [id], onDelete: Cascade)
}
```

Add to `Company`: `applications BrandApplication[]`
Add to `User`: `brandApplications BrandApplication[]`

### 6C: API & Pages

**`src/app/api/brands/verify/route.ts`**
- `POST`: auth required, company owner only, submit verification application with documents

**`src/app/api/admin/verification/route.ts`**
- `GET`: admin only, pending applications
- `PATCH`: admin only, approve (set `company.isVerified = true`) or reject, audit log

**`src/app/brand/[id]/verify/page.tsx`** — `"use client"`
- Application form: upload documents, submit for review

**`src/app/admin/verification/page.tsx`** — `"use client"`
- Review queue: company info, documents, approve/reject buttons

---

### 6D: Platform Analytics

**`src/app/api/admin/analytics/route.ts`**
- `GET`: admin only, return:
  - New users per week (last 12 weeks)
  - New recipes per week
  - Engagement: total likes, comments, follows per week
  - Category breakdown (recipes per category)

**`src/app/admin/analytics/page.tsx`** — `"use client"`
- Tables and CSS bar charts showing trends
- No external chart library needed

### Batch 6 Verification
```bash
npx prisma db push
npx next build
# Test: Only SUPERADMIN can access /admin/* routes
# Test: Admin can change user roles, approve/reject brands
# Test: Reports can be submitted and reviewed
# Test: Brand verification flow works end-to-end
```

---

## Implementation Order

```
Batch 1 (Comments, Collections) ← START HERE
  └─→ Batch 2 (Feed, Stories, Notifications)
        └─→ Batch 4 (DM, Groups, Events, Reviews, Leaderboards)

Batch 3 (Monetization) ← can run parallel with 1-2

Batch 5 (Recommendations, Journal, PWA) ← after Batch 1

Batch 6 (Admin) ← after Batch 4 for full value
```

## After EACH Batch
1. `npx prisma db push` — sync schema to SQLite
2. `npx next build` — verify zero TypeScript errors
3. Test each new API endpoint
4. Test each new page in browser
5. Verify dark mode works on all new UI

## Total New Models: 20
| Batch | Models |
|-------|--------|
| 1 | Comment, Collection, CollectionRecipe |
| 2 | ActivityEvent, Story, StoryView, PushSubscription |
| 3 | BrandView |
| 4 | Conversation, ConversationParticipant, Message, Group, GroupMember, GroupPost, Event, EventRsvp, ProductReview |
| 5 | BrewLog |
| 6 | Report, BrandApplication |
