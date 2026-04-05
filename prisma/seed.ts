import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("جاري تهيئة قاعدة البيانات للإنتاج...");

  // ──── المدير العام ────
  const adminPassword = await hash("Wsfa@2026", 12);
  const admin = await prisma.user.upsert({
    where: { email: "info@wsfa.app" },
    update: {},
    create: {
      name: "مدير وصفة",
      email: "info@wsfa.app",
      password: adminPassword,
      role: "SUPERADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✓ المدير العام: ${admin.email}`);

  // ──── التصنيفات ────
  const categoryData = [
    { name: "قهوة مقطرة", slug: "pour-over", icon: "coffee_maker" },
    { name: "كولد برو", slug: "cold-brew", icon: "ac_unit" },
    { name: "إسبريسو", slug: "espresso", icon: "bolt" },
    { name: "ماتشا", slug: "matcha", icon: "spa" },
    { name: "شاي", slug: "tea", icon: "emoji_food_beverage" },
    { name: "طقوس", slug: "rituals", icon: "self_improvement" },
  ];
  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✓ ${categoryData.length} تصنيفات`);

  // ──── الشارات ────
  const badgeData = [
    { name: "محضّر متميز", icon: "emoji_events", color: "#FFD700" },
    { name: "سلسلة ٧ أيام", icon: "local_fire_department", color: "#FF6B35" },
    { name: "محارب بيئي", icon: "eco", color: "#4CAF50" },
    { name: "عضو ذهبي", icon: "workspace_premium", color: "#FFC107" },
  ];
  for (const badge of badgeData) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }
  console.log(`✓ ${badgeData.length} شارات`);

  // ──── التحديات ────
  const challengeData = [
    {
      title: "محضّر الأسبوع",
      description: "حضّر ٥ وصفات مختلفة هذا الأسبوع",
      icon: "coffee",
      rewardPoints: 50,
      maxProgress: 5,
      rank: "Bronze",
      category: "Brewing",
    },
    {
      title: "أول وصفة",
      description: "شارك أول وصفة لك مع المجتمع",
      icon: "edit",
      rewardPoints: 30,
      maxProgress: 1,
      rank: "Bronze",
      category: "Social",
    },
    {
      title: "سلسلة ٧ أيام",
      description: "حضّر كوب قهوة لمدة ٧ أيام متتالية",
      icon: "local_fire_department",
      rewardPoints: 100,
      maxProgress: 7,
      rank: "Silver",
      category: "Streak",
    },
  ];
  for (const challenge of challengeData) {
    const existing = await prisma.challenge.findFirst({ where: { title: challenge.title } });
    if (!existing) {
      await prisma.challenge.create({ data: challenge });
    }
  }
  console.log(`✓ ${challengeData.length} تحديات`);

  // ──── قوالب التحضير ────
  const templateData = [
    { name: "V60", icon: "coffee_maker", temperature: "93°C", ratio: "1:15", grindSize: "متوسط", brewTimeSec: 210, description: "ترشيح نظيف ومشرق" },
    { name: "AeroPress", icon: "coffee", temperature: "85°C", ratio: "1:12", grindSize: "متوسط ناعم", brewTimeSec: 120, description: "ناعم ومركز" },
    { name: "French Press", icon: "coffee", temperature: "96°C", ratio: "1:15", grindSize: "خشن", brewTimeSec: 240, description: "قوام كامل وغني" },
    { name: "Espresso", icon: "bolt", temperature: "93°C", ratio: "1:2", grindSize: "ناعم جداً", brewTimeSec: 28, description: "مكثف مع كريما" },
    { name: "Cold Brew", icon: "ac_unit", temperature: "بارد", ratio: "1:8", grindSize: "خشن", brewTimeSec: 43200, description: "ناعم وحلو، ١٢ ساعة" },
    { name: "Chemex", icon: "coffee_maker", temperature: "94°C", ratio: "1:16", grindSize: "متوسط خشن", brewTimeSec: 270, description: "نظيف وحلو" },
    { name: "Moka Pot", icon: "coffee", temperature: "على الموقد", ratio: "1:10", grindSize: "ناعم", brewTimeSec: 300, description: "قوي، على الموقد" },
    { name: "Turkish", icon: "coffee", temperature: "على الموقد", ratio: "1:10", grindSize: "ناعم جداً", brewTimeSec: 180, description: "تقليدي، بدون فلتر" },
  ];
  for (const tmpl of templateData) {
    await prisma.brewingTemplate.upsert({
      where: { name: tmpl.name },
      update: {},
      create: tmpl,
    });
  }
  console.log(`✓ ${templateData.length} قوالب تحضير`);

  // ──── خطط الاشتراك ────
  const planData = [
    { name: "مجاني", slug: "free", price: 0, currency: "SAR", interval: "monthly", description: "الخطة الأساسية المجانية", features: JSON.stringify(["تصفح الوصفات", "مؤقت تحضير", "٣ وصفات", "بحث أساسي"]), sortOrder: 0 },
    { name: "احترافي", slug: "pro", price: 4.99, currency: "SAR", interval: "monthly", description: "للمحضّرين الجادين", features: JSON.stringify(["وصفات غير محدودة", "دفتر التحضير", "المجموعات", "الرسائل", "المعرض"]), sortOrder: 1 },
    { name: "احترافي سنوي", slug: "pro-yearly", price: 49.99, currency: "SAR", interval: "yearly", description: "وفّر ١٧٪ مع الاشتراك السنوي", features: JSON.stringify(["كل مميزات الاحترافي", "خصم ١٧٪"]), sortOrder: 2 },
  ];
  for (const plan of planData) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }
  console.log(`✓ ${planData.length} خطط اشتراك`);

  console.log("\n✅ تمت تهيئة قاعدة البيانات بنجاح!");
}

main()
  .catch((e) => {
    console.error("❌ خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
