"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";
import BottomNav from "@/components/BottomNav";
import DarkModeToggle from "@/components/DarkModeToggle";
import { logout } from "@/app/actions";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  image: string | null;
  role: string;
}

interface PrivacyData {
  privacyFollowers: string;
  privacyLikes: string;
  privacySaved: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacyData>({
    privacyFollowers: "everyone",
    privacyLikes: "public",
    privacySaved: "private",
  });
  const [privacySaving, setPrivacySaving] = useState(false);

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      const patchRes = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });
      if (!patchRes.ok) throw new Error("Save failed");
      const updated = await patchRes.json();
      setUser((prev) => (prev ? { ...prev, image: updated.image } : prev));
      setMessage({ type: "success", text: "تم تحديث صورة الملف الشخصي!" });
    } catch {
      setMessage({ type: "error", text: "فشل تحديث صورة الملف الشخصي." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        if (cancelled) return;
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const data: UserData = await res.json();
        setUser(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      } catch {
        if (!cancelled) window.location.href = "/login";
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchUser();
    // Fetch privacy settings
    fetch("/api/privacy")
      .then((r) => { if (r.ok) return r.json(); throw new Error(); })
      .then((data: PrivacyData) => { if (!cancelled) setPrivacy(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const body: Record<string, string> = {};

      if (name !== (user?.name || "")) body.name = name;
      if (bio !== (user?.bio || "")) body.bio = bio;
      if (email !== (user?.email || "")) body.email = email;
      if (phone !== (user?.phone || "")) body.phone = phone;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      if (Object.keys(body).length === 0) {
        setMessage({ type: "error", text: "لا توجد تغييرات للحفظ." });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "فشل حفظ التغييرات." });
      } else {
        const updated = await res.json();
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));
        setCurrentPassword("");
        setNewPassword("");
        setMessage({ type: "success", text: "تم تحديث الملف الشخصي بنجاح!" });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ ما. حاول مرة أخرى." });
    } finally {
      setSaving(false);
    }
  };

  const roleBadgeLabel = (role: string) => {
    switch (role) {
      case "CREATOR":
        return "مبدع";
      case "BRAND_ADMIN":
        return "مدير علامة تجارية";
      default:
        return "باريستا منزلي";
    }
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const avatarUrl =
    user.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=25f459&color=fff&size=128`;

  return (
    <div className="bg-background-light font-display text-espresso min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 justify-between sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <Link
          href="/profile"
          className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10"
        >
          <MaterialIcon icon="arrow_back" />
        </Link>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          الإعدادات
        </h2>
        <div className="size-10" />
      </header>

      <main className="flex-1 pb-24 px-4">
        {/* Avatar + Role */}
        <div className="flex flex-col items-center pt-6 pb-4 gap-3">
          <div className="relative">
            <div className="bg-primary/20 rounded-full p-1 border-2 border-primary">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24"
                style={{ backgroundImage: `url("${avatarUrl}")` }}
              />
            </div>
            <label className="absolute bottom-0 right-0 size-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/80 transition-colors">
              {uploadingAvatar ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <MaterialIcon icon="photo_camera" className="text-sm" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <MaterialIcon icon="verified" className="text-sm" filled />
            {roleBadgeLabel(user.role)}
          </span>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Fields */}
        <section className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
            الاسم
          </label>
          <input
            dir="auto"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك"
            className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
          />
        </section>

        <section className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
            النبذة
          </label>
          <textarea
            dir="auto"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="أخبرنا عن نفسك..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary resize-none"
          />
        </section>

        <section className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
            البريد الإلكتروني
          </label>
          <input
            dir="ltr"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
          />
        </section>

        <section className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
            الهاتف
          </label>
          <input
            dir="ltr"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
            className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
          />
        </section>

        {/* Password Section */}
        <div className="border-t border-espresso/10 pt-6 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-4 block">
            تغيير كلمة المرور
          </h3>

          <section className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
              كلمة المرور الحالية
            </label>
            <input
              dir="auto"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الحالية"
              className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
            />
          </section>

          <section className="mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-2 block">
              كلمة المرور الجديدة
            </label>
            <input
              dir="auto"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              className="w-full px-4 py-3 rounded-xl bg-white border border-espresso/10 text-sm font-medium outline-none focus:border-primary"
            />
          </section>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-espresso font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-espresso border-t-transparent" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <MaterialIcon icon="save" className="text-lg" />
              حفظ التغييرات
            </>
          )}
        </button>

        {/* Privacy Settings */}
        <div className="border-t border-espresso/10 pt-6 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-4 flex items-center gap-2">
            <MaterialIcon icon="lock" className="text-sm" />
            الخصوصية
          </h3>

          <div className="space-y-4">
            {/* Who sees followers */}
            <div className="bg-white rounded-xl border border-espresso/10 p-4">
              <p className="text-sm font-bold mb-1">من يستطيع رؤية متابعيني</p>
              <p className="text-xs text-espresso/50 mb-3">تحكم بمن يرى قائمة متابعيك</p>
              <div className="flex gap-2">
                {[
                  { value: "everyone", label: "الجميع" },
                  { value: "followers", label: "المتابعون" },
                  { value: "none", label: "لا أحد" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy((p) => ({ ...p, privacyFollowers: opt.value }))}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                      privacy.privacyFollowers === opt.value
                        ? "bg-primary text-espresso"
                        : "bg-slate-50 text-espresso/50 border border-espresso/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liked recipes visibility */}
            <div className="bg-white rounded-xl border border-espresso/10 p-4">
              <p className="text-sm font-bold mb-1">الوصفات المعجب بها</p>
              <p className="text-xs text-espresso/50 mb-3">اعرض وصفاتك المعجب بها في ملفك الشخصي</p>
              <div className="flex gap-2">
                {[
                  { value: "public", label: "عام" },
                  { value: "private", label: "خاص" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy((p) => ({ ...p, privacyLikes: opt.value }))}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                      privacy.privacyLikes === opt.value
                        ? "bg-primary text-espresso"
                        : "bg-slate-50 text-espresso/50 border border-espresso/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved recipes visibility */}
            <div className="bg-white rounded-xl border border-espresso/10 p-4">
              <p className="text-sm font-bold mb-1">الوصفات المحفوظة</p>
              <p className="text-xs text-espresso/50 mb-3">اعرض وصفاتك المحفوظة في ملفك الشخصي</p>
              <div className="flex gap-2">
                {[
                  { value: "public", label: "عام" },
                  { value: "private", label: "خاص" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPrivacy((p) => ({ ...p, privacySaved: opt.value }))}
                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                      privacy.privacySaved === opt.value
                        ? "bg-primary text-espresso"
                        : "bg-slate-50 text-espresso/50 border border-espresso/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save privacy */}
            <button
              onClick={async () => {
                setPrivacySaving(true);
                try {
                  const res = await fetch("/api/privacy", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(privacy),
                  });
                  if (res.ok) {
                    setMessage({ type: "success", text: "تم حفظ إعدادات الخصوصية!" });
                  }
                } catch {
                  setMessage({ type: "error", text: "فشل حفظ إعدادات الخصوصية." });
                } finally {
                  setPrivacySaving(false);
                }
              }}
              disabled={privacySaving}
              className="w-full bg-espresso/5 text-espresso font-bold py-3 rounded-xl hover:bg-espresso/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <MaterialIcon icon="shield" className="text-lg" />
              {privacySaving ? "جاري الحفظ..." : "حفظ إعدادات الخصوصية"}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-espresso/60 mb-3 block">
            المظهر
          </h3>
          <DarkModeToggle />
        </div>

        {/* Profile link */}
        <Link
          href="/profile"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors mb-4 border border-slate-200"
        >
          <MaterialIcon icon="person" className="text-lg" />
          عرض الملف الشخصي
        </Link>

        <Link
          href="/pricing"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors mb-4 border border-primary/20"
        >
          <MaterialIcon icon="workspace_premium" className="text-lg" />
          إدارة الاشتراك
        </Link>

        {/* Sign Out */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
        >
          <MaterialIcon icon="logout" className="text-lg" />
          تسجيل الخروج
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
