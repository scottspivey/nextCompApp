// lib/auth.config.ts
import type { AuthConfig, User as NextAuthUserFromCore } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "@auth/core/providers/credentials";
import prisma from "@/lib/prisma"; 
import bcrypt from 'bcryptjs';
// Import JWT type for token parameter in callbacks
import type { JWT } from "next-auth/jwt";
// Import Session and User types from next-auth (which are augmented by your next-auth.d.ts)
import type { Session } from "next-auth"; 
// The 'User' type from 'next-auth' (augmented) is generally used for the session.user object.
// For the 'user' parameter in callbacks that comes from the provider/adapter, NextAuthUserFromCore or AdapterUser is more appropriate.

interface AuthorizeUser extends NextAuthUserFromCore {
  id: string;
  email: string | null;
  name: string | null;
}

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth - Missing credentials in authorize");
          return null;
        }
        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;
        try {
          const userFromDb = await prisma.user.findUnique({ where: { email } }); // Renamed to avoid conflict
          if (!userFromDb || !userFromDb.password) {
            console.log("Auth - User not found or password not set for email:", email);
            return null;
          }
          const isValidPassword = bcrypt.compareSync(password, userFromDb.password);
          if (!isValidPassword) {
            console.log("Auth - Invalid password for user:", email);
            return null;
          }
          return { id: userFromDb.id, email: userFromDb.email, name: userFromDb.name };
        } catch (error) {
          console.error("Auth - Error during authorization:", error);
          return null;
        }
      }
    }),
    // ... other providers
  ],
  callbacks: {
    // Prefix unused parameters with an underscore to satisfy ESLint
    async jwt({ token, user, account: _account, profile: _profile, trigger: _trigger }) { 
      if (user?.id) {
        token.userId = user.id; // This is User.id from the database

        try {
          const userProfile = await prisma.profile.findUnique({
            where: { userId: user.id }, 
            select: { id: true }        
          });
          if (userProfile) {
            token.profileId = userProfile.id; 
          } else {
            console.warn(`Auth - Profile not found for user ID: ${user.id}`);
            token.profileId = null; 
          }
        } catch (error) {
          console.error(`Auth - Error fetching profile for user ID: ${user.id}`, error);
          token.profileId = null;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT; /* user: User; // user param here is from adapter if not JWT strategy */ }) {
      // Ensure session.user exists before assigning to its properties
      if (session.user) { 
        if (token?.userId) {
          session.user.id = token.userId; // User.id from token (originally from db User.id)
        }
        // Assign profileId if it exists on the token (it can be string or null)
        if (token?.profileId !== undefined) { 
           session.user.profileId = token.profileId; // This should now be fine due to next-auth.d.ts
        } else {
           session.user.profileId = null; // Explicitly set to null if not on token
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
