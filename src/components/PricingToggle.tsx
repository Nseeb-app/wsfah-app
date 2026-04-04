"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "./MaterialIcon";

type Interval = "monthly" | "yearly";

interface Plan {
  name: string;
  monthly: string;
  yearly: string;
  period: { monthly: string; yearly: string };
  desc: string;
  features: string[];
  cta: { monthly: string; yearly: string } | string;
  href: { monthly: string; yearly: string } | string;
  highlighted?: boolean;
  badge?: string;
  yearlyBadge?: string;
  isGold?: boolean;
}

export function UserPricingToggle() {
  const plans: Plan[] = [
    {
      name: "مجاني",
      monthly: "0",
      yearly: "0",
      period: { monthly: "للأبد", yearly: "للأبد" },
      desc: "كل ما تحتاجه لتبدأ تحضيراً أفضل",
      features: [
        "تصفّح جميع الوصفات",
        "مؤقت التحضير والوضع الموجّه",
        "حاسبة نسبة التحضير",
        "إنشاء حتى 3 وصفات",
        "إعجاب وحفظ حتى 20 وصفة",
        "بحث أساسي ولوحة المتصدرين",
      ],
      cta: "ابدأ الآن",
      href: "/signup",
    },
    {
      name: "احترافي",
      monthly: "4.99",
      yearly: "49.99",
      period: { monthly: "/شهرياً", yearly: "/سنوياً" },
      desc: "للمحضّرين الجادين الذين يريدون التجربة الكاملة",
      features: [
        "كل شيء في المجاني",
        "وصفات وحفظ بلا حدود",
        "دفتر تحضير مع تحليلات",
        "وسم عجلة النكهات",
        "ملفات تحضير مخصصة",
        "وصول للوصفات بدون إنترنت",
        "نسخ وإعادة مزج الوصفات",
        "المجموعات والمجموعات والرسائل",
      ],
      cta: "ابدأ الفترة التجريبية",
      href: { monthly: "/pricing?interval=monthly", yearly: "/pricing?interval=yearly" },
      highlighted: true,
      badge: "الأكثر شعبية",
      yearlyBadge: "وفّر ١٧%",
    },
  ];

  return <PricingSection plans={plans} variant="user" />;
}

export function RoasterPricingToggle() {
  const plans: Plan[] = [
    {
      name: "المحمصة - أساسي",
      monthly: "39",
      yearly: "390",
      period: { monthly: "/شهرياً", yearly: "/سنوياً" },
      desc: "اعرض علامتك التجارية أمام آلاف المحضّرين",
      features: [
        "ملف محمصة موثّق وشارة",
        "كتالوج منتجات (حتى 50 منتج)",
        "تقييمات ومراجعات العملاء",
        "تحليلات أساسية للعلامة التجارية",
        "ربط الوصفات بمنتجاتك",
        "صفحة مجموعة مجتمعية",
      ],
      cta: "ابدأ الفترة التجريبية",
      href: { monthly: "/pricing?interval=monthly", yearly: "/pricing?interval=yearly" },
      yearlyBadge: "وفّر ١٧%",
      isGold: true,
    },
    {
      name: "المحمصة - احترافي",
      monthly: "79",
      yearly: "790",
      period: { monthly: "/شهرياً", yearly: "/سنوياً" },
      desc: "وسّع جمهورك وحقق مبيعات فعلية",
      features: [
        "كل شيء في المحمصة - أساسي",
        "كتالوج منتجات بلا حدود",
        "وصفات مروّجة في الخلاصة",
        "تحليلات ورؤى متقدمة",
        "أداة مقارنة التحضير",
        "سجل إصدارات الوصفات",
        "استضافة وترويج الفعاليات",
        "أولوية الظهور في البحث",
      ],
      cta: "ابدأ الفترة التجريبية",
      href: { monthly: "/pricing?interval=monthly", yearly: "/pricing?interval=yearly" },
      highlighted: true,
      badge: "أفضل قيمة",
      yearlyBadge: "وفّر ١٧%",
      isGold: true,
    },
    {
      name: "الشركات",
      monthly: "مخصص",
      yearly: "مخصص",
      period: { monthly: "", yearly: "" },
      desc: "للمحمصات الكبيرة والسلاسل والموزعين",
      features: [
        "كل شيء في المحمصة - احترافي",
        "إدارة مواقع متعددة",
        "وصول API وتكاملات",
        "مدير حساب مخصص",
        "هوية مخصصة وصفحة هبوط",
        "استيراد منتجات بالجملة",
        "حسابات أعضاء الفريق",
        "أدلة تحضير بعلامتك التجارية",
      ],
      cta: "تواصل مع المبيعات",
      href: "/pricing",
      isGold: true,
    },
  ];

  return <PricingSection plans={plans} variant="roaster" />;
}

function PricingSection({ plans, variant }: { plans: Plan[]; variant: "user" | "roaster" }) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const isGold = variant === "roaster";

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-bold ${interval === "monthly" ? "opacity-100" : "opacity-40"}`}>
          شهري
        </span>
        <button
          onClick={() => setInterval(interval === "monthly" ? "yearly" : "monthly")}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            interval === "yearly" ? (isGold ? "bg-brand-gold" : "bg-primary") : "bg-espresso/20"
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
              interval === "yearly" ? "left-0.5" : "left-[calc(100%-26px)]"
            }`}
          />
        </button>
        <span className={`text-sm font-bold ${interval === "yearly" ? "opacity-100" : "opacity-40"}`}>
          سنوي
        </span>
        {interval === "yearly" && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isGold ? "bg-brand-gold/10 text-brand-gold" : "bg-green-100 text-green-700"
          }`}>
            وفّر ١٧%
          </span>
        )}
      </div>

      {/* Cards */}
      <div className={`grid gap-6 ${variant === "roaster" ? "md:grid-cols-3 max-w-5xl" : "md:grid-cols-2 max-w-3xl"} mx-auto`}>
        {plans.map((plan) => {
          const price = plan[interval];
          const period = plan.period[interval];
          const href = typeof plan.href === "string" ? plan.href : plan.href[interval];
          const cta = typeof plan.cta === "string" ? plan.cta : plan.cta[interval];
          const showYearlySaving = interval === "yearly" && plan.yearlyBadge && price !== "0" && price !== "مخصص";
          const accentColor = isGold ? "brand-gold" : "primary";

          return (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border transition-all ${
                plan.highlighted
                  ? `bg-espresso text-oat-milk border-${accentColor} shadow-2xl scale-[1.02] relative`
                  : "bg-white border-espresso/5 hover:shadow-lg"
              }`}
              style={plan.highlighted ? { borderColor: isGold ? "var(--color-brand-gold, #D4A574)" : undefined } : undefined}
            >
              {plan.highlighted && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                  isGold ? "bg-brand-gold" : "bg-primary"
                } text-espresso text-[10px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md`}>
                  {showYearlySaving ? plan.yearlyBadge : plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{price}</span>
                  {price !== "مخصص" && price !== "0" && (
                    <span className="text-sm font-semibold opacity-50">SAR</span>
                  )}
                  {period && (
                    <span className={`text-sm font-semibold ${plan.highlighted ? "opacity-60" : "opacity-40"}`}>{period}</span>
                  )}
                </div>
                {/* Monthly equivalent for yearly */}
                {interval === "yearly" && price !== "0" && price !== "مخصص" && (
                  <p className={`text-xs mt-1 ${plan.highlighted ? "opacity-50" : "opacity-35"}`}>
                    ≈ {(parseFloat(price) / 12).toFixed(2)} SAR /شهرياً
                  </p>
                )}
                <p className={`text-sm mt-2 font-medium ${plan.highlighted ? "opacity-70" : "opacity-50"}`}>{plan.desc}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-medium">
                    <MaterialIcon
                      icon="check_circle"
                      className={`text-lg flex-shrink-0 ${
                        plan.highlighted
                          ? isGold ? "text-brand-gold" : "text-primary"
                          : isGold ? "text-brand-gold/70" : "text-primary/70"
                      }`}
                      filled
                    />
                    <span className={plan.highlighted ? "opacity-90" : "opacity-60"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${
                  plan.highlighted
                    ? isGold
                      ? "bg-brand-gold text-espresso hover:bg-brand-gold/90 shadow-lg"
                      : "bg-primary text-espresso hover:bg-primary/90 shadow-lg"
                    : isGold
                      ? "bg-espresso/5 text-espresso hover:bg-brand-gold hover:text-espresso"
                      : "bg-espresso/5 text-espresso hover:bg-primary hover:text-espresso"
                }`}
              >
                {cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
