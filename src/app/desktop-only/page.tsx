import Link from "next/link";
import MaterialIcon from "@/components/MaterialIcon";

export default function DesktopOnlyPage() {
  return (
    <div className="bg-background-light text-espresso min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-6">
        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <MaterialIcon icon="smartphone" className="text-primary text-4xl" />
        </div>
        <h1 className="text-2xl font-extrabold">تطبيق وصفة للموبايل فقط</h1>
        <p className="text-espresso/50 leading-relaxed">
          تطبيق وصفة مصمم لتجربة الموبايل. افتح الرابط من هاتفك أو حمّل التطبيق.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="https://play.google.com/store/apps/details?id=com.wsfa.app"
            className="flex items-center justify-center gap-2 bg-espresso text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-espresso/90 transition-colors"
          >
            <MaterialIcon icon="android" className="text-lg" />
            تحميل من Google Play
          </a>
          <a
            href="https://apps.apple.com/app/wsfa/id0000000000"
            className="flex items-center justify-center gap-2 bg-espresso text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-espresso/90 transition-colors"
          >
            <MaterialIcon icon="phone_iphone" className="text-lg" />
            تحميل من App Store
          </a>
        </div>
        <Link href="/" className="block text-sm text-primary font-bold hover:underline">
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}
