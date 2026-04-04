import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("جاري تهيئة قاعدة البيانات...");

  // ──── التصنيفات ────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "قهوة مقطرة", slug: "pour-over", icon: "coffee_maker" } }),
    prisma.category.create({ data: { name: "كولد برو", slug: "cold-brew", icon: "ac_unit" } }),
    prisma.category.create({ data: { name: "ماتشا", slug: "matcha", icon: "spa" } }),
    prisma.category.create({ data: { name: "إسبريسو", slug: "espresso", icon: "bolt" } }),
    prisma.category.create({ data: { name: "طقوس", slug: "rituals", icon: "self_improvement" } }),
    prisma.category.create({ data: { name: "شاي", slug: "tea", icon: "emoji_food_beverage" } }),
  ]);
  console.log(`تم إنشاء ${categories.length} تصنيفات`);

  // ──── الشارات ────
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: "محضّر متميز", icon: "emoji_events", color: "text-amber-500" } }),
    prisma.badge.create({ data: { name: "سلسلة ٧ أيام", icon: "local_fire_department", color: "text-orange-500" } }),
    prisma.badge.create({ data: { name: "محارب بيئي", icon: "eco", color: "text-green-600" } }),
    prisma.badge.create({ data: { name: "عضو ذهبي", icon: "workspace_premium", color: "text-primary" } }),
  ]);
  console.log(`تم إنشاء ${badges.length} شارات`);

  // ──── المستخدمون ────
  const defaultPassword = await hash("password123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "المدير العام",
      email: "admin@wsfa.app",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Eisln7x9cluXhHWg-D9M3gkoBEK0Of4_91XSwUuSnjJNFGV1yNLOvAkF3y1Bu9kL_ORjljfApRjtmwiv11BuFEp2SCzAhAmx2V-2zyBPojROsNDNhDcxzW49_9mdOjsbVcpz0CiSoL81hkWMz6HHaDzzfKYubOfogYR6A1OWnRIAZoor8Fi5f_QwyezOra6ni3ySJNQbBD0GAOHazGn89c9HItMLKap8FWVeeRCjmhFb8VTseU2--Z5bmjfvImKAd6uQPOkqJtFT",
      role: "SUPERADMIN",
      status: "ACTIVE",
      points: 9999,
    },
  });

  const ahmed = await prisma.user.create({
    data: {
      name: "أحمد حسن",
      email: "ahmed@example.com",
      phone: "+966501234567",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmsyRsgrm8xnMUAVJEyLN4Tk44RlDFgVP8Ox3mNILdrNxwk4BVOcLgC_8eRNvh5-Qoa9JZF0KsSesnBZ_7C5hvKqAqPYLtqlVz0zXgcFZcI8KgI1tpjdGqbSt4YP0Ud1-7avoAhAyrMg219a_HZYUcyBD9SEbUs97OLgUdG_s7I66gXYxXnVOKGVzvCjy3o1rjrJjwdEfc_TVz3FT23VqO3R84XsVMahfZhH7ySy_AJXISTS6hN1Yo1u19BIPlV9w-ZRwPQvF5FwYq",
      bio: "شغوف بالقهوة المختصة وفن التحضير اليدوي. دائماً أستكشف أصولاً جديدة.",
      role: "CREATOR",
      status: "ACTIVE",
      points: 2450,
      followers: 1200,
      following: 847,
      avgRating: 4.9,
      dailyStreak: 4,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "سارة الخالد",
      email: "sarah.j@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANjEYdn5IgGxaPNULKiSn5VPHOglVnWptj321KB0HVdxkkc7ePIZMzObqb2eqrH5ybg0KABHqxxZamN5V3W51HA6ZRTwnF-QaPBn5xg_5L2XG-oqLKByVLPTeN8lcrYqhx8FJB8bs1yoTtf62ooiELcVKJsf5s2ObKOcuS_HF1vQTlmVwZvqIM2B1ffUDaIb3l-gvcm79-pCE2fK4fbrH2G-1LSDE201n3QEKsgapoLtRW96Xt7uBKtEe4_pv9Zo0GBxdO-5NhSJVT",
      role: "CREATOR",
      status: "ACTIVE",
      points: 1820,
      followers: 530,
      following: 320,
      avgRating: 4.7,
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: "محمد العلي",
      email: "marcus@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDivFdItomrsqVKzhubSU7Wouajv33CNpHLiuKCpqU5DDEOIhwxFNGEtLw_Gaye1u71WWVSGO74H2r4kfVZ46NOCeMrcTCaSfAmRkG9h0crrawii7IXjm0Ub4SUJpYr-t1AkCoCv6NEL4XEZcddhOLzVrmXbqMCZTB-IO3hxXmzN_WjtvkxwYxhxBlIG11JLAAXbjeBBNF0UrXlbkDKOfRH9M3iVGZJIlX_H2g6QVFW9A6wUTalxj4MkRMf8yKWhMhRrZndPqUgA8uj",
      role: "USER",
      status: "ACTIVE",
      points: 890,
      followers: 120,
      following: 95,
      avgRating: 5.0,
    },
  });

  const elena = await prisma.user.create({
    data: {
      name: "نورة السالم",
      email: "elena.r@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLTuX3YO8qNjb5iEJ6YaxLsVKSoTs-jTBH0LBItsYey3zI8m2aPAJ0o8OYb5ZaFF4fLcqYaQNvhUUhVU5d7RQ02eqFn7FYihjjmmwJ27JSxlHVeEZxepX05xUsfZeRfeZmxO5QNaEiQoa4KpCpG3JBHaGoIEbrM69Wl3tVAFpXr1ryVDmGUQ_INKltN27ejnfQjl35M29yk71Ne32Dra9JOGVTEdYiQkTKAMq9RImIzOx6oExa3KuvolYy1meADmyRPrCZ-O84Qgd",
      role: "BRAND_ADMIN",
      status: "ACTIVE",
      points: 5200,
      followers: 2800,
      following: 150,
      avgRating: 4.8,
    },
  });

  const david = await prisma.user.create({
    data: {
      name: "خالد الراشد",
      email: "david.k@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4ptKs2l9G5SJbl8_7aWl1bjuY-pPL2io7hJT6sQH8H88sKKwBBmPcLOSCRzrWQIAnvEKxmY7YQGgTwuRVLa7gPomH0wmR6ff_cgQ_TCxv2fhogB1lJxuTEXewMROiXrJV8zJprqUJO9MjyrQcYa9UkiI-CC1iVLz6r6jFDKDyGmatipC-2vu0NEiJ5D5S3V-eE7giR0rf0r_xJW2KMJs_dnEv8GGE7zoXm_bIC3lY0YaN-exnTBPnYPmsMVYEFPB0YoYqSj0CooCF",
      role: "USER",
      status: "SUSPENDED",
      points: 120,
    },
  });

  const lina = await prisma.user.create({
    data: {
      name: "لينا باتل",
      email: "lina.p@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKkplgS55acV6bMKoIHjpdBwQSsCLmTB7I3jiKEZPf1CVBvrR9hbUe064w1bwo5AFWUMfe_0TbJ3ALcfBlA6UU-xWaSPbVPCyPtXs9mWoM1OLmO9BGiars9pgOi1edEBUqJwpW6nH3h3O82GbYPObrs1SQ-QYAOXoyZieNbLhJyfin1701oxNXPHsl1TtmszzZSAfgK5fyWdqES69oKzgpZ_4kabQjxWWWNF4a0dm4wE7oYZ3Hp4TxQGKUGFteh45b3kAQmDCeHTPX",
      role: "CREATOR",
      status: "INACTIVE",
      points: 650,
      followers: 240,
      following: 180,
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: "عبدالله المحضّر",
      email: "alex.b@example.com",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3",
      role: "CREATOR",
      status: "ACTIVE",
      points: 3100,
      followers: 890,
      following: 430,
      avgRating: 4.6,
      dailyStreak: 4,
    },
  });

  console.log("تم إنشاء ٨ مستخدمين + ١ مدير عام");

  // ──── شارات المستخدمين ────
  await Promise.all([
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[0].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[1].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[2].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[3].id } }),
  ]);
  console.log("تم تعيين الشارات لأحمد");

  // ──── الشركات ────
  const elixir = await prisma.company.create({
    data: {
      name: "محمصة الإكسير",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jXJPwKUQgikEpWHpXQI8hrbjMIxBqth6bHg27oyHBuX0lREY-z88wXQLXuhibGtChg50memocR4sYr_7OXT9fddokiqOVClbzGmOWu944qaTY1MVXvq2cQ-Jr4meiSFyhtIl-1kGr9XkVEs-el-s9A6kuWU532hjyNuahfVnO2qxnTRcoK5oCSUTMgNh6QM4-CP1_o5aoPLa3Um73RDjdVWn0dGe8ytTa1JO2_m1bJNXiAhVcgszMLAzEoXy3hecn7j6aFdaGrYP",
      type: "roaster",
      status: "APPROVED",
      description: "محمصة قهوة حرفية مكرّسة لاختيار أجود الحبوب. مصدر أخلاقي وتحميص دقيق.",
      contactEmail: "hello@elixirroasters.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  const ritual = await prisma.company.create({
    data: {
      name: "قهوة الطقوس",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe",
      type: "cafe",
      status: "APPROVED",
      description: "مقهى مختص يقدم قهوة من مصادر أخلاقية.",
      contactEmail: "info@ritualcoffee.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  const teaForte = await prisma.company.create({
    data: {
      name: "شاي فورتيه",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM4IsnEGVJY6xJyzeI9I723EtsEIVLw1kwL5EmdTcvTCa_pZ7IHu-LE_MU3tI_XPuLVPw5wJYolwr-UcyyXnpUlvuVn7C4dH7XCPkYuCv3G2Tdzd2b0vpgAHLf2HymbW6Rrj6kDUaaoKHAsHq34ICTTWJUY6K35kY2XFRwoHucdYkpgSBS18fc0u4cMr-CklqLI9dmgPh-V36dfxeKbS3U27W9pcbIDol6rKyVL2WILX_hIV77VT8dsOfUe6HFofbCrB1RvSduog27",
      type: "tea_brand",
      status: "APPROVED",
      description: "علامة شاي حرفية فاخرة.",
      contactEmail: "hello@teaforte.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "شركة معدات التحضير",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG4rnZ677jzT8JomwKGQLLcNaY4ZLBtyct-2CbNxbDqrdHfVAEp8BRuhe_XvrkAhx6x7reOZUbPcFRJnSea-WKMUZHzpkyCDcGkmwi-w2ej84WbA_-bggfCyegmi2EUo4LhK68c5pza-un2p6x3HB9owagbYYt51FOgVyqKYHSbschS8xQFNei_37cbwmPEjhQBbTuUJ18u405nWzEhq1ktKq6XAjjGPpGOVkhKqnV8viHOj4h9EGoZMQ8pKo8Hwdin5XJCJQWTByO",
      type: "equipment",
      status: "PENDING",
      description: "معدات تحضير احترافية لعشاق القهوة.",
      contactEmail: "sales@brewequip.co",
      ownerId: david.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "محمصة قمة الجبل",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5hyTbybc0D91Y3N3T2Vu3Mtv7yMhKJ_nKJuNDq_WyZclBKMs4KVNwjd-odjRf-8WOwraEaoTAuf6ZXxW96bgFETFRyVXsIoS6FjLkJAPc3Q6P1YX0vEOJ4kGFNUVsfjZivK6AtKHkmwejo_pF4ezfiPuNcHIU2l012aPzOeTzq3Cug8hgXJn5hY9Z_TzYDWUPWdRLSwXjKfX-GWENLjiF874-7rMYVH4AD8UywkYzixVT2h99sqSkbNF34TGB1YulOQyyJAzjKhjX",
      type: "roaster",
      status: "PENDING",
      description: "محمصة حرفية من المرتفعات.",
      contactEmail: "contact@mountainpeak.com",
      ownerId: lina.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "كافيين سريع",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrx_UMk-cEeK-i677HNEw-N1qTxUo_FCG3MYyJDt_0vazBF6l-sm-9gVtVwB12pSAkpNu8M4cSRB4XNoY7aRV27Zlh2Yr4w7wywlw8l3KF5O8flja0T2Px3BaXng8g4fDK_CwYj4Q0bmIWux-_ExuDQdS2cOPxJFBhrIl3_aE37RowjRZ0HoVHNn13STXo2wyaeMLmyOf7QmSYbY_5yXZ0QSdh9RllwkK9F5djBkm3pOJmQFRqOGoiObdoH0zornsrZXkcCeT5cWr",
      type: "cafe",
      status: "REJECTED",
      description: "توصيل كافيين سريع.",
      contactEmail: "info@quickcaff.com",
      ownerId: david.id,
    },
  });

  console.log("تم إنشاء ٦ شركات");

  // ──── المنتجات (محمصة الإكسير) ────
  await Promise.all([
    prisma.product.create({ data: { name: "إثيوبيا يرغاتشيف", price: 24.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAgGiNFJUTIPpmMYpgMymXY96vDmlr0g3jfM4-1uJU8UQJVKi7tFW3KyxrMrPy07ANPwwl7JsP75IktZ9_VK8fQvLYBgV1OvJBy3l1bnLbQFR5-I71mL9zZB0g1EBXnk9BtQ4aYcSEF4AS3SQ9PUcpAKLxJ7t9JYyoYqFZgU6if7bmfTAhwyqgrW5Q-2yTaDGcjYWafNWh8GMJKhTcwweY6h5e5Rjj7xKJsqRgqiGoTkSV_gqlVfi5VVXmRWunIDQCMSJaJB2nk92a", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "خلطة منتصف الليل", price: 21.5, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkqIp5466ipq1toOxd9vHhZqTFWelpCYDB0ic-BQXQnS4Qd0f3OsZEj36kIsF8JQVQ2AVTw1SFNr88FRr7GVzEO8uC24vw93DWBxXtL0lxz2S_wz1-nvO2FPLTjMqXRsJX3CH1KIBQzVwrrz3OT0qBCe5iJRmt5KJSjAN0r0HQ6vU643cF6uHI06PeKyEevaqiLSyVU0vo_tZLNMEVkNAUPL0jizWbquITKEfsMCh7JvNQ91fyKTTjsWbdcespKq0d0KaMgXoUB6p9", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "كولومبيا هويلا", price: 19.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoDBNbWkEB1HS9sq4bwjAWxK4AZZKANZ-YsCurO5mGRYncmE72ymrzzKnechfvoTBXK43aTi-c1JQEJQo4JJx2PQBbaJ4NEf6pVoaaogwwfQN8ZiThDqSq53qbQvHg2HuqOk7h75WQpvr-5qHIO5z3oT3ppGgw8lpzyvwIekM4sorgmZChjHXGWEwV0Vg3KARhKQZUGfIztIg4wlYQQ3OgDuNFrygyxknIh4x8_ruE3tkDp5wyR669m3kE0aLmRzsXnLsmh6xhFHsv", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "مركّز كولد برو", price: 16.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3", brandId: elixir.id } }),
  ]);
  console.log("تم إنشاء ٤ منتجات");

  // ──── الوصفات ────
  const honeyGesha = await prisma.recipe.create({
    data: {
      title: "قهوة جيشا معالجة بالعسل",
      slug: "honey-gesha",
      description: 'مصدرها من منحدرات بنما المرتفعة، تمثل قهوة جيشا المعالجة بالعسل قمة القهوة المختصة. تترك عملية "العسل" كمية محددة من لب حبة الكرز على البن أثناء التجفيف، مما ينتج كوباً يوازن بين أناقة جيشا الزهرية وحلاوة شرابية كثيفة وحموضة الفاكهة ذات النواة.',
      category: "قهوة مقطرة",
      difficulty: "متوسط",
      brewTime: "١٢ دقيقة",
      brewTimeSeconds: 180,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5hyTbybc0D91Y3N3T2Vu3Mtv7yMhKJ_nKJuNDq_WyZclBKMs4KVNwjd-odjRf-8WOwraEaoTAuf6ZXxW96bgFETFRyVXsIoS6FjLkJAPc3Q6P1YX0vEOJ4kGFNUVsfjZivK6AtKHkmwejo_pF4ezfiPuNcHIU2l012aPzOeTzq3Cug8hgXJn5hY9Z_TzYDWUPWdRLSwXjKfX-GWENLjiF874-7rMYVH4AD8UywkYzixVT2h99sqSkbNF34TGB1YulOQyyJAzjKhjX",
      source: "BRAND",
      rating: 4.9,
      likes: 342,
      isVerified: true,
      isFeatured: true,
      authorId: elena.id,
      brandId: elixir.id,
      ingredients: {
        create: [
          { name: "حبوب بن كاملة", baseAmount: 20, unit: "غ", sortOrder: 0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrx_UMk-cEeK-i677HNEw-N1qTxUo_FCG3MYyJDt_0vazBF6l-sm-9gVtVwB12pSAkpNu8M4cSRB4XNoY7aRV27Zlh2Yr4w7wywlw8l3KF5O8flja0T2Px3BaXng8g4fDK_CwYj4Q0bmIWux-_ExuDQdS2cOPxJFBhrIl3_aE37RowjRZ0HoVHNn13STXo2wyaeMLmyOf7QmSYbY_5yXZ0QSdh9RllwkK9F5djBkm3pOJmQFRqOGoiObdoH0zornsrZXkcCeT5cWr" },
          { name: "ماء (٩٣°م)", baseAmount: 320, unit: "مل", sortOrder: 1, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk4erBJ9WbbtN9o7efjJ_Ovc9i6kzfoN_4WffaKNO-jysDIig_InQkmotttu9x4ejKFp51hJEUnchB6We4IIYRpVL7sfb9NaMmis9kFlHw2DH_SoKHYp4YoTqNUb_S65wS1pt8WLDliPhi30lkJl7c5YPLq0c09zX2cI1Bj8FP7PqayzTh4NwltdKNqJ9ozJSvp9GDTrTX9md-IFH20ImN4F1Gfv8u7nr7afmqZqoZfkkIyGmoZvbvSZrw6KT87oIBGekoXQk2p_MT" },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, title: "التحضير والشطف", description: "ضع الفلتر في V60 واشطفه بالماء الساخن لإزالة أي طعم للورق وتسخين الوعاء مسبقاً.", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuPlSrJx6A-bavBPJedsz8H-D1JuCKWr_4E6Wu9F4Z0STNmLBwRhfRzvpZbgMTyFeDSxQG_0A0FLmV59-xqAM4nHsEjpjmO9Amg2TMdlx-ynJCKk0ZzsIrlBRKvZKTHkWcXF9M0os_55aERU1IhKK61Lh41Y82MzvKYZEZEzUPngYCNu0ccr4rrNwTdKiGO7nJUjotd_uh4yvUUK63KGqGg_P7EC4L4qCcmPdWj2qCwk2qGZ6UjpDNm6ZQnfdmM2gjCiralAIvqQ0" },
          { stepNumber: 2, title: "التفتح", description: "أضف البن المطحون. صب ٤٠ غرام من الماء وانتظر ٣٠ ثانية. هذا يسمح للغازات بالخروج لاستخلاص أنظف." },
          { stepNumber: 3, title: "الصب الرئيسي", description: "بحركة حلزونية بطيئة وثابتة، صب بقية الماء على طبقة البن. حافظ على معدل تدفق ثابت لاستخلاص متساوٍ." },
          { stepNumber: 4, title: "التصفية والتقديم", description: "اترك الماء يتصفى بالكامل عبر طبقة البن. يجب أن يكون إجمالي وقت التحضير حوالي ٣ دقائق. قدّمها فوراً." },
        ],
      },
      brewParams: {
        create: { temperature: "٩٣°م", ratio: "١:١٦", grindSize: "متوسط", brewTimeSec: 180 },
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "تقطير كيوتو البارد",
      slug: "kyoto-cold-drip",
      description: "كولد برو بالتقطير البطيء مستوحى من طريقة كيوتو التقليدية.",
      category: "كولد برو",
      difficulty: "متقدم",
      brewTime: "٨ ساعات",
      brewTimeSeconds: 28800,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe",
      source: "BRAND",
      rating: 4.8,
      likes: 287,
      isVerified: true,
      authorId: elena.id,
      brandId: ritual.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "ماتشا بمضرب الخيزران",
      slug: "bamboo-whisk-matcha",
      description: "تحضير ماتشا ياباني تقليدي بمضرب الخيزران.",
      category: "ماتشا",
      difficulty: "مبتدئ",
      brewTime: "٥ دقائق",
      brewTimeSeconds: 300,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDivFdItomrsqVKzhubSU7Wouajv33CNpHLiuKCpqU5DDEOIhwxFNGEtLw_Gaye1u71WWVSGO74H2r4kfVZ46NOCeMrcTCaSfAmRkG9h0crrawii7IXjm0Ub4SUJpYr-t1AkCoCv6NEL4XEZcddhOLzVrmXbqMCZTB-IO3hxXmzN_WjtvkxwYxhxBlIG11JLAAXbjeBBNF0UrXlbkDKOfRH9M3iVGZJIlX_H2g6QVFW9A6wUTalxj4MkRMf8yKWhMhRrZndPqUgA8uj",
      source: "COMMUNITY",
      rating: 4.9,
      likes: 189,
      authorId: sarah.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "كورتادو بحليب الشوفان",
      slug: "barista-oat-cortado",
      description: "كورتادو متوازن بشكل مثالي مع حليب الشوفان.",
      category: "إسبريسو",
      difficulty: "متوسط",
      brewTime: "٥ دقائق",
      brewTimeSeconds: 300,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG4rnZ677jzT8JomwKGQLLcNaY4ZLBtyct-2CbNxbDqrdHfVAEp8BRuhe_XvrkAhx6x7reOZUbPcFRJnSea-WKMUZHzpkyCDcGkmwi-w2ej84WbA_-bggfCyegmi2EUo4LhK68c5pza-un2p6x3HB9owagbYYt51FOgVyqKYHSbschS8xQFNei_37cbwmPEjhQBbTuUJ18u405nWzEhq1ktKq6XAjjGPpGOVkhKqnV8viHOj4h9EGoZMQ8pKo8Hwdin5XJCJQWTByO",
      source: "COMMUNITY",
      rating: 5.0,
      likes: 156,
      authorId: marcus.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "إيرل غراي بالأعشاب",
      slug: "botanical-earl-grey",
      description: "إيرل غراي عطري منقوع بالأعشاب الطبيعية.",
      category: "شاي",
      difficulty: "مبتدئ",
      brewTime: "٧ دقائق",
      brewTimeSeconds: 420,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM4IsnEGVJY6xJyzeI9I723EtsEIVLw1kwL5EmdTcvTCa_pZ7IHu-LE_MU3tI_XPuLVPw5wJYolwr-UcyyXnpUlvuVn7C4dH7XCPkYuCv3G2Tdzd2b0vpgAHLf2HymbW6Rrj6kDUaaoKHAsHq34ICTTWJUY6K35kY2XFRwoHucdYkpgSBS18fc0u4cMr-CklqLI9dmgPh-V36dfxeKbS3U27W9pcbIDol6rKyVL2WILX_hIV77VT8dsOfUe6HFofbCrB1RvSduog27",
      source: "BRAND",
      rating: 4.7,
      likes: 203,
      isVerified: true,
      authorId: elena.id,
      brandId: teaForte.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "تقطير الصباح",
      slug: "morning-ritual-pour-over",
      description: "تقطير صباحي نظيف ومشرق لبداية يومك.",
      category: "قهوة مقطرة",
      difficulty: "مبتدئ",
      brewTime: "١٠ دقائق",
      brewTimeSeconds: 600,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe",
      source: "COMMUNITY",
      rating: 4.8,
      likes: 234,
      authorId: ahmed.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "لاتيه اللافندر بحليب الشوفان",
      slug: "lavender-oat-latte",
      description: "لاتيه مهدّئ بحليب الشوفان المنقوع باللافندر.",
      category: "إسبريسو",
      difficulty: "مبتدئ",
      brewTime: "٥ دقائق",
      brewTimeSeconds: 300,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG4rnZ677jzT8JomwKGQLLcNaY4ZLBtyct-2CbNxbDqrdHfVAEp8BRuhe_XvrkAhx6x7reOZUbPcFRJnSea-WKMUZHzpkyCDcGkmwi-w2ej84WbA_-bggfCyegmi2EUo4LhK68c5pza-un2p6x3HB9owagbYYt51FOgVyqKYHSbschS8xQFNei_37cbwmPEjhQBbTuUJ18u405nWzEhq1ktKq6XAjjGPpGOVkhKqnV8viHOj4h9EGoZMQ8pKo8Hwdin5XJCJQWTByO",
      source: "COMMUNITY",
      rating: 4.9,
      likes: 189,
      authorId: ahmed.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "حفل ماتشا مثلج",
      slug: "iced-matcha-ceremony",
      description: "تحضير ماتشا مثلج منعش بأسلوب الحفل التقليدي.",
      category: "ماتشا",
      difficulty: "متوسط",
      brewTime: "٨ دقائق",
      brewTimeSeconds: 480,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDivFdItomrsqVKzhubSU7Wouajv33CNpHLiuKCpqU5DDEOIhwxFNGEtLw_Gaye1u71WWVSGO74H2r4kfVZ46NOCeMrcTCaSfAmRkG9h0crrawii7IXjm0Ub4SUJpYr-t1AkCoCv6NEL4XEZcddhOLzVrmXbqMCZTB-IO3hxXmzN_WjtvkxwYxhxBlIG11JLAAXbjeBBNF0UrXlbkDKOfRH9M3iVGZJIlX_H2g6QVFW9A6wUTalxj4MkRMf8yKWhMhRrZndPqUgA8uj",
      source: "COMMUNITY",
      rating: 5.0,
      likes: 312,
      authorId: ahmed.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: "مركّز كولد برو",
      slug: "cold-brew-concentrate",
      description: "مركّز كولد برو قوي مثالي للخلط.",
      category: "كولد برو",
      difficulty: "مبتدئ",
      brewTime: "١٢ ساعة",
      brewTimeSeconds: 43200,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3",
      source: "COMMUNITY",
      rating: 4.7,
      likes: 156,
      authorId: ahmed.id,
    },
  });

  console.log("تم إنشاء ٩ وصفات");

  // ──── المكافآت ────
  await Promise.all([
    prisma.reward.create({ data: { title: "خصم ٢٠٪ على إثيوبيا يرغاتشيف", category: "خصم علامة تجارية", pointsCost: 800, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLTuX3YO8qNjb5iEJ6YaxLsVKSoTs-jTBH0LBItsYey3zI8m2aPAJ0o8OYb5ZaFF4fLcqYaQNvhUUhVU5d7RQ02eqFn7FYihjjmmwJ27JSxlHVeEZxepX05xUsfZeRfeZmxO5QNaEiQoa4KpCpG3JBHaGoIEbrM69Wl3tVAFpXr1ryVDmGUQ_INKltN27ejnfQjl35M29yk71Ne32Dra9JOGVTEdYiQkTKAMq9RImIzOx6oExa3KuvolYy1meADmyRPrCZ-O84Qgd" } }),
    prisma.reward.create({ data: { title: "عينة حزمة تحميص اكتشافية", category: "عينة مجانية", pointsCost: 1200, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4ptKs2l9G5SJbl8_7aWl1bjuY-pPL2io7hJT6sQH8H88sKKwBBmPcLOSCRzrWQIAnvEKxmY7YQGgTwuRVLa7gPomH0wmR6ff_cgQ_TCxv2fhogB1lJxuTEXewMROiXrJV8zJprqUJO9MjyrQcYa9UkiI-CC1iVLz6r6jFDKDyGmatipC-2vu0NEiJ5D5S3V-eE7giR0rf0r_xJW2KMJs_dnEv8GGE7zoXm_bIC3lY0YaN-exnTBPnYPmsMVYEFPB0YoYqSj0CooCF" } }),
    prisma.reward.create({ data: { title: "كوب حرفي إصدار محدود", category: "بضائع", pointsCost: 2800, isEnabled: false, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Eisln7x9cluXhHWg-D9M3gkoBEK0Of4_91XSwUuSnjJNFGV1yNLOvAkF3y1Bu9kL_ORjljfApRjtmwiv11BuFEp2SCzAhAmx2V-2zyBPojROsNDNhDcxzW49_9mdOjsbVcpz0CiSoL81hkWMz6HHaDzzfKYubOfogYR6A1OWnRIAZoor8Fi5f_QwyezOra6ni3ySJNQbBD0GAOHazGn89c9HItMLKap8FWVeeRCjmhFb8VTseU2--Z5bmjfvImKAd6uQPOkqJtFT" } }),
    prisma.reward.create({ data: { title: "ورشة تذوق إلكترونية", category: "تجربة", pointsCost: 2000, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKkplgS55acV6bMKoIHjpdBwQSsCLmTB7I3jiKEZPf1CVBvrR9hbUe064w1bwo5AFWUMfe_0TbJ3ALcfBlA6UU-xWaSPbVPCyPtXs9mWoM1OLmO9BGiars9pgOi1edEBUqJwpW6nH3h3O82GbYPObrs1SQ-QYAOXoyZieNbLhJyfin1701oxNXPHsl1TtmszzZSAfgK5fyWdqES69oKzgpZ_4kabQjxWWWNF4a0dm4wE7oYZ3Hp4TxQGKUGFteh45b3kAQmDCeHTPX" } }),
  ]);
  console.log("تم إنشاء ٤ مكافآت");

  // ──── التحديات ────
  const ch1 = await prisma.challenge.create({ data: { title: "جرّب ٥ تحميصات هذا الشهر", description: "جرّب ٥ أنماط تحميص مختلفة في شهر واحد", icon: "coffee_maker", rewardPoints: 500, maxProgress: 5, rank: "Bronze", category: "تحضير" } });
  const ch2 = await prisma.challenge.create({ data: { title: "محضّر صديق للبيئة", description: "استخدم فلتر قابل لإعادة الاستخدام ١٠ مرات", icon: "eco", rewardPoints: 300, maxProgress: 10, rank: "Bronze", category: "عام" } });
  const ch3 = await prisma.challenge.create({ data: { title: "شارك ٣ وصفات", description: "أنشئ وانشر ٣ وصفات أصلية", icon: "share", rewardPoints: 400, maxProgress: 3, rank: "Bronze", category: "اجتماعي" } });
  const ch4 = await prisma.challenge.create({ data: { title: "سيّد سلسلة ٧ أيام", description: "حافظ على سلسلة تحضير لمدة ٧ أيام", icon: "local_fire_department", rewardPoints: 700, maxProgress: 7, rank: "Silver", category: "سلسلة" } });
  const ch5 = await prisma.challenge.create({ data: { title: "متقن التقطير", description: "حضّر ١٥ وصفة قهوة مقطرة", icon: "coffee", rewardPoints: 800, maxProgress: 15, rank: "Silver", category: "تحضير" } });
  const ch6 = await prisma.challenge.create({ data: { title: "قائد المجتمع", description: "احصل على ٥٠ إعجاب على وصفاتك", icon: "favorite", rewardPoints: 1000, maxProgress: 50, rank: "Gold", category: "اجتماعي" } });
  const ch7 = await prisma.challenge.create({ data: { title: "محضّر محترف", description: "أكمل ٢٠ وصفة مختلفة", icon: "workspace_premium", rewardPoints: 1500, maxProgress: 20, rank: "Gold", category: "تحضير" } });

  // ──── تحديات برو ────
  const ch8 = await prisma.challenge.create({ data: { title: "جلسة تذوق نخبة", description: "قيّم وراجع ١٠ أنواع قهوة أحادية المصدر مع ملاحظات تذوق مفصلة", icon: "wine_bar", rewardPoints: 1200, maxProgress: 10, rank: "Gold", category: "تحضير", requiredTier: "pro" } });
  const ch9 = await prisma.challenge.create({ data: { title: "مستكشف التحميص برو", description: "جرّب قهوة من ٨ محمصات مختلفة في التطبيق", icon: "explore", rewardPoints: 1500, maxProgress: 8, rank: "Silver", category: "عام", requiredTier: "pro" } });
  const ch10 = await prisma.challenge.create({ data: { title: "مبتكر الوصفات", description: "أنشئ ٥ وصفات بطرق تحضير فريدة", icon: "science", rewardPoints: 2000, maxProgress: 5, rank: "Gold", category: "تحضير", requiredTier: "pro" } });
  const ch11 = await prisma.challenge.create({ data: { title: "سفير العلامة التجارية", description: "تابع وتفاعل مع ٥ علامات محمصة مختلفة", icon: "storefront", rewardPoints: 800, maxProgress: 5, rank: "Silver", category: "اجتماعي", requiredTier: "pro" } });
  const ch12 = await prisma.challenge.create({ data: { title: "سلسلة تحضير ٣٠ يوم", description: "حافظ على سلسلة تحضير متواصلة لمدة ٣٠ يوماً", icon: "military_tech", rewardPoints: 3000, maxProgress: 30, rank: "Gold", category: "سلسلة", requiredTier: "pro" } });

  await Promise.all([
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch1.id, currentProgress: 3 } }),
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch2.id, currentProgress: 2 } }),
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch3.id, currentProgress: 1 } }),
  ]);
  console.log(`تم إنشاء ١٢ تحدي (٧ مجاني، ٥ برو) مع تقدم المستخدم`);

  // ──── أعضاء فريق الشركة ────
  // محمصة الإكسير (باقة برو) — المالكة نورة + ٢ أعضاء فريق
  await prisma.company.update({ where: { id: elixir.id }, data: { subscriptionTier: "pro" } });
  await prisma.companyMember.create({
    data: { companyId: elixir.id, userId: ahmed.id, role: "admin", invitedBy: elena.id },
  });
  await prisma.companyMember.create({
    data: { companyId: elixir.id, userId: sarah.id, role: "staff", invitedBy: elena.id },
  });
  // قهوة الطقوس (باقة أساسية) — المالكة نورة فقط (مقعد واحد)
  await prisma.company.update({ where: { id: ritual.id }, data: { subscriptionTier: "basic" } });
  console.log("تم إنشاء أعضاء فريق الشركة (الإكسير: ٣ مقاعد، الطقوس: مقعد واحد)");

  // ──── الولاء: بطاقات الطوابع ────
  const stampCard1 = await prisma.stampCard.create({
    data: {
      companyId: elixir.id,
      title: "اشترِ ٥ لاتيه واحصل على واحد مجاناً",
      description: "اجمع طابعاً مع كل عملية شراء لاتيه. أكمل البطاقة لتحصل على لاتيه مجاني!",
      stampsRequired: 5,
      rewardDescription: "١ لاتيه مجاني",
      stampCooldownMinutes: 30,
      maxCompletions: 0,
    },
  });
  const stampCard2 = await prisma.stampCard.create({
    data: {
      companyId: elixir.id,
      title: "بطاقة عشاق البن",
      description: "اشترِ ١٠ أكياس بن واحصل على الكيس الحادي عشر مجاناً.",
      stampsRequired: 10,
      rewardDescription: "١ كيس بن ٢٥٠ غرام مجاني",
      stampCooldownMinutes: 60,
      maxCompletions: 3,
    },
  });
  const stampCard3 = await prisma.stampCard.create({
    data: {
      companyId: ritual.id,
      title: "زبون الطقوس الدائم",
      description: "٦ زيارات لفتح معجنات مجانية مع قهوتك القادمة.",
      stampsRequired: 6,
      rewardDescription: "معجنات مجانية + قهوة",
      stampCooldownMinutes: 120,
      maxCompletions: 0,
    },
  });

  // أحمد لديه ٣ طوابع على بطاقة اللاتيه
  await prisma.userStampCard.create({
    data: {
      userId: ahmed.id,
      stampCardId: stampCard1.id,
      currentStamps: 3,
      lastStampAt: new Date(),
    },
  });

  console.log(`تم إنشاء ٣ بطاقات طوابع مع تقدم المستخدم`);

  // ──── الولاء: مكافآت العلامة التجارية ────
  await Promise.all([
    prisma.brandReward.create({
      data: {
        companyId: elixir.id,
        title: "قهوة مقطرة أحادية المصدر مجانية",
        description: "استبدل للحصول على قهوة مقطرة أحادية المصدر مجانية في أي فرع من فروع محمصة الإكسير.",
        pointsCost: 500,
        publishToMain: true,
      },
    }),
    prisma.brandReward.create({
      data: {
        companyId: elixir.id,
        title: "كيس إثيوبيا يرغاتشيف ٢٥٠ غرام",
        description: "خذ معك كيساً من حبوب إثيوبيا يرغاتشيف المميزة لدينا.",
        pointsCost: 1200,
        stock: 20,
        publishToMain: true,
      },
    }),
    prisma.brandReward.create({
      data: {
        companyId: ritual.id,
        title: "جلسة تذوق مجانية",
        description: "انضم إلى جلسة التذوق الأسبوعية مجاناً — اكتشف نكهات جديدة.",
        pointsCost: 800,
        publishToMain: false,
      },
    }),
  ]);
  console.log(`تم إنشاء ٣ مكافآت علامة تجارية`);

  // ──── الولاء: كوبونات العلامة التجارية ────
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.brandCoupon.create({
      data: {
        companyId: elixir.id,
        title: "خصم ٢٠٪ على جميع البن هذا الأسبوع",
        description: "صالح على جميع أكياس البن ٢٥٠ غرام و١ كيلو. في المتجر فقط.",
        couponCode: "BEANS20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        startDate: now,
        endDate: weekFromNow,
      },
    }),
    prisma.brandCoupon.create({
      data: {
        companyId: ritual.id,
        title: "معجنات مجانية مع أي قهوة",
        description: "اعرض هذا الكوبون للحصول على معجنات مجانية عند طلب أي قهوة ساخنة أو مثلجة.",
        discountType: "FREEBIE",
        startDate: now,
        endDate: monthFromNow,
        maxUses: 50,
      },
    }),
  ]);
  console.log(`تم إنشاء ٢ كوبون علامة تجارية`);

  console.log("اكتملت تهيئة قاعدة البيانات!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
