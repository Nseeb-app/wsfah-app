import BottomNav from "@/components/BottomNav";
import MaterialIcon from "@/components/MaterialIcon";
import ProfileTabs from "@/components/ProfileTabs";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      recipes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          rating: true,
          likes: true,
        },
      },
      badges: {
        include: { badge: true },
      },
      saves: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              rating: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      likes: {
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true,
              rating: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      companies: {
        take: 1,
        select: { id: true, name: true },
      },
    },
  });

  if (!user) redirect("/login");

  const badgeColors: Record<string, string> = {
    amber: "text-amber-500",
    orange: "text-orange-500",
    green: "text-green-600",
    primary: "text-primary",
  };

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  // Role badge configuration
  const roleBadgeConfig: Record<string, { label: string; color: string; icon?: string }> = {
    USER: { label: "باريستا منزلي", color: "bg-green-100 text-green-700 border-green-200" },
    CREATOR: { label: "مبدع موثق", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "verified" },
    BRAND_ADMIN: { label: "مدير علامة تجارية", color: "bg-amber-100 text-amber-700 border-amber-200" },
  };

  const currentRoleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.USER;

  // Creator analytics
  const totalLikes = user.recipes.reduce((sum, r) => sum + r.likes, 0);
  const avgRating =
    user.recipes.length > 0
      ? user.recipes.reduce((sum, r) => sum + r.rating, 0) / user.recipes.length
      : 0;

  // Brand admin company
  const company = user.companies.length > 0 ? user.companies[0] : null;

  return (
    <div className="bg-background-light font-display text-espresso min-h-screen flex flex-col max-w-screen-sm mx-auto w-full">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-espresso/5">
        <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">الملف الشخصي</h2>
        <Link href="/settings" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="settings" />
        </Link>
      </header>

      <main className="flex-1 pb-24">
        {/* Profile Header */}
        <div className="flex p-6 flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="bg-primary/20 rounded-full p-1 border-2 border-primary">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-28 h-28"
                style={{
                  backgroundImage: `url("${user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name || "User") + "&background=25f459&color=fff&size=128"}")`,
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>

            {/* Role Badge */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRoleBadge.color}`}
              >
                {currentRoleBadge.icon && (
                  <MaterialIcon icon={currentRoleBadge.icon} className="text-sm" filled />
                )}
                <span>{currentRoleBadge.label}</span>
              </span>
            </div>

            {user.bio && (
              <p className="text-espresso/50 text-sm max-w-xs mx-auto px-4">{user.bio}</p>
            )}
          </div>
          <div className="w-full flex gap-3 mt-2">
            <Link href="/settings" className="flex-1 bg-primary text-background-dark font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center">
              تعديل الملف
            </Link>
            <ShareButton url={`/profile/${user.id}`} title={`Check out ${user.name}'s profile on WSFA!`} />
          </div>
        </div>

        {/* Role-Specific Quick Actions */}
        {user.role === "CREATOR" && (
          <div className="px-4 pb-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-800/40 flex items-center justify-center">
                  <MaterialIcon icon="analytics" className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <div className="text-start">
                  <h3 className="font-bold text-sm text-purple-900 dark:text-purple-200">تحليلات الوصفات</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400">أداء محتواك</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-purple-100 dark:border-purple-800">
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{user.recipes.length}</p>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">إجمالي الوصفات</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-purple-100 dark:border-purple-800">
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCount(totalLikes)}</p>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">إجمالي الإعجابات</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{avgRating.toFixed(1)}</p>
                    <MaterialIcon icon="star" className="text-xs text-purple-400" filled />
                  </div>
                  <p className="text-[10px] text-purple-500 dark:text-purple-400 font-medium">متوسط التقييم</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.role === "BRAND_ADMIN" && company && (
          <div className="px-4 pb-4">
            <Link href={`/brand/${company.id}`}>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center shrink-0">
                  <MaterialIcon icon="storefront" className="text-amber-600 dark:text-amber-400 text-2xl" />
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">إدارة علامتي التجارية</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 truncate">{company.name}</p>
                </div>
                <MaterialIcon icon="arrow_back" className="text-amber-400 text-xl shrink-0" />
              </div>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 px-4 py-2">
          {[
            { value: formatCount(user.followers), label: "متابعين" },
            { value: formatCount(user.following), label: "يتابع" },
            { value: String(user.recipes.length), label: "وصفات" },
            { value: user.avgRating.toFixed(1), label: "متوسط التقييم", star: true },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-lg font-bold">{s.value}</p>
                {s.star && <MaterialIcon icon="star" className="text-primary text-xs" filled />}
              </div>
              <p className="text-espresso/50 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">الشارات</h3>
              <span className="text-primary text-sm font-bold cursor-pointer">عرض الكل</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {user.badges.map((ub) => (
                <div key={ub.id} className="flex flex-col items-center gap-2 shrink-0 min-w-[72px]">
                  <div className="size-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                    <MaterialIcon
                      icon={ub.badge.icon}
                      className={`text-2xl ${badgeColors[ub.badge.color] || "text-primary"}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 text-center">
                    {ub.badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs + Recipes / Saved / Liked */}
        <ProfileTabs
          recipes={user.recipes}
          saves={user.saves}
          likes={user.likes}
        />

        {/* Sign Out removed — available in Settings */}
      </main>

      <BottomNav />
    </div>
  );
}
