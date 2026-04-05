import Link from "next/link";
import MaterialIcon from "./MaterialIcon";
import { UserPricingToggle, RoasterPricingToggle } from "./PricingToggle";

const features = [
  {
    icon: "coffee_maker",
    title: "وضع التحضير الموجّه",
    desc: "تعليمات خطوة بخطوة مع مؤقتات مدمجة. أتقن تحضير الفلتر، الإسبريسو، أو الماتشا في كل مرة.",
  },
  {
    icon: "menu_book",
    title: "مكتبة الوصفات",
    desc: "آلاف الوصفات من المجتمع والعلامات التجارية المعتمدة للقهوة والشاي والماتشا والمزيد.",
  },
  {
    icon: "edit_note",
    title: "دفتر التحضير",
    desc: "سجّل كل تحضير بالمعايير والملاحظات والتقييمات. تابع تقدمك واوصل للكمال.",
  },
  {
    icon: "group",
    title: "المجتمع والمجموعات",
    desc: "انضم لمجتمعات التحضير، شارك الصور، تابع أفضل المحضّرين، واكتشف تقنيات جديدة.",
  },
  {
    icon: "emoji_events",
    title: "المكافآت والتحديات",
    desc: "اكسب نقاطاً مقابل التحضير، أكمل التحديات، تصدّر المتصدرين، واستبدل مكافآت حقيقية.",
  },
  {
    icon: "storefront",
    title: "سوق العلامات التجارية",
    desc: "اكتشف المحمصات والمقاهي وعلامات المعدات. اقرأ التقييمات، ابحث عن متاجر قريبة، وتسوّق المنتجات.",
  },
  {
    icon: "timer",
    title: "مؤقت تحضير ذكي",
    desc: "مؤقتات دقيقة مع اهتزاز تنبيهي، إشعارات في الخلفية، ومعايير مرتبطة بالوصفة.",
  },
  {
    icon: "bluetooth",
    title: "تكامل الميزان الذكي",
    desc: "اربط موازين Acaia وTimemore وغيرها عبر البلوتوث لتتبع الوزن لحظياً أثناء التحضير.",
  },
  {
    icon: "collections",
    title: "المجموعات والمعرض",
    desc: "نظّم الوصفات في مجموعات، شارك صور التحضير، وتصفّح معرضاً جميلاً من التحضيرات.",
  },
];

const stats = [
  { value: "10K+", label: "وصفة" },
  { value: "50K+", label: "محضّر" },
  { value: "500+", label: "محمصة" },
  { value: "4.9", label: "تقييم التطبيق" },
];

export default function LandingPage() {
  return (
    <div className="bg-background-light text-espresso min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-xl border-b border-espresso/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
              <MaterialIcon icon="coffee" className="text-espresso text-xl" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">وصفة</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">المميزات</a>
            <a href="#pricing" className="text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity">الأسعار</a>
            <Link href="/login" className="text-sm font-bold opacity-80 hover:opacity-100">تسجيل الدخول</Link>
            <Link href="/signup" className="bg-primary text-espresso px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              ابدأ الآن
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className="text-sm font-bold opacity-80">تسجيل الدخول</Link>
            <Link href="/signup" className="bg-primary text-espresso px-4 py-2 rounded-xl text-sm font-bold">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-brand-gold/5" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-32 md:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
              <MaterialIcon icon="auto_awesome" className="text-primary text-sm" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">رفيقك المثالي في عالم القهوة</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
              حضّر أفضل.{" "}
              <span className="text-primary">شارك أكثر.</span>{" "}
              <span className="opacity-40">كرّر.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-60 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
              اكتشف الوصفات، تابع تحضيراتك، تواصل مع مجتمع عشّاق القهوة والشاي، ولا تحضّر كوباً سيئاً مرة أخرى.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="bg-primary text-espresso px-8 py-4 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                ابدأ التحضير مجاناً <MaterialIcon icon="arrow_forward" className="text-lg" />
              </Link>
              <Link
                href="/search"
                className="border-2 border-espresso/10 px-8 py-4 rounded-2xl text-base font-bold hover:border-primary/30 transition-colors flex items-center gap-2"
              >
                <MaterialIcon icon="explore" className="text-lg opacity-60" /> تصفّح الوصفات
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 bg-espresso/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              كل ما تحتاجه للتحضير
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              من أول تحضير فلتر إلى إتقان فن اللاتيه — أدوات لكل خطوة في رحلتك.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-espresso/5 hover:border-primary/20 hover:shadow-lg transition-all group"
              >
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <MaterialIcon icon={f.icon} className="text-primary text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm opacity-50 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              كيف تعمل وصفة؟
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: "person_add", title: "أنشئ حسابك", desc: "سجّل في ثوانٍ. حدد تفضيلات التحضير والفئات المفضلة لديك." },
              { step: "02", icon: "search", title: "اكتشف وحضّر", desc: "تصفّح الوصفات، ابدأ وضع التحضير الموجّه مع المؤقتات، وسجّل نتائجك." },
              { step: "03", icon: "trending_up", title: "طوّر وشارك", desc: "تابع تقدمك في دفتر التحضير، اكسب مكافآت، وشارك مع المجتمع." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <MaterialIcon icon={item.icon} className="text-primary text-3xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary text-espresso flex items-center justify-center text-xs font-extrabold shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Brewers */}
      <section id="pricing" className="py-20 md:py-28 bg-espresso/[0.02]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              أسعار بسيطة وشفافة
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              ابدأ مجاناً. قم بالترقية عندما تكون جاهزاً للمزيد.
            </p>
          </div>
          <UserPricingToggle />
        </div>
      </section>

      {/* Pricing — Roasters */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-gold/10 border border-brand-gold/20 rounded-full px-4 py-1.5 mb-6">
              <MaterialIcon icon="storefront" className="text-brand-gold text-sm" />
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">للمحمصات والعلامات التجارية</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              نمّي علامتك التجارية على وصفة
            </h2>
            <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
              اوصل لعشّاق القهوة والشاي المتحمسين. اعرض منتجاتك، ابنِ مجتمعاً، وحقق مبيعات.
            </p>
          </div>
          <RoasterPricingToggle />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <MaterialIcon icon="coffee" className="text-primary text-4xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            مستعد لتحضير شيء مذهل؟
          </h2>
          <p className="text-base opacity-50 max-w-md mx-auto mb-8 font-medium">
            انضم لآلاف المحضّرين الذين يتقنون حرفتهم مع وصفة.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-espresso px-8 py-4 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
          >
            أنشئ حساب مجاني <MaterialIcon icon="arrow_forward" className="text-lg" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-espresso/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                  <MaterialIcon icon="coffee" className="text-espresso text-sm" />
                </div>
                <span className="font-extrabold tracking-tight">وصفة</span>
              </div>
              <p className="text-sm opacity-40 font-medium leading-relaxed">
                المنصة المثالية لعشّاق القهوة والشاي.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">المنتج</h4>
              <div className="space-y-2">
                <Link href="/search" className="block text-sm opacity-50 hover:opacity-100 font-medium">الوصفات</Link>
                <Link href="/roasters" className="block text-sm opacity-50 hover:opacity-100 font-medium">المحمصات</Link>
                <Link href="/leaderboard" className="block text-sm opacity-50 hover:opacity-100 font-medium">المتصدرين</Link>
                <Link href="/events" className="block text-sm opacity-50 hover:opacity-100 font-medium">الفعاليات</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">الشركة</h4>
              <div className="space-y-2">
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">عن وصفة</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">المدونة</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">وظائف</a>
                <a href="#" className="block text-sm opacity-50 hover:opacity-100 font-medium">تواصل معنا</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider opacity-60">قانوني</h4>
              <div className="space-y-2">
                <a href="/privacy" className="block text-sm opacity-50 hover:opacity-100 font-medium">سياسة الخصوصية</a>
                <a href="/terms" className="block text-sm opacity-50 hover:opacity-100 font-medium">شروط الخدمة</a>
                <a href="/refund-policy" className="block text-sm opacity-50 hover:opacity-100 font-medium">سياسة الاسترداد</a>
              </div>
            </div>
          </div>
          <div className="border-t border-espresso/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs opacity-30 font-medium">&copy; {new Date().getFullYear()} وصفة. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="size-8 rounded-full bg-espresso/5 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MaterialIcon icon="language" className="text-sm opacity-50" />
              </a>
              <a href="#" className="size-8 rounded-full bg-espresso/5 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <MaterialIcon icon="mail" className="text-sm opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
