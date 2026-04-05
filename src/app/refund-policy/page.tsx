import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function RefundPolicyPage() {
  return (
    <div className="bg-background-light text-espresso min-h-screen">
      {/* Nav - matches landing page */}
      <nav className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-xl border-b border-espresso/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-10 bg-primary rounded-xl flex items-center justify-center">
              <MaterialIcon icon="coffee" className="text-espresso text-xl" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">وصفة</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold opacity-60 hover:opacity-100">
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">سياسة الاسترداد</h1>
          <p className="text-base opacity-50 max-w-lg mx-auto font-medium">
            قواعدنا المتعلقة بالمدفوعات والإلغاءات وأهلية الاسترداد
          </p>
        </div>

        {/* Policies */}
        <div className="max-w-2xl mx-auto space-y-0">
          {[
            {
              num: "01",
              icon: "event_available",
              title: "إلغاء الاشتراك خلال ١٤ يوم",
              body: "لا يمكن إلغاء الاشتراك في الباقات (السنوية، الشهرية) إلا خلال ١٤ يوم من تفعيلها لأول مرة، ويتم معالجة استرداد المبالغ المدفوعة خلال ١٤ يوم.",
            },
            {
              num: "02",
              icon: "schedule",
              title: "الإلغاء بعد ١٤ يوم",
              body: "في حال إلغاء الاشتراك في إحدى الباقات المدفوعة بعد ١٤ يوم من تفعيلها، يمكنك الاستمرار في استخدام الباقة والاستفادة من مزاياها حتى تاريخ انتهاء الاشتراك ولا يمكن استرجاع مبلغ الاشتراك.",
            },
            {
              num: "03",
              icon: "autorenew",
              title: "التجديد التلقائي",
              body: "عند تفعيل خيار تجديد الاشتراك تلقائياً، تتم معالجة رسوم الاشتراك تلقائياً بمجرد إصدار فاتورة الاشتراك الجديدة.",
            },
            {
              num: "04",
              icon: "block",
              title: "عدم الاسترداد بعد تسليم الخدمة",
              body: "لن يتم إصدار استرداد للمبالغ في الحالات التي يغير فيها العميل رأيه بعد تسليم الخدمة كما وُعد.",
            },
            {
              num: "05",
              icon: "local_offer",
              title: "العروض الترويجية والخصومات",
              body: "تتم معالجة استرداد المبالغ المعتمدة على الخدمات التي تم شراؤها من خلال العروض الترويجية أو الخصومات بناءً على المبلغ الفعلي الذي دفعه العميل.",
            },
          ].map((item, i) => (
            <div
              key={item.num}
              className={`flex gap-6 py-8 ${i > 0 ? "border-t border-espresso/5" : ""}`}
            >
              <div className="relative flex-shrink-0">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MaterialIcon icon={item.icon} className="text-primary text-2xl" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-primary text-espresso flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                  {item.num}
                </div>
              </div>
              <div className="pt-1">
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p className="text-sm opacity-50 font-medium leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="bg-espresso/[0.02] rounded-2xl border border-espresso/5 p-8">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MaterialIcon icon="support_agent" className="text-primary text-2xl" />
            </div>
            <h3 className="font-bold mb-2">تحتاج مساعدة؟</h3>
            <p className="text-sm opacity-40 font-medium mb-4">للاستفسارات حول الاسترداد والمدفوعات</p>
            <a
              href="mailto:support@wsfa.app"
              className="inline-flex items-center gap-2 bg-primary text-espresso px-6 py-3 rounded-xl text-sm font-extrabold hover:bg-primary/90 transition-colors"
            >
              <MaterialIcon icon="email" className="text-lg" />
              support@wsfa.app
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-espresso/5 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <MaterialIcon icon="coffee" className="text-espresso text-sm" />
            </div>
            <span className="font-extrabold tracking-tight text-sm">وصفة</span>
          </div>
          <p className="text-xs opacity-30 font-medium">© {new Date().getFullYear()} وصفة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
