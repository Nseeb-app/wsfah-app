import BottomNav from "@/components/BottomNav";
import BrandTabs from "@/components/BrandTabs";
import FollowButton from "@/components/FollowButton";
import MaterialIcon from "@/components/MaterialIcon";
import PromoteButton from "@/components/PromoteButton";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BrandProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      products: true,
      recipes: {
        include: {
          author: { select: { name: true } },
        },
      },
      galleryPosts: {
        include: {
          author: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  const isOwner = session?.user?.id === company.ownerId;
  const typeLabel = company.type === "roaster" ? "محمصة" : company.type === "cafe" ? "مقهى" : company.type === "tea_brand" ? "علامة شاي" : "معدات";

  return (
    <div className="bg-background-light min-h-screen flex flex-col relative overflow-hidden text-slate-900">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight" dir="auto">{company.name}</h1>
        </div>
        <ShareButton url={`/brand/${company.id}`} title={`Check out ${company.name} on WSFA!`} />
      </header>

      <main className="flex-1 pb-24">
        {/* Profile Info */}
        <div className="flex p-6 flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="bg-primary/20 rounded-full p-1 border-2 border-primary">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-28 h-28"
                style={{
                  backgroundImage: `url("${company.logo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(company.name) + "&background=25f459&color=fff&size=128"}")`,
                }}
              />
            </div>
            {company.isVerified && (
              <div className="absolute bottom-1 right-1 bg-primary text-background-dark rounded-full p-1 border-2 border-background-light">
                <MaterialIcon icon="verified" className="text-sm block" filled />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight" dir="auto">{company.name}</h2>
            <p className="text-primary font-semibold text-sm">
              {company.isVerified ? "موثق " : ""}{typeLabel}
            </p>
            {company.description && (
              <p className="text-slate-600 text-sm max-w-xs mx-auto px-4 mt-2" dir="auto">{company.description}</p>
            )}
          </div>
          <div className="w-full flex gap-3 mt-2">
            <FollowButton userId={company.ownerId} className="flex-1" />
            {isOwner && (
              <PromoteButton companyId={company.id} companyName={company.name} />
            )}
            {company.contactEmail && (
              <a href={`mailto:${company.contactEmail}`} className="bg-primary/10 text-primary border border-primary/20 px-4 py-3 rounded-xl">
                <MaterialIcon icon="mail" className="block" />
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 px-4 py-2">
          {[
            { value: String(company.products.length), label: "المنتجات" },
            { value: String(company.recipes.length), label: "الوصفات" },
            { value: String(company.galleryPosts.length), label: "المعرض" },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <BrandTabs
          products={company.products}
          recipes={company.recipes}
          galleryPosts={company.galleryPosts}
          isOwner={isOwner}
          companyId={company.id}
        />
      </main>

      <BottomNav />
    </div>
  );
}
