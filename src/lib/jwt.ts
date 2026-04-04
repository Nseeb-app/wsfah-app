import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-dev-secret-change-in-production"
);

export async function signMobileToken(payload: { id: string; role: string }) {
  return new SignJWT({ sub: payload.id, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}
