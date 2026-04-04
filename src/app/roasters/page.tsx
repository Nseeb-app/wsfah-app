import BottomNav from "@/components/BottomNav";
import MaterialIcon from "@/components/MaterialIcon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RoastersPage() {
  const companies = await prisma.company.findMany({
    where: { status: "APPROVED" },
    include: {
      owner: { select: { name: true, image: true } },
      _count: { select: { products: true, recipes: true, galleryPosts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const typeLabels: Record<string, string> = {
    roaster: "Roastery",
    cafe: "Café",
    tea_brand: "Tea Brand",
    equipment: "Equipment",
  };

  const typeIcons: Record<string, string> = {
    roaster: "local_fire_department",
    cafe: "coffee",
    tea_brand: "emoji_food_beverage",
    equipment: "blender",
  };

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">All Brands</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-espresso/40">
            <MaterialIcon icon="storefront" className="text-5xl mb-3" />
            <p className="text-sm font-medium">No brands yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/brand/${c.id}`}
                className="bg-white rounded-2xl border border-espresso/5 overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                {/* Card Header - Logo + Badge */}
                <div className="relative bg-gradient-to-br from-primary/5 to-primary/15 p-4 pb-8">
                  <div className="flex items-start justify-between">
                    <div className="size-14 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
                      <img
                        src={c.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=25f459&color=fff&size=64`}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {c.isVerified && (
                      <div className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                        <MaterialIcon icon="verified" className="text-[10px]" filled /> Verified
                      </div>
                    )}
                  </div>
                  {/* Type pill */}
                  <div className="absolute -bottom-3 left-4">
                    <span className="inline-flex items-center gap-1 bg-white text-espresso/70 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-espresso/5">
                      <MaterialIcon icon={typeIcons[c.type] || "store"} className="text-primary text-xs" />
                      {typeLabels[c.type] || c.type}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 pt-5">
                  <h3 className="font-bold text-sm truncate mb-1" dir="auto">{c.name}</h3>
                  {c.description && (
                    <p className="text-[11px] text-espresso/50 line-clamp-2 mb-3 leading-relaxed" dir="auto">{c.description}</p>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-espresso/5">
                    <div className="flex items-center gap-1 text-espresso/40">
                      <MaterialIcon icon="inventory_2" className="text-xs" />
                      <span className="text-[10px] font-bold">{c._count.products}</span>
                    </div>
                    <div className="flex items-center gap-1 text-espresso/40">
                      <MaterialIcon icon="menu_book" className="text-xs" />
                      <span className="text-[10px] font-bold">{c._count.recipes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-espresso/40">
                      <MaterialIcon icon="photo_library" className="text-xs" />
                      <span className="text-[10px] font-bold">{c._count.galleryPosts}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
