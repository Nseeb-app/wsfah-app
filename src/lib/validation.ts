import { z } from "zod/v4";

// ── Helper ──

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T; error?: undefined } | { ok: false; data?: undefined; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues.map((i) => i.message).join(", ") };
}

// ── Password policy ──

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a digit");

// ── Auth ──

export const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.email("Invalid email").optional(),
  phone: z.string().max(20).optional(),
  password: passwordSchema,
});

export const sendOtpSchema = z.object({
  phone: z.string().min(6, "Phone number required").max(20, "Phone number too long"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

// ── Recipe ──

export const recipeCreateSchema = z.object({
  title: z.string().min(1, "Title required").max(200, "Title too long"),
  description: z.string().max(5000).optional().nullable(),
  category: z.string().min(1, "Category required").max(100),
  difficulty: z.string().max(50).optional(),
  brewTime: z.string().max(50).optional().nullable(),
  brewTimeSeconds: z.number().int().min(1).max(86400).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  brandId: z.string().max(100).optional().nullable(),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        baseAmount: z.number().min(0).max(100000),
        unit: z.string().min(1).max(50),
      })
    )
    .max(50)
    .optional(),
  steps: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(2000),
      })
    )
    .max(50)
    .optional(),
  brewParams: z
    .object({
      temperature: z.string().max(50),
      ratio: z.string().max(50),
      grindSize: z.string().max(50),
      brewTimeSec: z.number().int().min(1).max(86400).optional(),
    })
    .optional()
    .nullable(),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

// ── Rating ──

export const ratingSchema = z.object({
  rating: z.number().min(1, "Min rating is 1").max(5, "Max rating is 5"),
});

// ── Company ──

export const companyCreateSchema = z.object({
  name: z.string().min(1, "Name required").max(200, "Name too long"),
  type: z.string().min(1, "Type required").max(50),
  description: z.string().max(2000).optional().nullable(),
  contactEmail: z.email("Invalid email").optional().nullable(),
  logo: z.string().max(500).optional().nullable(),
});

export const companyUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  contactEmail: z.email("Invalid email").optional().nullable(),
});

// ── Gallery ──

export const galleryPostSchema = z.object({
  imageUrl: z.string().min(1, "imageUrl required").max(500),
  caption: z.string().max(2000).optional().nullable(),
  companyId: z.string().max(100).optional().nullable(),
  mediaType: z.enum(["image", "video"]).optional(),
});

// ── Follow ──

export const followSchema = z.object({
  userId: z.string().min(1, "userId required"),
});

// ── Privacy ──

export const privacySchema = z.object({
  privacyFollowers: z.enum(["everyone", "followers", "none"]).optional(),
  privacyLikes: z.enum(["public", "private"]).optional(),
  privacySaved: z.enum(["public", "private"]).optional(),
});

// ── User update ──

export const userUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  email: z.email("Invalid email").optional(),
  phone: z.string().max(20).optional(),
  image: z.string().max(500).optional(),
  currentPassword: z.string().max(128).optional(),
  newPassword: passwordSchema.optional(),
});

// ── Product ──

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().min(0).max(999999),
  imageUrl: z.string().max(500).optional().nullable(),
  externalUrl: z.string().max(1000).optional().nullable(),
  brandId: z.string().min(1),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).max(999999).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  externalUrl: z.string().max(1000).optional().nullable(),
});

// ── Comment (for future use) ──

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
  parentId: z.string().optional().nullable(),
});

// ── Challenge ──

export const joinChallengeSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID required"),
});

// ── Rewards ──

export const redeemRewardSchema = z.object({
  rewardId: z.string().min(1, "Reward ID required"),
});

// ── Search limits ──

export const searchParamsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// ── Collection ──

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

// ── Messages ──

export const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export const conversationCreateSchema = z.object({
  userId: z.string().min(1, "User ID required"),
});

// ── Groups ──

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

// ── Events ──

export const eventCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().max(500).optional(),
  location: z.string().max(500).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  companyId: z.string().optional(),
});

export const rsvpSchema = z.object({
  status: z.enum(["GOING", "INTERESTED"]),
});

// ── Product Reviews ──

export const productReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  body: z.string().max(1000).optional(),
});

// ── Reports ──

export const reportSchema = z.object({
  reason: z.enum(["spam", "inappropriate", "harassment", "misinformation", "other"]),
  details: z.string().max(1000).optional(),
  entityType: z.enum(["recipe", "comment", "gallery_post", "user"]),
  entityId: z.string().min(1),
});

// ── Brew Log ──

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
