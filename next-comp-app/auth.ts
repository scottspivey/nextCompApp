//root/auth.ts


import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma'; 
// Import base types from next-auth that we will use or that Session will extend
import type { NextAuthConfig, Account, Session as NextAuthSession, User as NextAuthUser } from "next-auth"; 
// JWT type is from @auth/core/jwt in v5
import type { JWT } from "@auth/core/jwt"; 
import type { AdapterUser } from "@auth/core/adapters";
// Import our explicitly defined AppUser type
import type { AppUser } from "@/types/next-auth"; // Adjust path if necessary

// Define custom error classes ONCE
class InvalidCredentialsError extends Error {
  constructor(message = "Invalid email or password.") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
class UserNotFoundError extends Error {
  constructor(message = "No user found with this email.") {
    super(message);
    this.name = "UserNotFoundError";
  }
}
class MissingPasswordError extends Error {
  constructor(message = "This account was created using an OAuth provider. Please sign in with Google or Microsoft.") {
    super(message);
    this.name = "MissingPasswordError";
  }
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftEntraIDProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AppUser | null> { // Explicitly return our AppUser type
        if (!credentials?.email || !credentials.password) {
          throw new InvalidCredentialsError("Missing email or password.");
        }
        const email = credentials.email as string;
        const password = credentials.password as string;
        const userFromDb = await prisma.user.findUnique({
          where: { email: email },
          include: { profile: true, subscriptions: true }
        });

        if (!userFromDb) throw new UserNotFoundError();
        if (!userFromDb.password) throw new MissingPasswordError();

        const isValid = await bcrypt.compare(password, userFromDb.password);
        if (!isValid) throw new InvalidCredentialsError();
        
        // Construct the AppUser object
        const authorizedUser: AppUser = {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name,
          image: userFromDb.image,
          emailVerified: userFromDb.emailVerified, // emailVerified is part of AppUser
          role: userFromDb.profile?.role,
          subscriptionStatus: userFromDb.subscriptions?.status,
          profileId: userFromDb.profile?.id,
        };
        return authorizedUser;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) { 
      return true; 
    },
    // Explicitly type the parameters for the jwt callback
    async jwt(params: { token: JWT; user?: NextAuthUser | AdapterUser; account?: Account | null; profile?: any; trigger?: "signIn" | "signUp" | "update"; isNewUser?: boolean; session?: any; }): Promise<JWT> {
      const { token, user, account } = params;
      // user is the base NextAuthUser or AdapterUser here.
      // token is our augmented JWT.
      if (user) { 
        let userDetailsToEmbed: AppUser; // We will construct our AppUser type

        if (account) { 
          // OAuth flow: user.id is from the provider/adapter.
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id }, 
            include: { profile: true, subscriptions: true },
          });

          if (!dbUser) {
            console.error("JWT Callback: User not found in DB for OAuth flow. ID:", user.id);
            return token; 
          }

          // Construct AppUser from dbUser data
          userDetailsToEmbed = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            emailVerified: dbUser.emailVerified, // Sourced from DB
            profileId: dbUser.profile?.id,
            role: dbUser.profile?.role,
            subscriptionStatus: dbUser.subscriptions?.status,
          };
        } else {
          // Credentials flow: 'user' is the result of 'authorize', which we typed as AppUser.
          userDetailsToEmbed = user as AppUser; 
        }

        token.userId = userDetailsToEmbed.id; // userId is on our augmented JWT
        token.profileId = userDetailsToEmbed.profileId;
        token.role = userDetailsToEmbed.role;
        token.subscriptionStatus = userDetailsToEmbed.subscriptionStatus;
        
        token.name = userDetailsToEmbed.name;
        token.email = userDetailsToEmbed.email;
        token.picture = userDetailsToEmbed.image;
      }
      return token;
    },
    // Explicitly type the parameters for the session callback
    async session(params: { session: NextAuthSession; token: JWT; user: AdapterUser; newSession?: any; trigger?: "update" }): Promise<NextAuthSession> { 
      const { session, token } = params;
      // session.user should be our AppUser type due to augmentation in next-auth.d.ts
      if (session.user) { 
        const userInSession = session.user as AppUser; // Cast for clarity and property access
        // userInSession.id = token.userId; // token.userId should be string, session.user.id is string
        // id is usually already on session.user from NextAuthUser
        
        userInSession.profileId = token.profileId; 
        userInSession.role = token.role;
        userInSession.subscriptionStatus = token.subscriptionStatus;
        // userInSession.emailVerified is part of AppUser, so it should be on session.user
      }
      return session;
    },
  },
  events: {
    async createUser(message) { 
      if (!message.user.id) {
        console.error("User ID is missing in createUser event. Cannot create profile.");
        return;
      }
      try {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: message.user.id },
        });
        if (!existingProfile) {
          await prisma.profile.create({
            data: {
              userId: message.user.id, 
              full_name: message.user.name, 
            },
          });
        }
      } catch (error) {
        console.error("Error creating profile in createUser event:", error);
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', 
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);