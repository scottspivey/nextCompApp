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
  // Corrected: When using Credentials provider, JWT strategy is typically required for session management.
  // The adapter will still handle user/account persistence.
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth - Missing credentials in authorize");
          return null;
        }

        const email = (credentials.email as string).toLowerCase(); // Normalize email
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email }, // Query with lowercase email
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
    // The JWT callback is called when a JWT is created (signing in) or updated (session accessed).
    // It's crucial when using the "jwt" session strategy.
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, the `user` object (from the `authorize` function or OAuth profile) is available.
      if (user?.id) {
        token.id = user.id; // Persist the user ID in the JWT token
        // You can add other custom claims to the token here if needed
        // For example, if your 'user' object from 'authorize' or OAuth had a 'role':
        // if (user.role) { token.role = user.role; }
      }
      // If you are using OAuth providers and want to link accounts or save specific OAuth data,
      // the `account` and `profile` objects are available here during the initial sign-in.
      return token;
    },
    // The `session` callback is called whenever a session is checked.
    // It allows you to customize the session object returned to the client.
    // The `token` parameter here is the JWT token from the `jwt` callback.
    async session({ session, token /* user */ }) {
      // Add the user ID (and other custom claims from the token) to the session object.
      // This makes it available on the client-side via `useSession()` or `getSession()`.
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      // if (session.user && token?.role) {
      //   session.user.role = token.role as string; // Example: exposing role to session
      // }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // error: '/auth/error',
  },
  debug: process.env.NODE_ENV === "development",
  // secret: process.env.AUTH_SECRET, // Automatically read from AUTH_SECRET env var
};
