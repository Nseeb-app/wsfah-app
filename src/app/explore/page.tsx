import AdSlot from "@/components/AdSlot";
import BottomNav from "@/components/BottomNav";
import PromotedBrands from "@/components/PromotedBrands";
import ExploreUpload from "@/components/ExploreUpload";
import MaterialIcon from "@/components/MaterialIcon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const session = await auth();

  const posts = await prisma.galleryPost.findMany({
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true, logo: true } },
      _count: { select: { galleryLikes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Check if current user is a brand admin with a company
  let brandCompany: { id: string; name: string } | null = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        companies: { take: 1, select: { id: true, name: true } },
      },
    });
    if (user?.role === "BRAND_ADMIN" && user.companies.length > 0) {
      brandCompany = user.companies[0];
    }
  }

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-espresso/5">
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">استكشف</h2>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {/* Upload form for brand admins only */}
        {brandCompany && (
          <ExploreUpload companyId={brandCompany.id} companyName={brandCompany.name} />
        )}

        {/* Promoted Brands */}
        <PromotedBrands placement="EXPLORE_TOP" />

        {/* Ad Banner */}
        <AdSlot slot="explore-top" format="horizontal" />

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-espresso/40">
            <MaterialIcon icon="explore" className="text-5xl mb-3" />
            <p className="text-sm font-medium">لا يوجد محتوى للاستكشاف بعد</p>
            <p className="text-xs mt-1">ستشارك المحمصات والعلامات التجارية محتواها هنا</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {posts.map((post) => (
              <Link
                href={`/explore/${post.id}`}
                key={post.id}
                className="break-inside-avoid rounded-2xl overflow-hidden bg-white shadow-sm border border-espresso/5 block"
              >
                {post.imageUrl && post.mediaType === "video" ? (
                  <video
                    src={post.imageUrl}
                    playsInline
                    muted
                    preload="metadata"
                    className="w-full object-cover"
                  />
                ) : post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.caption || "منشور المعرض"} className="w-full object-cover" />
                ) : null}
                <div className="p-3">
                  {/* Roaster Info - Prominent */}
                  {post.company && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={post.company.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.company.name)}&background=25f459&color=fff&size=32`}
                        alt=""
                        className="size-7 rounded-full object-cover border border-primary/20"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{post.company.name}</p>
                      </div>
                      <MaterialIcon icon="verified" className="text-primary text-xs shrink-0" filled />
                    </div>
                  )}
                  {!post.company && (
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={post.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || "User")}&size=32`}
                        alt=""
                        className="size-7 rounded-full object-cover"
                      />
                      <p className="text-xs font-bold truncate">{post.author.name}</p>
                    </div>
                  )}
                  {post.caption && <p className="text-[11px] text-espresso/60 line-clamp-2">{post.caption}</p>}
                  {/* Like count */}
                  <div className="flex items-center gap-1 mt-2 text-espresso/40">
                    <MaterialIcon icon="favorite" className="text-xs" />
                    <span className="text-[10px] font-bold">{post._count.galleryLikes}</span>
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
