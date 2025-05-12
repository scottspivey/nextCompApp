// app/api/auth/[...nextauth]/auth.ts

import type { AuthConfig } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "@auth/core/providers/credentials";
import prisma from "@/lib/prisma"; 
import bcrypt from 'bcryptjs';

export const authConfig: AuthConfig = {
  // Use Prisma adapter
  adapter: PrismaAdapter(prisma),

  // Use database sessions
  session: { strategy: "database" },

  // Configure providers
  providers: [
    Credentials({
      // You can omit the `credentials` block if you build your own login form
      async authorize(credentials) {
        // Basic validation
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth - Missing credentials");
          return null;
        }
        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // Find user
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            console.log("Auth - User not found or password not set:", email);
            return null; // User not found or no password set
          }

          // Check password
          const isValid = bcrypt.compareSync(password, user.password);

          if (!isValid) {
            console.log("Auth - Invalid password for user:", email);
            return null; // Invalid password
          }

          console.log("Auth - Credentials valid for user:", email);
          // Return user object (must match User type expected by Auth.js)
          return { id: user.id, email: user.email, name: user.name };

        } catch (error) {
          console.error("Auth - Error during authorization:", error);
          return null; // Error occurred
        }
      }
    }),
    // Add other providers like Google, GitHub here if needed
    // Example: Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })
  ],

  // Add callbacks if needed (syntax differs slightly from v4)
  callbacks: {
    // Add user ID to session
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    // Add other callbacks like jwt, authorized, signIn, redirect if needed
  },

  // Add custom pages if needed
  // pages: {
  //   signIn: "/login", // Example: Redirect users to /login page
  //   // error: '/auth/error',
  // },

  // Debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret (should read from AUTH_SECRET env var automatically, but can specify)
  // secret: process.env.AUTH_SECRET,
};

