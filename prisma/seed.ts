import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ──── Categories ────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Pour Over", slug: "pour-over", icon: "coffee_maker" } }),
    prisma.category.create({ data: { name: "Cold Brew", slug: "cold-brew", icon: "ac_unit" } }),
    prisma.category.create({ data: { name: "Matcha", slug: "matcha", icon: "spa" } }),
    prisma.category.create({ data: { name: "Espresso", slug: "espresso", icon: "bolt" } }),
    prisma.category.create({ data: { name: "Rituals", slug: "rituals", icon: "self_improvement" } }),
    prisma.category.create({ data: { name: "Tea", slug: "tea", icon: "emoji_food_beverage" } }),
  ]);
  console.log(`Created ${categories.length} categories`);

  // ──── Badges ────
  const badges = await Promise.all([
    prisma.badge.create({ data: { name: "Top Brewer", icon: "emoji_events", color: "text-amber-500" } }),
    prisma.badge.create({ data: { name: "7-Day Streak", icon: "local_fire_department", color: "text-orange-500" } }),
    prisma.badge.create({ data: { name: "Eco Warrior", icon: "eco", color: "text-green-600" } }),
    prisma.badge.create({ data: { name: "Gold Member", icon: "workspace_premium", color: "text-primary" } }),
  ]);
  console.log(`Created ${badges.length} badges`);

  // ──── Users ────
  const defaultPassword = await hash("password123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
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
      name: "Ahmed Hassan",
      email: "ahmed@example.com",
      phone: "+966501234567",
      password: defaultPassword,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmsyRsgrm8xnMUAVJEyLN4Tk44RlDFgVP8Ox3mNILdrNxwk4BVOcLgC_8eRNvh5-Qoa9JZF0KsSesnBZ_7C5hvKqAqPYLtqlVz0zXgcFZcI8KgI1tpjdGqbSt4YP0Ud1-7avoAhAyrMg219a_HZYUcyBD9SEbUs97OLgUdG_s7I66gXYxXnVOKGVzvCjy3o1rjrJjwdEfc_TVz3FT23VqO3R84XsVMahfZhH7ySy_AJXISTS6hN1Yo1u19BIPlV9w-ZRwPQvF5FwYq",
      bio: "Passionate about specialty coffee and the art of manual brewing. Always exploring new origins.",
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
      name: "Sarah Johnson",
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
      name: "Marcus Lee",
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
      name: "Elena Rodriguez",
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
      name: "David Kim",
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
      name: "Lina Patel",
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
      name: "Alex Brewmaster",
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

  console.log("Created 8 users + 1 superadmin");

  // ──── User Badges ────
  await Promise.all([
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[0].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[1].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[2].id } }),
    prisma.userBadge.create({ data: { userId: ahmed.id, badgeId: badges[3].id } }),
  ]);
  console.log("Assigned badges to Ahmed");

  // ──── Companies ────
  const elixir = await prisma.company.create({
    data: {
      name: "Elixir Roasters",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jXJPwKUQgikEpWHpXQI8hrbjMIxBqth6bHg27oyHBuX0lREY-z88wXQLXuhibGtChg50memocR4sYr_7OXT9fddokiqOVClbzGmOWu944qaTY1MVXvq2cQ-Jr4meiSFyhtIl-1kGr9XkVEs-el-s9A6kuWU532hjyNuahfVnO2qxnTRcoK5oCSUTMgNh6QM4-CP1_o5aoPLa3Um73RDjdVWn0dGe8ytTa1JO2_m1bJNXiAhVcgszMLAzEoXy3hecn7j6aFdaGrYP",
      type: "roaster",
      status: "APPROVED",
      description: "Artisanal coffee roasters dedicated to the perfect bean. Sourced ethically, roasted with precision.",
      contactEmail: "hello@elixirroasters.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  const ritual = await prisma.company.create({
    data: {
      name: "Ritual Coffee",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe",
      type: "cafe",
      status: "APPROVED",
      description: "Specialty cafe serving ethically sourced coffee.",
      contactEmail: "info@ritualcoffee.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  const teaForte = await prisma.company.create({
    data: {
      name: "Tea Fort\u00e9",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM4IsnEGVJY6xJyzeI9I723EtsEIVLw1kwL5EmdTcvTCa_pZ7IHu-LE_MU3tI_XPuLVPw5wJYolwr-UcyyXnpUlvuVn7C4dH7XCPkYuCv3G2Tdzd2b0vpgAHLf2HymbW6Rrj6kDUaaoKHAsHq34ICTTWJUY6K35kY2XFRwoHucdYkpgSBS18fc0u4cMr-CklqLI9dmgPh-V36dfxeKbS3U27W9pcbIDol6rKyVL2WILX_hIV77VT8dsOfUe6HFofbCrB1RvSduog27",
      type: "tea_brand",
      status: "APPROVED",
      description: "Premium artisan tea brand.",
      contactEmail: "hello@teaforte.com",
      isVerified: true,
      ownerId: elena.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "Brew Equipment Co.",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG4rnZ677jzT8JomwKGQLLcNaY4ZLBtyct-2CbNxbDqrdHfVAEp8BRuhe_XvrkAhx6x7reOZUbPcFRJnSea-WKMUZHzpkyCDcGkmwi-w2ej84WbA_-bggfCyegmi2EUo4LhK68c5pza-un2p6x3HB9owagbYYt51FOgVyqKYHSbschS8xQFNei_37cbwmPEjhQBbTuUJ18u405nWzEhq1ktKq6XAjjGPpGOVkhKqnV8viHOj4h9EGoZMQ8pKo8Hwdin5XJCJQWTByO",
      type: "equipment",
      status: "PENDING",
      description: "Professional brewing equipment for enthusiasts.",
      contactEmail: "sales@brewequip.co",
      ownerId: david.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "Mountain Peak Roasters",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5hyTbybc0D91Y3N3T2Vu3Mtv7yMhKJ_nKJuNDq_WyZclBKMs4KVNwjd-odjRf-8WOwraEaoTAuf6ZXxW96bgFETFRyVXsIoS6FjLkJAPc3Q6P1YX0vEOJ4kGFNUVsfjZivK6AtKHkmwejo_pF4ezfiPuNcHIU2l012aPzOeTzq3Cug8hgXJn5hY9Z_TzYDWUPWdRLSwXjKfX-GWENLjiF874-7rMYVH4AD8UywkYzixVT2h99sqSkbNF34TGB1YulOQyyJAzjKhjX",
      type: "roaster",
      status: "PENDING",
      description: "High-altitude artisan roasters.",
      contactEmail: "contact@mountainpeak.com",
      ownerId: lina.id,
    },
  });

  await prisma.company.create({
    data: {
      name: "Quick Caffeine Inc.",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrx_UMk-cEeK-i677HNEw-N1qTxUo_FCG3MYyJDt_0vazBF6l-sm-9gVtVwB12pSAkpNu8M4cSRB4XNoY7aRV27Zlh2Yr4w7wywlw8l3KF5O8flja0T2Px3BaXng8g4fDK_CwYj4Q0bmIWux-_ExuDQdS2cOPxJFBhrIl3_aE37RowjRZ0HoVHNn13STXo2wyaeMLmyOf7QmSYbY_5yXZ0QSdh9RllwkK9F5djBkm3pOJmQFRqOGoiObdoH0zornsrZXkcCeT5cWr",
      type: "cafe",
      status: "REJECTED",
      description: "Fast caffeine delivery.",
      contactEmail: "info@quickcaff.com",
      ownerId: david.id,
    },
  });

  console.log("Created 6 companies");

  // ──── Products (Elixir Roasters) ────
  await Promise.all([
    prisma.product.create({ data: { name: "Ethiopia Yirgacheffe", price: 24.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDAgGiNFJUTIPpmMYpgMymXY96vDmlr0g3jfM4-1uJU8UQJVKi7tFW3KyxrMrPy07ANPwwl7JsP75IktZ9_VK8fQvLYBgV1OvJBy3l1bnLbQFR5-I71mL9zZB0g1EBXnk9BtQ4aYcSEF4AS3SQ9PUcpAKLxJ7t9JYyoYqFZgU6if7bmfTAhwyqgrW5Q-2yTaDGcjYWafNWh8GMJKhTcwweY6h5e5Rjj7xKJsqRgqiGoTkSV_gqlVfi5VVXmRWunIDQCMSJaJB2nk92a", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "Midnight Blend", price: 21.5, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkqIp5466ipq1toOxd9vHhZqTFWelpCYDB0ic-BQXQnS4Qd0f3OsZEj36kIsF8JQVQ2AVTw1SFNr88FRr7GVzEO8uC24vw93DWBxXtL0lxz2S_wz1-nvO2FPLTjMqXRsJX3CH1KIBQzVwrrz3OT0qBCe5iJRmt5KJSjAN0r0HQ6vU643cF6uHI06PeKyEevaqiLSyVU0vo_tZLNMEVkNAUPL0jizWbquITKEfsMCh7JvNQ91fyKTTjsWbdcespKq0d0KaMgXoUB6p9", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "Colombia Huila", price: 19.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoDBNbWkEB1HS9sq4bwjAWxK4AZZKANZ-YsCurO5mGRYncmE72ymrzzKnechfvoTBXK43aTi-c1JQEJQo4JJx2PQBbaJ4NEf6pVoaaogwwfQN8ZiThDqSq53qbQvHg2HuqOk7h75WQpvr-5qHIO5z3oT3ppGgw8lpzyvwIekM4sorgmZChjHXGWEwV0Vg3KARhKQZUGfIztIg4wlYQQ3OgDuNFrygyxknIh4x8_ruE3tkDp5wyR669m3kE0aLmRzsXnLsmh6xhFHsv", brandId: elixir.id } }),
    prisma.product.create({ data: { name: "Cold Brew Concentrate", price: 16.0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3", brandId: elixir.id } }),
  ]);
  console.log("Created 4 products");

  // ──── Recipes ────
  const honeyGesha = await prisma.recipe.create({
    data: {
      title: "Honey Processed Gesha",
      slug: "honey-gesha",
      description: 'Sourced from the high-altitude slopes of Panama, this Honey Processed Gesha represents the pinnacle of specialty coffee. The "honey" process leaves a specific amount of coffee cherry mucilage on the bean during drying, resulting in a cup that balances the floral elegance of Gesha with an intense, syrupy sweetness and stone fruit acidity.',
      category: "Pour Over",
      difficulty: "Intermediate",
      brewTime: "12 min",
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
          { name: "Whole Bean", baseAmount: 20, unit: "g", sortOrder: 0, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrx_UMk-cEeK-i677HNEw-N1qTxUo_FCG3MYyJDt_0vazBF6l-sm-9gVtVwB12pSAkpNu8M4cSRB4XNoY7aRV27Zlh2Yr4w7wywlw8l3KF5O8flja0T2Px3BaXng8g4fDK_CwYj4Q0bmIWux-_ExuDQdS2cOPxJFBhrIl3_aE37RowjRZ0HoVHNn13STXo2wyaeMLmyOf7QmSYbY_5yXZ0QSdh9RllwkK9F5djBkm3pOJmQFRqOGoiObdoH0zornsrZXkcCeT5cWr" },
          { name: "Water (93\u00b0C)", baseAmount: 320, unit: "ml", sortOrder: 1, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk4erBJ9WbbtN9o7efjJ_Ovc9i6kzfoN_4WffaKNO-jysDIig_InQkmotttu9x4ejKFp51hJEUnchB6We4IIYRpVL7sfb9NaMmis9kFlHw2DH_SoKHYp4YoTqNUb_S65wS1pt8WLDliPhi30lkJl7c5YPLq0c09zX2cI1Bj8FP7PqayzTh4NwltdKNqJ9ozJSvp9GDTrTX9md-IFH20ImN4F1Gfv8u7nr7afmqZqoZfkkIyGmoZvbvSZrw6KT87oIBGekoXQk2p_MT" },
        ],
      },
      steps: {
        create: [
          { stepNumber: 1, title: "Preparation & Rinse", description: "Place the filter in your V60 and rinse with hot water to remove any paper taste and pre-heat the vessel.", imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvuPlSrJx6A-bavBPJedsz8H-D1JuCKWr_4E6Wu9F4Z0STNmLBwRhfRzvpZbgMTyFeDSxQG_0A0FLmV59-xqAM4nHsEjpjmO9Amg2TMdlx-ynJCKk0ZzsIrlBRKvZKTHkWcXF9M0os_55aERU1IhKK61Lh41Y82MzvKYZEZEzUPngYCNu0ccr4rrNwTdKiGO7nJUjotd_uh4yvUUK63KGqGg_P7EC4L4qCcmPdWj2qCwk2qGZ6UjpDNm6ZQnfdmM2gjCiralAIvqQ0" },
          { stepNumber: 2, title: "The Bloom", description: "Add coffee grounds. Pour 40g of water and wait 30 seconds. This allows gases to escape for a cleaner extraction." },
          { stepNumber: 3, title: "Main Pour", description: "In a slow, steady spiral motion, pour remaining water over the coffee bed. Maintain a consistent flow rate for even extraction." },
          { stepNumber: 4, title: "Drawdown & Serve", description: "Allow the water to fully drain through the coffee bed. The total brew time should be approximately 3 minutes. Serve immediately." },
        ],
      },
      brewParams: {
        create: { temperature: "93\u00b0C", ratio: "1:16", grindSize: "Medium", brewTimeSec: 180 },
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "Kyoto Style Cold Drip",
      slug: "kyoto-cold-drip",
      description: "A slow-drip cold brew inspired by the traditional Kyoto method.",
      category: "Cold Brew",
      difficulty: "Advanced",
      brewTime: "8 hrs",
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
      title: "Bamboo Whisk Matcha",
      slug: "bamboo-whisk-matcha",
      description: "Traditional Japanese matcha preparation with a bamboo whisk.",
      category: "Matcha",
      difficulty: "Beginner",
      brewTime: "5 min",
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
      title: "Barista's Oat Cortado",
      slug: "barista-oat-cortado",
      description: "A perfectly balanced cortado with oat milk.",
      category: "Espresso",
      difficulty: "Intermediate",
      brewTime: "5 min",
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
      title: "Botanical Earl Grey",
      slug: "botanical-earl-grey",
      description: "A fragrant earl grey infused with botanicals.",
      category: "Tea",
      difficulty: "Beginner",
      brewTime: "7 min",
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
      title: "Morning Ritual Pour Over",
      slug: "morning-ritual-pour-over",
      description: "A clean and bright morning pour over to start your day.",
      category: "Pour Over",
      difficulty: "Beginner",
      brewTime: "10 min",
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
      title: "Lavender Oat Latte",
      slug: "lavender-oat-latte",
      description: "A soothing lavender-infused oat milk latte.",
      category: "Espresso",
      difficulty: "Beginner",
      brewTime: "5 min",
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
      title: "Iced Matcha Ceremony",
      slug: "iced-matcha-ceremony",
      description: "A refreshing iced matcha ceremony-style preparation.",
      category: "Matcha",
      difficulty: "Intermediate",
      brewTime: "8 min",
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
      title: "Cold Brew Concentrate",
      slug: "cold-brew-concentrate",
      description: "A strong cold brew concentrate perfect for mixing.",
      category: "Cold Brew",
      difficulty: "Beginner",
      brewTime: "12 hrs",
      brewTimeSeconds: 43200,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3",
      source: "COMMUNITY",
      rating: 4.7,
      likes: 156,
      authorId: ahmed.id,
    },
  });

  console.log("Created 9 recipes");

  // ──── Rewards ────
  await Promise.all([
    prisma.reward.create({ data: { title: "20% Off Ethiopia Yirgacheffe", category: "Brand Discount", pointsCost: 800, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLTuX3YO8qNjb5iEJ6YaxLsVKSoTs-jTBH0LBItsYey3zI8m2aPAJ0o8OYb5ZaFF4fLcqYaQNvhUUhVU5d7RQ02eqFn7FYihjjmmwJ27JSxlHVeEZxepX05xUsfZeRfeZmxO5QNaEiQoa4KpCpG3JBHaGoIEbrM69Wl3tVAFpXr1ryVDmGUQ_INKltN27ejnfQjl35M29yk71Ne32Dra9JOGVTEdYiQkTKAMq9RImIzOx6oExa3KuvolYy1meADmyRPrCZ-O84Qgd" } }),
    prisma.reward.create({ data: { title: "Discovery Roast Sample Pack", category: "Free Sample", pointsCost: 1200, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4ptKs2l9G5SJbl8_7aWl1bjuY-pPL2io7hJT6sQH8H88sKKwBBmPcLOSCRzrWQIAnvEKxmY7YQGgTwuRVLa7gPomH0wmR6ff_cgQ_TCxv2fhogB1lJxuTEXewMROiXrJV8zJprqUJO9MjyrQcYa9UkiI-CC1iVLz6r6jFDKDyGmatipC-2vu0NEiJ5D5S3V-eE7giR0rf0r_xJW2KMJs_dnEv8GGE7zoXm_bIC3lY0YaN-exnTBPnYPmsMVYEFPB0YoYqSj0CooCF" } }),
    prisma.reward.create({ data: { title: "Limited Edition Artisan Mug", category: "Merchandise", pointsCost: 2800, isEnabled: false, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Eisln7x9cluXhHWg-D9M3gkoBEK0Of4_91XSwUuSnjJNFGV1yNLOvAkF3y1Bu9kL_ORjljfApRjtmwiv11BuFEp2SCzAhAmx2V-2zyBPojROsNDNhDcxzW49_9mdOjsbVcpz0CiSoL81hkWMz6HHaDzzfKYubOfogYR6A1OWnRIAZoor8Fi5f_QwyezOra6ni3ySJNQbBD0GAOHazGn89c9HItMLKap8FWVeeRCjmhFb8VTseU2--Z5bmjfvImKAd6uQPOkqJtFT" } }),
    prisma.reward.create({ data: { title: "Online Cupping Workshop", category: "Experience", pointsCost: 2000, isEnabled: true, imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKkplgS55acV6bMKoIHjpdBwQSsCLmTB7I3jiKEZPf1CVBvrR9hbUe064w1bwo5AFWUMfe_0TbJ3ALcfBlA6UU-xWaSPbVPCyPtXs9mWoM1OLmO9BGiars9pgOi1edEBUqJwpW6nH3h3O82GbYPObrs1SQ-QYAOXoyZieNbLhJyfin1701oxNXPHsl1TtmszzZSAfgK5fyWdqES69oKzgpZ_4kabQjxWWWNF4a0dm4wE7oYZ3Hp4TxQGKUGFteh45b3kAQmDCeHTPX" } }),
  ]);
  console.log("Created 4 rewards");

  // ──── Challenges ────
  const ch1 = await prisma.challenge.create({ data: { title: "Try 5 Roasts this month", description: "Try 5 different roast styles in one month", icon: "coffee_maker", rewardPoints: 500, maxProgress: 5, rank: "Bronze", category: "Brewing" } });
  const ch2 = await prisma.challenge.create({ data: { title: "Eco-Friendly Brewer", description: "Use reusable filter 10 times", icon: "eco", rewardPoints: 300, maxProgress: 10, rank: "Bronze", category: "General" } });
  const ch3 = await prisma.challenge.create({ data: { title: "Share 3 Recipes", description: "Create and publish 3 original recipes", icon: "share", rewardPoints: 400, maxProgress: 3, rank: "Bronze", category: "Social" } });
  const ch4 = await prisma.challenge.create({ data: { title: "7-Day Streak Master", description: "Maintain a 7-day brew streak", icon: "local_fire_department", rewardPoints: 700, maxProgress: 7, rank: "Silver", category: "Streak" } });
  const ch5 = await prisma.challenge.create({ data: { title: "Pour Over Perfectionist", description: "Brew 15 pour over recipes", icon: "coffee", rewardPoints: 800, maxProgress: 15, rank: "Silver", category: "Brewing" } });
  const ch6 = await prisma.challenge.create({ data: { title: "Community Leader", description: "Get 50 likes on your recipes", icon: "favorite", rewardPoints: 1000, maxProgress: 50, rank: "Gold", category: "Social" } });
  const ch7 = await prisma.challenge.create({ data: { title: "Master Brewer", description: "Complete 20 different recipes", icon: "workspace_premium", rewardPoints: 1500, maxProgress: 20, rank: "Gold", category: "Brewing" } });

  // ──── Pro Challenges ────
  const ch8 = await prisma.challenge.create({ data: { title: "Elite Cupping Session", description: "Rate and review 10 single-origin coffees with detailed tasting notes", icon: "wine_bar", rewardPoints: 1200, maxProgress: 10, rank: "Gold", category: "Brewing", requiredTier: "pro" } });
  const ch9 = await prisma.challenge.create({ data: { title: "Roast Explorer Pro", description: "Try coffees from 8 different roasters in the app", icon: "explore", rewardPoints: 1500, maxProgress: 8, rank: "Silver", category: "General", requiredTier: "pro" } });
  const ch10 = await prisma.challenge.create({ data: { title: "Recipe Innovator", description: "Create 5 recipes with unique brewing methods", icon: "science", rewardPoints: 2000, maxProgress: 5, rank: "Gold", category: "Brewing", requiredTier: "pro" } });
  const ch11 = await prisma.challenge.create({ data: { title: "Brand Ambassador", description: "Follow and engage with 5 different roaster brands", icon: "storefront", rewardPoints: 800, maxProgress: 5, rank: "Silver", category: "Social", requiredTier: "pro" } });
  const ch12 = await prisma.challenge.create({ data: { title: "30-Day Brew Streak", description: "Maintain a 30-day consecutive brewing streak", icon: "military_tech", rewardPoints: 3000, maxProgress: 30, rank: "Gold", category: "Streak", requiredTier: "pro" } });

  await Promise.all([
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch1.id, currentProgress: 3 } }),
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch2.id, currentProgress: 2 } }),
    prisma.userChallenge.create({ data: { userId: ahmed.id, challengeId: ch3.id, currentProgress: 1 } }),
  ]);
  console.log(`Created 12 challenges (7 free, 5 pro) with user progress`);

  // ──── Company Team Members ────
  // Elixir Roasters (pro tier) — owner elena + 2 team members
  await prisma.company.update({ where: { id: elixir.id }, data: { subscriptionTier: "pro" } });
  await prisma.companyMember.create({
    data: { companyId: elixir.id, userId: ahmed.id, role: "admin", invitedBy: elena.id },
  });
  await prisma.companyMember.create({
    data: { companyId: elixir.id, userId: sarah.id, role: "staff", invitedBy: elena.id },
  });
  // Ritual Coffee (basic tier) — owner elena only (1 seat)
  await prisma.company.update({ where: { id: ritual.id }, data: { subscriptionTier: "basic" } });
  console.log("Created company team members (Elixir: 3 seats, Ritual: 1 seat)");

  // ──── Loyalty: Stamp Cards ────
  const stampCard1 = await prisma.stampCard.create({
    data: {
      companyId: elixir.id,
      title: "Buy 5 Lattes, Get 1 Free",
      description: "Collect a stamp with every latte purchase. Complete the card to earn a free latte!",
      stampsRequired: 5,
      rewardDescription: "1 Free Latte",
      stampCooldownMinutes: 30,
      maxCompletions: 0,
    },
  });
  const stampCard2 = await prisma.stampCard.create({
    data: {
      companyId: elixir.id,
      title: "Bean Lovers Card",
      description: "Buy 10 bags of beans and get your 11th bag free.",
      stampsRequired: 10,
      rewardDescription: "1 Free 250g Bag of Beans",
      stampCooldownMinutes: 60,
      maxCompletions: 3,
    },
  });
  const stampCard3 = await prisma.stampCard.create({
    data: {
      companyId: ritual.id,
      title: "Ritual Regular",
      description: "6 visits to unlock a free pastry with your next coffee.",
      stampsRequired: 6,
      rewardDescription: "Free Pastry + Coffee",
      stampCooldownMinutes: 120,
      maxCompletions: 0,
    },
  });

  // Ahmed has 3 stamps on the latte card
  await prisma.userStampCard.create({
    data: {
      userId: ahmed.id,
      stampCardId: stampCard1.id,
      currentStamps: 3,
      lastStampAt: new Date(),
    },
  });

  console.log(`Created 3 stamp cards with user progress`);

  // ──── Loyalty: Brand Rewards ────
  await Promise.all([
    prisma.brandReward.create({
      data: {
        companyId: elixir.id,
        title: "Free Single Origin Drip",
        description: "Redeem for a complimentary single origin drip coffee at any Elixir Roasters location.",
        pointsCost: 500,
        publishToMain: true,
      },
    }),
    prisma.brandReward.create({
      data: {
        companyId: elixir.id,
        title: "250g Ethiopia Yirgacheffe Bag",
        description: "Take home a bag of our signature Ethiopia Yirgacheffe beans.",
        pointsCost: 1200,
        stock: 20,
        publishToMain: true,
      },
    }),
    prisma.brandReward.create({
      data: {
        companyId: ritual.id,
        title: "Free Cupping Session",
        description: "Join our weekly cupping session for free — discover new flavors.",
        pointsCost: 800,
        publishToMain: false,
      },
    }),
  ]);
  console.log(`Created 3 brand rewards`);

  // ──── Loyalty: Brand Coupons ────
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.brandCoupon.create({
      data: {
        companyId: elixir.id,
        title: "20% Off All Beans This Weekend",
        description: "Valid on all 250g and 1kg bags of whole beans. In-store only.",
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
        title: "Free Pastry with Any Coffee",
        description: "Show this coupon to get a free pastry when you order any hot or iced coffee.",
        discountType: "FREEBIE",
        startDate: now,
        endDate: monthFromNow,
        maxUses: 50,
      },
    }),
  ]);
  console.log(`Created 2 brand coupons`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
