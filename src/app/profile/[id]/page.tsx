import BottomNav from "@/components/BottomNav";
import MaterialIcon from "@/components/MaterialIcon";
import FollowButton from "@/components/FollowButton";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const isOwnProfile = session?.user?.id === id;

  // If viewing own profile, redirect to /profile
  if (isOwnProfile) redirect("/profile");

  const user = await prisma.user.findUnique({
    where: { id },
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
      badges: { include: { badge: true } },
      companies: { take: 1, select: { id: true, name: true } },
    },
  });

  if (!user) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MaterialIcon icon="person_off" className="text-4xl text-slate-400" />
          <p className="text-sm text-slate-500 mt-2">User not found</p>
          <Link href="/" className="text-primary text-sm font-bold mt-3 block">Go Home</Link>
        </div>
      </div>
    );
  }

  const roleBadgeConfig: Record<string, { label: string; color: string; icon?: string }> = {
    USER: { label: "Home Barista", color: "bg-green-100 text-green-700 border-green-200" },
    CREATOR: { label: "Verified Creator", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "verified" },
    BRAND_ADMIN: { label: "Brand Admin", color: "bg-amber-100 text-amber-700 border-amber-200" },
  };
  const currentRoleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.USER;

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  // Check privacy: show followers count based on user's privacy settings
  const showFollowers = user.privacyFollowers === "everyone";

  const badgeColors: Record<string, string> = {
    amber: "text-amber-500",
    orange: "text-orange-500",
    green: "text-green-600",
    primary: "text-primary",
  };

  const company = user.companies.length > 0 ? user.companies[0] : null;

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex flex-col">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Profile</h2>
        <div className="size-10" />
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
            <h2 className="text-2xl font-bold tracking-tight" dir="auto">{user.name}</h2>
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRoleBadge.color}`}>
                {currentRoleBadge.icon && <MaterialIcon icon={currentRoleBadge.icon} className="text-sm" filled />}
                <span dir="auto">{currentRoleBadge.label}</span>
              </span>
            </div>
            {user.bio && (
              <p className="text-slate-600 text-sm max-w-xs mx-auto px-4" dir="auto">{user.bio}</p>
            )}
          </div>
          <div className="w-full flex gap-3 mt-2">
            <FollowButton userId={user.id} className="flex-1" />
            <ShareButton url={`/profile/${user.id}`} title={`Check out ${user.name}'s profile on WSFA!`} />
          </div>
        </div>

        {/* Brand link */}
        {company && (
          <div className="px-4 pb-4">
            <Link href={`/brand/${company.id}`}>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 hover:bg-amber-100 transition-colors">
                <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <MaterialIcon icon="storefront" className="text-amber-600 text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-amber-900" dir="auto">{company.name}</h3>
                  <p className="text-xs text-amber-600">View Brand</p>
                </div>
                <MaterialIcon icon="arrow_forward" className="text-amber-400 text-xl shrink-0" />
              </div>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3 px-4 py-2">
          {showFollowers && (
            <>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
                <p className="text-lg font-bold">{formatCount(user.followers)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Followers</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
                <p className="text-lg font-bold">{formatCount(user.following)}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Following</p>
              </div>
            </>
          )}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-lg font-bold">{user.recipes.length}</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Recipes</p>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold">{user.avgRating.toFixed(1)}</p>
              <MaterialIcon icon="star" className="text-primary text-xs" filled />
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5">Avg Rating</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="px-4 py-6">
            <h3 className="text-lg font-bold mb-4">Badges</h3>
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

        {/* Recipes */}
        {user.recipes.length > 0 && (
          <div className="px-4 py-4">
            <h3 className="text-lg font-bold mb-4">Recipes</h3>
            <div className="grid grid-cols-2 gap-3">
              {user.recipes.map((r) => (
                <Link href={`/recipe/${r.id}`} key={r.id} className="flex flex-col gap-2">
                  <div className="aspect-[3/4] rounded-xl bg-slate-100 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover"
                      src={r.imageUrl || "https://via.placeholder.com/300x400"}
                      alt={r.title}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight" dir="auto">{r.title}</h4>
                    <p className="text-[10px] opacity-60 font-semibold flex items-center gap-1">
                      {r.likes} likes
                      {r.rating > 0 && (
                        <> &bull; {r.rating.toFixed(1)} <MaterialIcon icon="star" className="text-[10px] text-primary" /></>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
