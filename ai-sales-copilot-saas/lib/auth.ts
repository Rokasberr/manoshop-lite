import bcrypt from "bcryptjs";
import { SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

async function ensureTrialSubscription(userId: string) {
  const existing = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE],
      },
    },
  });

  if (!existing) {
    await prisma.subscription.create({
      data: {
        userId,
        plan: SubscriptionPlan.FREE_TRIAL,
        status: SubscriptionStatus.TRIALING,
        leadLimit: 25,
      },
    });
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.currentPlan,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      if (account?.provider === "google") {
        const dbUser = await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email: user.email.toLowerCase(),
            name: user.name ?? "Google User",
            image: user.image,
          },
        });

        await ensureTrialSubscription(dbUser.id);

        user.id = dbUser.id;
        user.role = dbUser.role;
        user.plan = dbUser.currentPlan;
      }

      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email ?? token.email;

      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.plan = user.plan;
      }

      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, role: true, currentPlan: true },
        });

        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.plan = dbUser.currentPlan;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? UserRole.MEMBER;
        session.user.plan = token.plan ?? SubscriptionPlan.FREE_TRIAL;
      }

      return session;
    },
  },
};
