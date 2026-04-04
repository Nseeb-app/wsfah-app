import BottomNav from "@/components/BottomNav";
import MaterialIcon from "@/components/MaterialIcon";
import AdSlot from "@/components/AdSlot";
import PromotedBrands from "@/components/PromotedBrands";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  const [featuredRecipe, categories, trendingRecipes, currentUser, roasters] = await Promise.all([
    prisma.recipe.findFirst({
      where: { isFeatured: true },
      include: {
        author: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      take: 4,
      orderBy: { rating: "desc" },
      include: {
        author: { select: { name: true, image: true } },
        brand: { select: { name: true } },
      },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, image: true },
        })
      : null,
    prisma.company.findMany({
      where: { isVerified: true },
      select: { id: true, name: true, logo: true, type: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const userName = currentUser?.name?.split(" ")[0] || "Guest";
  const userImage = currentUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=25f459&color=fff&size=96`;

  const categoryIcons: Record<string, string> = {
    "pour-over": "coffee_maker",
    "cold-brew": "ac_unit",
    matcha: "spa",
    espresso: "bolt",
    tea: "self_improvement",
    rituals: "self_improvement",
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/80 backdrop-blur-md px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={session ? "/profile" : "/login"} className="size-12 rounded-full border-2 border-primary p-0.5 block">
              <img
                alt="User Profile"
                className="w-full h-full rounded-full object-cover"
                src={userImage}
              />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-60 font-semibold">Discovery</p>
              <h1 className="text-xl font-bold tracking-tight">{greeting}, {userName}</h1>
            </div>
          </div>
          <Link href="/notifications" className="relative p-2 rounded-full bg-oat-milk">
            <MaterialIcon icon="notifications" className="text-espresso" />
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full"></span>
          </Link>
        </div>

        {/* Search */}
        <Link href="/search" className="block">
          <div className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-espresso/5">
            <MaterialIcon icon="search" className="text-espresso/40 mr-3" />
            <span className="text-sm text-espresso/30 font-medium flex-1">
              Search recipes, roasters, or tea blends
            </span>
            <MaterialIcon icon="tune" className="text-espresso/40 ml-2 text-xl" />
          </div>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* Promoted Brands */}
        <PromotedBrands placement="HOME_TOP" />

        {/* Weekly Roaster's Pick */}
        {featuredRecipe && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Weekly Roaster&apos;s Pick</h2>
              <Link href="/search" className="text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">See All</Link>
            </div>
            <Link href={`/recipe/${featuredRecipe.slug}`}>
              <div className="relative group overflow-hidden rounded-2xl bg-espresso text-oat-milk shadow-xl aspect-[4/5] flex flex-col justify-end">
                <img
                  alt={featuredRecipe.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  src={featuredRecipe.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredRecipe.title)}&background=1a2420&color=25f459&size=800`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent"></div>
                <div className="relative p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {featuredRecipe.isVerified && (
                      <span className="bg-primary/90 text-espresso text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-tighter">
                        Verified Brand
                      </span>
                    )}
                    <div className="flex items-center text-xs font-medium opacity-90">
                      <MaterialIcon icon="schedule" className="text-sm mr-1" /> {featuredRecipe.brewTime || "10 min"}
                    </div>
                  </div>
                  <h3 dir="auto" className="text-3xl font-extrabold leading-tight mb-2">{featuredRecipe.title}</h3>
                  <p className="text-sm opacity-80 mb-6 font-medium tracking-wide">
                    {featuredRecipe.brand?.name || featuredRecipe.author.name} &bull; {featuredRecipe.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-oat-milk/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-oat-milk/10">
                      {featuredRecipe.difficulty}
                    </span>
                    <span className="bg-primary text-espresso px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
                      View Recipe <MaterialIcon icon="arrow_forward" className="text-sm" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Categories */}
        <section className="mb-8 -mx-6">
          <div className="px-6 mb-4">
            <h2 className="text-lg font-bold">Categories</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar">
            {categories.map((cat, i) => (
              <Link href={`/search?category=${encodeURIComponent(cat.name)}`} key={cat.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                <div
                  className={`size-16 rounded-2xl flex items-center justify-center transition-colors ${
                    i === 0
                      ? "bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary group-hover:text-espresso"
                      : "bg-espresso/5 text-espresso/60 group-hover:bg-primary group-hover:text-espresso"
                  }`}
                >
                  <MaterialIcon icon={categoryIcons[cat.slug] || cat.icon} className="text-3xl" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Roasters */}
        {roasters.length > 0 && (
          <section className="mb-8 -mx-6">
            <div className="px-6 mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Featured Roasters</h2>
              <Link href="/roasters" className="text-xs font-bold text-primary uppercase tracking-wider">See All</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar">
              {roasters.map((r) => {
                const typeLabel = r.type === "roaster" ? "Roastery" : r.type === "cafe" ? "Cafe" : r.type === "tea_brand" ? "Tea Brand" : "Equipment";
                return (
                  <Link href={`/brand/${r.id}`} key={r.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                    <div className="size-16 rounded-full border-2 border-primary/30 p-0.5 group-hover:border-primary transition-colors">
                      <img
                        src={r.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=25f459&color=fff&size=64`}
                        alt={r.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-bold block max-w-[72px] truncate" dir="auto">{r.name}</span>
                      <span className="text-[9px] text-primary font-semibold uppercase tracking-wider">{typeLabel}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Ad Banner */}
        <AdSlot slot="home-mid" format="horizontal" />

        {/* Trending Now */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Trending Now</h2>
            <div className="flex gap-2">
              <button className="size-8 rounded-full bg-white shadow-sm border border-espresso/5 flex items-center justify-center">
                <MaterialIcon icon="grid_view" className="text-sm" />
              </button>
              <button className="size-8 rounded-full bg-white shadow-sm border border-espresso/5 flex items-center justify-center opacity-40">
                <MaterialIcon icon="view_agenda" className="text-sm" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {trendingRecipes.map((item) => (
              <Link href={`/recipe/${item.slug}`} key={item.id} className="flex flex-col gap-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md">
                  <img
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=1a2420&color=25f459&size=600`}
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {item.brand ? (
                      <div className="bg-brand-gold text-[8px] font-black px-2 py-0.5 rounded text-white shadow-sm flex items-center gap-0.5">
                        <MaterialIcon icon="verified" className="text-[10px]" /> BRAND
                      </div>
                    ) : (
                      <div className="bg-community-teal text-[8px] font-black px-2 py-0.5 rounded text-white shadow-sm flex items-center gap-0.5">
                        <MaterialIcon icon="group" className="text-[10px]" /> COMMUNITY
                      </div>
                    )}
                  </div>
                  <button className="absolute top-3 right-3 size-8 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center">
                    <MaterialIcon icon="favorite" className="text-sm" />
                  </button>
                </div>
                <div>
                  <h4 dir="auto" className="font-bold text-sm leading-tight mb-1">{item.title}</h4>
                  <p className="text-[10px] opacity-60 font-semibold tracking-wide flex items-center gap-1 uppercase">
                    {item.brand?.name || item.author.name} &bull;{" "}
                    {item.brand ? (
                      <span className="text-brand-gold">Gold Pick</span>
                    ) : (
                      <>
                        {item.rating.toFixed(1)} <MaterialIcon icon="star" className="text-[10px] text-primary" />
                      </>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
