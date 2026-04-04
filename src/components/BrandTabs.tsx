"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  externalUrl: string | null;
};

type Recipe = {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  rating: number;
  author: { name: string | null };
};

type GalleryPost = {
  id: string;
  imageUrl: string;
  mediaType?: string;
  caption: string | null;
  author: { name: string | null; image: string | null };
};

type TabKey = "store" | "recipes" | "gallery";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "store", label: "المتجر", icon: "storefront" },
  { key: "recipes", label: "الوصفات", icon: "menu_book" },
  { key: "gallery", label: "المعرض", icon: "photo_library" },
];

interface BrandTabsProps {
  products: Product[];
  recipes: Recipe[];
  galleryPosts: GalleryPost[];
  isOwner?: boolean;
  companyId?: string;
}

export default function BrandTabs({ products, recipes, galleryPosts, isOwner, companyId }: BrandTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("store");
  const [localProducts, setLocalProducts] = useState(products);
  const [localGallery, setLocalGallery] = useState(galleryPosts);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditUrl(p.externalUrl || "");
  };

  const handleSaveProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, price: editPrice, externalUrl: editUrl }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLocalProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      setEditingProduct(null);
    }
  };

  const handleGalleryUpload = async (file: File) => {
    if (!companyId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) return;
      const { url } = await uploadRes.json();

      const isVideo = file.type.startsWith("video/");
      const postRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, mediaType: isVideo ? "video" : "image", caption: galleryCaption || null, companyId }),
      });
      if (postRes.ok) {
        const newPost = await postRes.json();
        setLocalGallery((prev) => [{ id: newPost.id, imageUrl: newPost.imageUrl, caption: newPost.caption, author: newPost.author }, ...prev]);
        setGalleryCaption("");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-6">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? "border-primary text-slate-900"
                : "border-transparent text-slate-400 font-medium"
            }`}
          >
            <MaterialIcon icon={tab.icon} className="text-base" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Tab */}
      {activeTab === "store" && (
        <div className="grid grid-cols-2 gap-4 p-4">
          {localProducts.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <MaterialIcon icon="inventory_2" className="text-4xl mb-2" />
              <p className="text-sm">لا توجد منتجات بعد</p>
            </div>
          ) : (
            localProducts.map((p) => (
              <div key={p.id} className="space-y-2">
                {editingProduct === p.id && isOwner ? (
                  <div className="bg-white rounded-xl border border-primary/20 p-3 space-y-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-sm font-bold border border-slate-200 rounded-lg px-3 py-2"
                      placeholder="اسم المنتج"
                      dir="auto"
                    />
                    <input
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                      placeholder="السعر"
                      inputMode="decimal"
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                      placeholder="رابط المتجر (https://...)"
                      dir="ltr"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveProduct(p.id)} className="flex-1 bg-primary text-slate-900 text-xs font-bold py-2 rounded-lg">
                        حفظ
                      </button>
                      <button onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="aspect-[4/5] rounded-xl bg-slate-100 overflow-hidden relative">
                      <img
                        className="w-full h-full object-cover"
                        src={p.imageUrl || "https://via.placeholder.com/300x375"}
                        alt={p.name}
                      />
                      {p.externalUrl ? (
                        <a
                          href={p.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg"
                        >
                          <MaterialIcon icon="shopping_cart" className="text-primary" />
                        </a>
                      ) : (
                        <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-lg opacity-40">
                          <MaterialIcon icon="shopping_cart" className="text-slate-400" />
                        </div>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-lg"
                        >
                          <MaterialIcon icon="edit" className="text-slate-600 text-sm" />
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm" dir="auto">{p.name}</p>
                      <p className="text-primary font-bold">${p.price.toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-2 gap-4 p-4">
          {recipes.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">
              <MaterialIcon icon="menu_book" className="text-4xl mb-2" />
              <p className="text-sm">لا توجد وصفات بعد</p>
            </div>
          ) : (
            recipes.map((r) => (
              <Link href={`/recipe/${r.slug}`} key={r.id} className="flex flex-col gap-2">
                <div className="aspect-[3/4] rounded-xl bg-slate-100 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover"
                    src={r.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKhsPBTqVlKYRHt_XAv75ctvX3xBReG2P2T-ZoZnEalDyG9bGPiRvCXkljkKqVJea63kHokg5v2TbguwCd0ktoGmjt-OyhKjN6o3hmFbK4vv6LXyO0HKkbzfy14JOdKU1PHqEvyQjwSjoXy98PLVww8Mz7npuKv_u-MwuCXSqmRgxm6Z8rD_A1zGUa0jw4OqouaseX54IjXRusSJoROTVfGP3OuqbM-HMC7A4lFQAwxsDYfilbqHSNVYtZdPQtuFTx4n1kTHvZaIe"}
                    alt={r.title}
                  />
                  <div className="absolute top-2 left-2 bg-primary/90 text-espresso text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-0.5">
                    <MaterialIcon icon="verified" className="text-[10px]" /> BRAND
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight" dir="auto">{r.title}</h4>
                  <p className="text-[10px] opacity-60 font-semibold tracking-wide flex items-center gap-1 uppercase">
                    {r.author.name}
                    {r.rating > 0 && (
                      <>
                        {" "}&bull; {r.rating.toFixed(1)} <MaterialIcon icon="star" className="text-[10px] text-primary" />
                      </>
                    )}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <div className="p-4">
          {/* Gallery Upload (owner only) */}
          {isOwner && (
            <div className="mb-4 bg-white rounded-xl border border-primary/20 p-4 space-y-3">
              <p className="text-sm font-bold flex items-center gap-2">
                <MaterialIcon icon="add_photo_alternate" className="text-primary" />
                أضف إلى المعرض
              </p>
              <input
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
                placeholder="وصف (اختياري)"
                dir="auto"
              />
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryUpload(file);
                }}
              />
              <button
                onClick={() => galleryFileRef.current?.click()}
                disabled={uploading}
                className="w-full bg-primary text-slate-900 text-sm font-bold py-2.5 rounded-lg disabled:opacity-50"
              >
                {uploading ? "جارٍ الرفع..." : "رفع صورة"}
              </button>
            </div>
          )}

          {localGallery.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MaterialIcon icon="photo_library" className="text-4xl mb-2" />
              <p className="text-sm">لا توجد منشورات في المعرض بعد</p>
            </div>
          ) : (
            <div className="columns-2 gap-3 space-y-3">
              {localGallery.map((post) => (
                <div key={post.id} className="break-inside-avoid rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  {post.mediaType === "video" ? (
                    <video src={post.imageUrl} controls playsInline preload="metadata" className="w-full object-cover" />
                  ) : (
                    <img src={post.imageUrl} alt={post.caption || ""} className="w-full object-cover" />
                  )}
                  {post.caption && (
                    <p className="text-xs text-slate-600 p-2.5 font-medium" dir="auto">{post.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
