import BottomNav from "@/components/BottomNav";
import MaterialIcon from "@/components/MaterialIcon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage() {
  const posts = await prisma.galleryPost.findMany({
    include: {
      author: { select: { id: true, name: true, image: true } },
      company: { select: { id: true, name: true, logo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="bg-background-light text-espresso min-h-screen flex flex-col">
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Gallery</h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-espresso/40">
            <MaterialIcon icon="photo_library" className="text-5xl mb-3" />
            <p className="text-sm font-medium">No gallery posts yet</p>
            <p className="text-xs mt-1">Creators and brands can share photos here</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-white shadow-sm border border-espresso/5">
                <img src={post.imageUrl} alt={post.caption || "Gallery post"} className="w-full object-cover" />
                <div className="p-3">
                  {post.caption && <p className="text-sm font-medium mb-2" dir="auto">{post.caption}</p>}
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name || "User")}&size=32`}
                      alt=""
                      className="size-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-espresso/60 font-medium">{post.author.name}</span>
                    {post.company && (
                      <Link href={`/brand/${post.company.id}`} className="text-xs text-primary font-bold ml-auto">
                        {post.company.name}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
