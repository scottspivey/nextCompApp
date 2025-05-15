//root/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma'; // Assuming prisma.ts is in ./lib/
import type { NextAuthConfig } from "next-auth";
// Import our augmented User type from next-auth.d.ts
import type { User as CustomAuthUser } from "@auth/core/types"; 

// Define custom error types for better client-side feedback
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
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<CustomAuthUser | null> {
        if (!credentials?.email || !credentials.password) {
          throw new InvalidCredentialsError("Missing email or password.");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const userFromDb = await prisma.user.findUnique({
          where: { email: email },
          include: { 
            profile: true,
            subscriptions: true 
          }
        });

        if (!userFromDb) {
          throw new UserNotFoundError();
        }

        if (!userFromDb.password) {
          throw new MissingPasswordError();
        }

        const isValid = await bcrypt.compare(password, userFromDb.password);
        if (!isValid) {
          throw new InvalidCredentialsError();
        }
        
        // Construct and explicitly type the object to match CustomAuthUser
        const authorizedUser: CustomAuthUser = {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name,
          image: userFromDb.image,
          emailVerified: userFromDb.emailVerified, // emailVerified is now part of CustomAuthUser
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
      // Primary role: access control. Profile creation for OAuth is in events.createUser.
      return true; // Allow sign-in
    },
    async jwt({ token, user, account }) {
      // user parameter: Type is User | AdapterUser from Auth.js core.
      // token parameter: Type is our augmented JWT from types/next-auth.d.ts.

      if (user) { // This block runs on initial sign-in
        let userDetailsForToken: CustomAuthUser;

        if (account) { 
          // OAuth flow: 'user' is likely AdapterUser or basic User from provider.
          // Fetch complete user data from DB to ensure all fields are present.
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id }, // user.id is available on AdapterUser/User
            include: { profile: true, subscriptions: true },
          });

          if (!dbUser) {
            console.error("JWT Callback: User not found in DB for OAuth flow. ID:", user.id);
            return token; // Early exit
          }

          // Construct the CustomAuthUser object from dbUser's data
          userDetailsForToken = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            emailVerified: dbUser.emailVerified, // Sourced from DB, part of CustomAuthUser
            profileId: dbUser.profile?.id,
            role: dbUser.profile?.role,
            subscriptionStatus: dbUser.subscriptions?.status,
          };
        } else {
          // Credentials flow: 'user' is already the CustomAuthUser from 'authorize' callback.
          userDetailsForToken = user as CustomAuthUser; // Cast is safe here due to authorize's return type
        }

        // Populate the token from the fully-typed userDetailsForToken
        token.userId = userDetailsForToken.id;
        token.profileId = userDetailsForToken.profileId;
        token.role = userDetailsForToken.role;
        token.subscriptionStatus = userDetailsForToken.subscriptionStatus;
        
        // Standard claims like name, email, picture are often added by Auth.js by default to the token
        // if they exist on the 'user' object passed to the JWT callback initially.
        // If you need to ensure they are always from your DB source:
        // token.name = userDetailsForToken.name;
        // token.email = userDetailsForToken.email;
        // token.picture = userDetailsForToken.image;
      }
      return token;
    },
    async session({ session, token }) {
      // token is our augmented JWT
      if (session.user) {
        session.user.id = token.userId as string; 
        session.user.profileId = token.profileId; // Types should align from JWT definition
        session.user.role = token.role;
        session.user.subscriptionStatus = token.subscriptionStatus;
        // emailVerified is usually part of session.user by default if present in token.sub or user object
      }
      return session;
    },
  },
  events: {
    async createUser(message) {
      // message.user here is typically AdapterUser
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
              userId: message.user.id, // userId is a string
              full_name: message.user.name, 
              // role: 'user', // Default role for new users, if desired
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