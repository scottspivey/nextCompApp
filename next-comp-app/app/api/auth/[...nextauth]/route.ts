// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from 'prisma'; // Adjust path as needed
import bcrypt from 'bcryptjs'; // Import bcryptjs

// Define your authentication options
export const authOptions: AuthOptions = {
  // Configure the Prisma adapter
  adapter: PrismaAdapter(prisma),

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
          // 1. Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // 2. Check if user exists and has a password stored
          if (!user || !user.password) {
             // Log appropriately: user not found or password not set
             console.log('User not found or password not set for email:', credentials.email);
             return null; // Authentication failure
          }

          // 3. Compare provided password with the stored hash using bcryptjs
          const isValid = bcrypt.compareSync(credentials.password, user.password);

          if (isValid) {
            // Passwords match - return user object (excluding password)
            console.log('Password valid for user:', credentials.email);
            // Return essential, non-sensitive user info
            return { id: user.id, email: user.email, name: user.name }; // Add role or other fields if needed
          } else {
            // Passwords do not match
            console.log('Invalid password for user:', credentials.email);
            return null; // Authentication failure
          }
        } catch (error) {
          console.error('Error during authorization:', error);
          return null; // Indicate failure due to error
        }
      },
    }),
    // ...add more providers here (e.g., Google, GitHub) if needed in Step 4
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
    async session({ session, user }) {
      // Add user ID from DB user object to the session object
      if (session.user && user) {
        session.user.id = user.id;
        // Add other fields like role if needed and available on the 'user' object
        // session.user.role = user.role;
      }
      return session;
    },
    // Add other callbacks like jwt, signIn, redirect if needed
  },

  // Optional: Enable debug messages
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

