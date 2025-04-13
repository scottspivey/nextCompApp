// /app/api/auth/[...nextauth]/authOptions.ts

import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma'; // Assuming your client setup file is at lib/prisma.ts or src/lib/prisma.ts
import bcrypt from 'bcryptjs';

// Define and export your authentication options
export const authOptions: AuthOptions = {
  // Configure the Prisma adapter
  adapter: PrismaAdapter(prisma), // Use 'as any' or 'as Adapter'

  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jsmith@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          // 1. Find user by email (ensure User model exists in schema.prisma)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // 2. Check if user exists and has a password stored
          if (!user || !user.password) {
             console.log('User not found or password not set for email:', credentials.email);
             return null;
          }

          // 3. Compare provided password with the stored hash using bcryptjs
          const isValid = bcrypt.compareSync(credentials.password, user.password);

          if (isValid) {
            console.log('Password valid for user:', credentials.email);
            // Return essential, non-sensitive user info matching the User type
            return { id: user.id, email: user.email, name: user.name };
          } else {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null;
        }
      },
    }),
    // ...add more providers here
  ],

  // Use database sessions
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // Secret for signing cookies
  secret: process.env.NEXTAUTH_SECRET,

  // Optional: Add custom pages
  // pages: { ... },

  // Optional: Add callbacks
  callbacks: {
    // The type augmentation in `types/next-auth.d.ts` should ensure 'user' has the 'id'
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // Add the user ID from the DB User object
        // Add other properties like role if defined in your types and user model
        // session.user.role = user.role;
      }
      return session;
    },
    // Add other callbacks like jwt, signIn, redirect if needed
  },

  // Optional: Enable debug messages
  debug: process.env.NODE_ENV === 'development',
};
