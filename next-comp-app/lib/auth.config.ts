// lib/auth.config.ts
// This file holds your NextAuth.js configuration object.

import type { AuthConfig, User as NextAuthUser } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "@auth/core/providers/credentials";
import prisma from "@/lib/prisma"; // Make sure this path correctly points to your shared Prisma client instance
import bcrypt from 'bcryptjs';

// Define the structure of the user object returned by the authorize function
// This should include any properties you want to be available on the `user` object in callbacks
interface AuthorizeUser extends NextAuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Credentials({
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth - Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            console.log("Auth - User not found or password not set for email:", email);
            return null;
          }

          const isValidPassword = bcrypt.compareSync(password, user.password);

          if (!isValidPassword) {
            console.log("Auth - Invalid password for user:", email);
            return null;
          }

          console.log("Auth - Credentials valid for user:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            // image: user.image // If you have an image field and want to include it
          };

        } catch (error) {
          console.error("Auth - Error during authorization:", error);
          return null;
        }
      }
    }),
    // Add other providers like Google, GitHub here if needed
    // Example:
    // import Google from "@auth/core/providers/google";
    // Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id; // Add user ID to the session object
        // session.user.role = user.role; // Example: if your User model has a role
      }
      return session;
    },
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.id = user.id;
    //     // token.role = user.role; // Example
    //   }
    //   return token;
    // },
  },
  pages: {
    signIn: "/login", // Example: if you have a custom login page at /login
    // error: '/auth/error', // Custom error page
  },
  debug: process.env.NODE_ENV === "development",
  // secret: process.env.AUTH_SECRET, // Automatically read from AUTH_SECRET env var
};
