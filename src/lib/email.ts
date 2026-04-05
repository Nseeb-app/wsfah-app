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

// ─── Shared Layout ───

function layout(content: string) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0f1714;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;background:#25f459;border-radius:14px;line-height:48px;text-align:center;font-size:24px;">☕</div>
      <div style="color:#f5f5f0;font-size:22px;font-weight:900;margin-top:12px;letter-spacing:1px;">وصفة</div>
    </div>

    <!-- Content Card -->
    <div style="background:#1a2420;border-radius:20px;padding:32px 28px;border:1px solid rgba(37,244,89,0.1);">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;">
      <div style="color:rgba(245,245,240,0.25);font-size:12px;line-height:1.6;">
        وصفة - رفيقك في عالم التحضير
        <br>
        <a href="https://wsfa.app" style="color:rgba(37,244,89,0.5);text-decoration:none;">wsfa.app</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function button(href: string, text: string) {
  return `<div style="text-align:center;margin:24px 0 8px;">
    <a href="${href}" style="display:inline-block;background:#25f459;color:#0f1714;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.3px;">${text}</a>
  </div>`;
}

// ─── Welcome Email ───

export async function sendWelcomeEmail(to: string, name: string) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">👋</div>
      <h1 style="color:#f5f5f0;margin:0;font-size:22px;font-weight:800;">أهلاً بك، ${name}</h1>
      <p style="color:rgba(245,245,240,0.5);margin:8px 0 0;font-size:14px;">مرحباً في مجتمع وصفة</p>
    </div>

    <div style="border-top:1px solid rgba(245,245,240,0.06);margin:20px 0;"></div>

    <div style="color:rgba(245,245,240,0.7);font-size:14px;line-height:2;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="color:#25f459;font-size:16px;">✓</span>
        <span>اكتشف وصفات القهوة والشاي</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="color:#25f459;font-size:16px;">✓</span>
        <span>حضّر مع المؤقت الموجّه</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="color:#25f459;font-size:16px;">✓</span>
        <span>شارك وصفاتك مع المجتمع</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:#25f459;font-size:16px;">✓</span>
        <span>تابع المحمصات والعلامات التجارية</span>
      </div>
    </div>

    ${button("https://wsfa.app/home", "ابدأ الاستكشاف")}
  `);

  await send(to, "أهلاً بك في وصفة ☕", html);
}

// ─── Password Reset Email ───

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `https://wsfa.app/reset-password?token=${resetToken}`;

  const html = layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">🔐</div>
      <h1 style="color:#f5f5f0;margin:0;font-size:22px;font-weight:800;">إعادة تعيين كلمة المرور</h1>
    </div>

    <div style="border-top:1px solid rgba(245,245,240,0.06);margin:20px 0;"></div>

    <p style="color:rgba(245,245,240,0.7);font-size:14px;line-height:1.8;margin:0 0 8px;">
      مرحباً ${name}،
    </p>
    <p style="color:rgba(245,245,240,0.7);font-size:14px;line-height:1.8;margin:0 0 4px;">
      تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.
    </p>

    ${button(resetUrl, "تعيين كلمة مرور جديدة")}

    <div style="background:rgba(245,245,240,0.03);border-radius:12px;padding:14px 16px;margin-top:20px;">
      <p style="color:rgba(245,245,240,0.35);font-size:12px;line-height:1.6;margin:0;">
        ⏱ ينتهي هذا الرابط خلال ساعة واحدة
        <br>
        إذا لم تطلب إعادة التعيين، تجاهل هذا البريد.
      </p>
    </div>
  `);

  await send(to, "إعادة تعيين كلمة المرور - وصفة", html);
}

// ─── Email Verification ───

export async function sendVerificationEmail(to: string, name: string, verifyToken: string) {
  const verifyUrl = `https://wsfa.app/verify-email?token=${verifyToken}`;

  const html = layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">✉️</div>
      <h1 style="color:#f5f5f0;margin:0;font-size:22px;font-weight:800;">تأكيد البريد الإلكتروني</h1>
    </div>

    <div style="border-top:1px solid rgba(245,245,240,0.06);margin:20px 0;"></div>

    <p style="color:rgba(245,245,240,0.7);font-size:14px;line-height:1.8;margin:0 0 8px;">
      مرحباً ${name}،
    </p>
    <p style="color:rgba(245,245,240,0.7);font-size:14px;line-height:1.8;margin:0;">
      يرجى تأكيد بريدك الإلكتروني بالضغط على الزر أدناه:
    </p>

    ${button(verifyUrl, "تأكيد البريد الإلكتروني")}
  `);

  await send(to, "تأكيد بريدك الإلكتروني - وصفة", html);
}
