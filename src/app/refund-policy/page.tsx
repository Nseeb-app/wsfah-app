import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function RefundPolicyPage() {
  return (
    <div className="bg-background-light text-espresso min-h-screen">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10">
            <MaterialIcon icon="arrow_back" />
          </Link>
          <h1 className="text-lg font-bold">سياسة الاسترداد</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-extrabold mb-4">نظرة عامة</h2>
            <p className="text-espresso/60 leading-relaxed">
              فيما يلي قواعدنا المتعلقة بالمدفوعات والإلغاءات وأهلية الاسترداد لجميع خدمات وصفة.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-espresso/10 p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="event_available" className="text-green-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">إلغاء الاشتراك خلال ١٤ يوم</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">
                  لا يمكن إلغاء الاشتراك في الباقات (السنوية، الشهرية) إلا خلال ١٤ يوم من تفعيلها لأول مرة، ويتم معالجة استرداد المبالغ المدفوعة خلال ١٤ يوم.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="schedule" className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">الإلغاء بعد ١٤ يوم</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">
                  في حال إلغاء الاشتراك في إحدى الباقات المدفوعة بعد ١٤ يوم من تفعيلها، يمكنك الاستمرار في استخدام الباقة والاستفادة من مزاياها حتى تاريخ انتهاء الاشتراك ولا يمكن استرجاع مبلغ الاشتراك.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="autorenew" className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">التجديد التلقائي</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">
                  عند تفعيل خيار تجديد الاشتراك تلقائياً، تتم معالجة رسوم الاشتراك تلقائياً بمجرد إصدار فاتورة الاشتراك الجديدة.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="block" className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">عدم الاسترداد بعد تسليم الخدمة</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">
                  لن يتم إصدار استرداد للمبالغ في الحالات التي يغير فيها العميل رأيه بعد تسليم الخدمة كما وُعد.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcon icon="local_offer" className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">العروض الترويجية والخصومات</h3>
                <p className="text-sm text-espresso/60 leading-relaxed">
                  تتم معالجة استرداد المبالغ المعتمدة على الخدمات التي تم شراؤها من خلال العروض الترويجية أو الخصومات بناءً على المبلغ الفعلي الذي دفعه العميل.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center text-sm text-espresso/40 space-y-2">
            <p>للاستفسارات حول الاسترداد، تواصل معنا عبر</p>
            <a href="mailto:support@wsfa.app" className="text-primary font-bold hover:underline">
              support@wsfa.app
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
