export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "creator" | "brand_admin";
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  recipesCount: number;
  points: number;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  type: "roaster" | "cafe" | "equipment" | "tea_brand";
  status: "approved" | "pending" | "rejected";
  submittedDate: string;
  productsCount: number;
  recipesCount: number;
  followers: number;
  contactEmail: string;
}

export const mockUsers: User[] = [
  {
    id: "usr-001",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmsyRsgrm8xnMUAVJEyLN4Tk44RlDFgVP8Ox3mNILdrNxwk4BVOcLgC_8eRNvh5-Qoa9JZF0KsSesnBZ_7C5hvKqAqPYLtqlVz0zXgcFZcI8KgI1tpjdGqbSt4YP0Ud1-7avoAhAyrMg219a_HZYUcyBD9SEbUs97OLgUdG_s7I66gXYxXnVOKGVzvCjy3o1rjrJjwdEfc_TVz3FT23VqO3R84XsVMahfZhH7ySy_AJXISTS6hN1Yo1u19BIPlV9w-ZRwPQvF5FwYq",
    role: "creator",
    status: "active",
    joinDate: "2024-01-15",
    recipesCount: 32,
    points: 2450,
  },
  {
    id: "usr-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuANjEYdn5IgGxaPNULKiSn5VPHOglVnWptj321KB0HVdxkkc7ePIZMzObqb2eqrH5ybg0KABHqxxZamN5V3W51HA6ZRTwnF-QaPBn5xg_5L2XG-oqLKByVLPTeN8lcrYqhx8FJB8bs1yoTtf62ooiELcVKJsf5s2ObKOcuS_HF1vQTlmVwZvqIM2B1ffUDaIb3l-gvcm79-pCE2fK4fbrH2G-1LSDE201n3QEKsgapoLtRW96Xt7uBKtEe4_pv9Zo0GBxdO-5NhSJVT",
    role: "creator",
    status: "active",
    joinDate: "2024-02-20",
    recipesCount: 18,
    points: 1820,
  },
  {
    id: "usr-003",
    name: "Marcus Lee",
    email: "marcus@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDivFdItomrsqVKzhubSU7Wouajv33CNpHLiuKCpqU5DDEOIhwxFNGEtLw_Gaye1u71WWVSGO74H2r4kfVZ46NOCeMrcTCaSfAmRkG9h0crrawii7IXjm0Ub4SUJpYr-t1AkCoCv6NEL4XEZcddhOLzVrmXbqMCZTB-IO3hxXmzN_WjtvkxwYxhxBlIG11JLAAXbjeBBNF0UrXlbkDKOfRH9M3iVGZJIlX_H2g6QVFW9A6wUTalxj4MkRMf8yKWhMhRrZndPqUgA8uj",
    role: "user",
    status: "active",
    joinDate: "2024-03-10",
    recipesCount: 5,
    points: 890,
  },
  {
    id: "usr-004",
    name: "Elena Rodriguez",
    email: "elena.r@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZLTuX3YO8qNjb5iEJ6YaxLsVKSoTs-jTBH0LBItsYey3zI8m2aPAJ0o8OYb5ZaFF4fLcqYaQNvhUUhVU5d7RQ02eqFn7FYihjjmmwJ27JSxlHVeEZxepX05xUsfZeRfeZmxO5QNaEiQoa4KpCpG3JBHaGoIEbrM69Wl3tVAFpXr1ryVDmGUQ_INKltN27ejnfQjl35M29yk71Ne32Dra9JOGVTEdYiQkTKAMq9RImIzOx6oExa3KuvolYy1meADmyRPrCZ-O84Qgd",
    role: "brand_admin",
    status: "active",
    joinDate: "2024-01-05",
    recipesCount: 48,
    points: 5200,
  },
  {
    id: "usr-005",
    name: "David Kim",
    email: "david.k@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4ptKs2l9G5SJbl8_7aWl1bjuY-pPL2io7hJT6sQH8H88sKKwBBmPcLOSCRzrWQIAnvEKxmY7YQGgTwuRVLa7gPomH0wmR6ff_cgQ_TCxv2fhogB1lJxuTEXewMROiXrJV8zJprqUJO9MjyrQcYa9UkiI-CC1iVLz6r6jFDKDyGmatipC-2vu0NEiJ5D5S3V-eE7giR0rf0r_xJW2KMJs_dnEv8GGE7zoXm_bIC3lY0YaN-exnTBPnYPmsMVYEFPB0YoYqSj0CooCF",
    role: "user",
    status: "suspended",
    joinDate: "2024-04-12",
    recipesCount: 2,
    points: 120,
  },
  {
    id: "usr-006",
    name: "Lina Patel",
    email: "lina.p@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKkplgS55acV6bMKoIHjpdBwQSsCLmTB7I3jiKEZPf1CVBvrR9hbUe064w1bwo5AFWUMfe_0TbJ3ALcfBlA6UU-xWaSPbVPCyPtXs9mWoM1OLmO9BGiars9pgOi1edEBUqJwpW6nH3h3O82GbYPObrs1SQ-QYAOXoyZieNbLhJyfin1701oxNXPHsl1TtmszzZSAfgK5fyWdqES69oKzgpZ_4kabQjxWWWNF4a0dm4wE7oYZ3Hp4TxQGKUGFteh45b3kAQmDCeHTPX",
    role: "creator",
    status: "inactive",
    joinDate: "2024-05-08",
    recipesCount: 11,
    points: 650,
  },
  {
    id: "usr-007",
    name: "James Wilson",
    email: "james.w@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Eisln7x9cluXhHWg-D9M3gkoBEK0Of4_91XSwUuSnjJNFGV1yNLOvAkF3y1Bu9kL_ORjljfApRjtmwiv11BuFEp2SCzAhAmx2V-2zyBPojROsNDNhDcxzW49_9mdOjsbVcpz0CiSoL81hkWMz6HHaDzzfKYubOfogYR6A1OWnRIAZoor8Fi5f_QwyezOra6ni3ySJNQbBD0GAOHazGn89c9HItMLKap8FWVeeRCjmhFb8VTseU2--Z5bmjfvImKAd6uQPOkqJtFT",
    role: "user",
    status: "active",
    joinDate: "2024-06-01",
    recipesCount: 0,
    points: 340,
  },
  {
    id: "usr-008",
    name: "Alex Brewmaster",
    email: "alex.b@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGT-WUj1S8aWwCF04uwCWiV7GXlOiZRhZt-24Ai77zwunn60sv_4HoZeh6UV5VutzYf-z5D33g-OkyhXnbdnCs1bdp45sAzxyYCW3F81TB5VaWC1XxxjH8cOtcTgc46wItjILdRSDMs8mthOSCd5Rh_u9NiVdIl_rFseVRBqMIXnLj1QBTGHUMjdsmb_l1yjdi2BIElF0To0f9iY8Aufojo6Lhh2_WIZEg4DHUs5zzHzIleD4lkcXZbzEgVTNEYZLHzqd46ZjZivu3",
    role: "creator",
    status: "active",
    joinDate: "2023-11-20",
    recipesCount: 45,
    points: 3100,
  },
];

export const mockCompanies: Company[] = [
  {
    id: "comp-001",
    name: "Elixir Roasters",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jXJPwKUQgikEpWHpXQI8hrbjMIxBqth6bHg27oyHBuX0lREY-z88wXQLXuhibGtChg50memocR4sYr_7OXT9fddokiqOVClbzGmOWu944qaTY1MVXvq2cQ-Jr4meiSFyhtIl-1kGr9XkVEs-el-s9A6kuWU532hjyNuahfVnO2qxnTRcoK5oCSUTMgNh6QM4-CP1_o5aoPLa3Um73RDjdVWn0dGe8ytTa1JO2_m1bJNXiAhVcgszMLAzEoXy3hecn7j6aFdaGrYP",
    type: "roaster",
    status: "approved",
    submittedDate: "2024-02-01",
    productsCount: 12,
    recipesCount: 48,
    followers: 12500,
    contactEmail: "hello@elixirroasters.com",
  },
  {
    id: "comp-002",
    name: "Ritual Coffee",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe",
    type: "cafe",
    status: "approved",
    submittedDate: "2024-01-15",
    productsCount: 8,
    recipesCount: 24,
    followers: 8900,
    contactEmail: "info@ritualcoffee.com",
  },
  {
    id: "comp-003",
    name: "Tea Fort\u00e9",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM4IsnEGVJY6xJyzeI9I723EtsEIVLw1kwL5EmdTcvTCa_pZ7IHu-LE_MU3tI_XPuLVPw5wJYolwr-UcyyXnpUlvuVn7C4dH7XCPkYuCv3G2Tdzd2b0vpgAHLf2HymbW6Rrj6kDUaaoKHAsHq34ICTTWJUY6K35kY2XFRwoHucdYkpgSBS18fc0u4cMr-CklqLI9dmgPh-V36dfxeKbS3U27W9pcbIDol6rKyVL2WILX_hIV77VT8dsOfUe6HFofbCrB1RvSduog27",
    type: "tea_brand",
    status: "approved",
    submittedDate: "2024-03-10",
    productsCount: 15,
    recipesCount: 30,
    followers: 6200,
    contactEmail: "hello@teaforte.com",
  },
  {
    id: "comp-004",
    name: "Brew Equipment Co.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAG4rnZ677jzT8JomwKGQLLcNaY4ZLBtyct-2CbNxbDqrdHfVAEp8BRuhe_XvrkAhx6x7reOZUbPcFRJnSea-WKMUZHzpkyCDcGkmwi-w2ej84WbA_-bggfCyegmi2EUo4LhK68c5pza-un2p6x3HB9owagbYYt51FOgVyqKYHSbschS8xQFNei_37cbwmPEjhQBbTuUJ18u405nWzEhq1ktKq6XAjjGPpGOVkhKqnV8viHOj4h9EGoZMQ8pKo8Hwdin5XJCJQWTByO",
    type: "equipment",
    status: "pending",
    submittedDate: "2024-06-20",
    productsCount: 22,
    recipesCount: 5,
    followers: 3400,
    contactEmail: "sales@brewequip.co",
  },
  {
    id: "comp-005",
    name: "Mountain Peak Roasters",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5hyTbybc0D91Y3N3T2Vu3Mtv7yMhKJ_nKJuNDq_WyZclBKMs4KVNwjd-odjRf-8WOwraEaoTAuf6ZXxW96bgFETFRyVXsIoS6FjLkJAPc3Q6P1YX0vEOJ4kGFNUVsfjZivK6AtKHkmwejo_pF4ezfiPuNcHIU2l012aPzOeTzq3Cug8hgXJn5hY9Z_TzYDWUPWdRLSwXjKfX-GWENLjiF874-7rMYVH4AD8UywkYzixVT2h99sqSkbNF34TGB1YulOQyyJAzjKhjX",
    type: "roaster",
    status: "pending",
    submittedDate: "2024-07-01",
    productsCount: 6,
    recipesCount: 10,
    followers: 1200,
    contactEmail: "contact@mountainpeak.com",
  },
  {
    id: "comp-006",
    name: "Quick Caffeine Inc.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlrx_UMk-cEeK-i677HNEw-N1qTxUo_FCG3MYyJDt_0vazBF6l-sm-9gVtVwB12pSAkpNu8M4cSRB4XNoY7aRV27Zlh2Yr4w7wywlw8l3KF5O8flja0T2Px3BaXng8g4fDK_CwYj4Q0bmIWux-_ExuDQdS2cOPxJFBhrIl3_aE37RowjRZ0HoVHNn13STXo2wyaeMLmyOf7QmSYbY_5yXZ0QSdh9RllwkK9F5djBkm3pOJmQFRqOGoiObdoH0zornsrZXkcCeT5cWr",
    type: "cafe",
    status: "rejected",
    submittedDate: "2024-05-15",
    productsCount: 3,
    recipesCount: 0,
    followers: 150,
    contactEmail: "info@quickcaff.com",
  },
];

export const mockStats = {
  totalUsers: 15432,
  activeUsers: 12891,
  totalCompanies: 87,
  pendingApprovals: 12,
  totalRecipes: 4521,
  totalPoints: 1250000,
  monthlyActiveUsers: 8943,
  newUsersThisMonth: 432,
};

export const mockActivity = [
  { action: "New user registered", detail: "James Wilson joined", time: "2 min ago", icon: "person_add" },
  { action: "Company submitted", detail: "Mountain Peak Roasters applied", time: "15 min ago", icon: "storefront" },
  { action: "Recipe published", detail: "Ahmed Hassan published a new recipe", time: "1 hr ago", icon: "menu_book" },
  { action: "User suspended", detail: "David Kim was suspended", time: "3 hrs ago", icon: "block" },
  { action: "Company approved", detail: "Tea Fort\u00e9 was approved", time: "5 hrs ago", icon: "check_circle" },
];
