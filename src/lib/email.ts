import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "وصفة <noreply@wsfa.app>";

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email skipped - no RESEND_API_KEY] To: ${to}, Subject: ${subject}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error("فشل إرسال البريد الإلكتروني");
  }
}

// ─── Welcome Email ───

export async function sendWelcomeEmail(to: string, name: string) {
  await send(to, "أهلاً بك في وصفة! ☕", `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f5f5f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 60px; height: 60px; background: #25f459; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">☕</div>
        <h1 style="color: #0f1714; margin: 16px 0 4px; font-size: 24px;">أهلاً بك في وصفة</h1>
        <p style="color: #666; margin: 0;">مرحباً ${name}!</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <p style="color: #333; line-height: 1.8; margin: 0;">شكراً لانضمامك إلى مجتمع وصفة. يمكنك الآن:</p>
        <ul style="color: #333; line-height: 2; padding-right: 20px;">
          <li>اكتشاف وصفات القهوة والشاي</li>
          <li>تحضير مع المؤقت الموجّه</li>
          <li>مشاركة وصفاتك مع المجتمع</li>
          <li>متابعة المحمصات والعلامات التجارية</li>
        </ul>
      </div>
      <div style="text-align: center;">
        <a href="https://wsfa.app/home" style="display: inline-block; background: #25f459; color: #0f1714; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">ابدأ الاستكشاف</a>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">وصفة - رفيقك في عالم القهوة</p>
    </div>
  `);
}

// ─── Password Reset Email ───

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `https://wsfa.app/reset-password?token=${resetToken}`;

  await send(to, "إعادة تعيين كلمة المرور - وصفة", `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f5f5f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 60px; height: 60px; background: #25f459; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">🔐</div>
        <h1 style="color: #0f1714; margin: 16px 0 4px; font-size: 24px;">إعادة تعيين كلمة المرور</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <p style="color: #333; line-height: 1.8; margin: 0 0 16px;">مرحباً ${name}،</p>
        <p style="color: #333; line-height: 1.8; margin: 0 0 16px;">تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
      </div>
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${resetUrl}" style="display: inline-block; background: #25f459; color: #0f1714; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">تعيين كلمة مرور جديدة</a>
      </div>
      <div style="background: white; border-radius: 12px; padding: 16px;">
        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">ينتهي هذا الرابط خلال ساعة واحدة. إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.</p>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">وصفة - رفيقك في عالم القهوة</p>
    </div>
  `);
}

// ─── Email Verification ───

export async function sendVerificationEmail(to: string, name: string, verifyToken: string) {
  const verifyUrl = `https://wsfa.app/verify-email?token=${verifyToken}`;

  await send(to, "تأكيد بريدك الإلكتروني - وصفة", `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f5f5f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 60px; height: 60px; background: #25f459; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✉️</div>
        <h1 style="color: #0f1714; margin: 16px 0 4px; font-size: 24px;">تأكيد البريد الإلكتروني</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
        <p style="color: #333; line-height: 1.8; margin: 0 0 16px;">مرحباً ${name}،</p>
        <p style="color: #333; line-height: 1.8; margin: 0;">يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:</p>
      </div>
      <div style="text-align: center; margin-bottom: 16px;">
        <a href="${verifyUrl}" style="display: inline-block; background: #25f459; color: #0f1714; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 16px;">تأكيد البريد الإلكتروني</a>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">وصفة - رفيقك في عالم القهوة</p>
    </div>
  `);
}
