import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  basePath: "/api/auth",
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          checks: ["none"],
        })]
      : []),
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        // Block suspended users
        if (user.status === "SUSPENDED") return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const otp = credentials?.otp as string;
        if (!phone || !otp) return null;

        if (!/^\d{6}$/.test(otp)) return null;

        // Find the most recent unused, non-expired OTP for this phone
        const otpToken = await prisma.otpToken.findFirst({
          where: {
            phone,
            used: false,
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!otpToken) return null;

        // Max 5 attempts per OTP
        if (otpToken.attempts >= 5) {
          await prisma.otpToken.update({
            where: { id: otpToken.id },
            data: { used: true },
          });
          return null;
        }

        // Increment attempts
        await prisma.otpToken.update({
          where: { id: otpToken.id },
          data: { attempts: { increment: 1 } },
        });

        // Verify the OTP code against the hash
        const isValid = await compare(otp, otpToken.code);
        if (!isValid) return null;

        // Mark OTP as used
        await prisma.otpToken.update({
          where: { id: otpToken.id },
          data: { used: true },
        });

        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              name: `User ${phone.slice(-4)}`,
            },
          });
        }

        // Block suspended users
        if (user.status === "SUSPENDED") return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "USER";
      }

      if (account?.provider === "google" && profile?.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || null,
                image: (profile as any).picture as string || null,
              },
            });
          }
          token.id = dbUser.id;
          token.role = dbUser.role;
        } catch {
          // Prisma not available (Edge runtime) — skip
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
