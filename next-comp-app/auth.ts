// In next-comp-app/auth.ts

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma'; // Adjust path if your prisma client is elsewhere

// Import base types from next-auth and related packages
import type { NextAuthConfig, Account, Session as NextAuthSession, User as NextAuthUser } from "next-auth"; 
import type { JWT } from "@auth/core/jwt"; // Correct import for JWT
import type { AdapterUser } from "@auth/core/adapters";

// Import your custom AppUser type (defined in types/next-auth.d.ts)
import type { JWT as AugmentedJWT } from "@auth/core/jwt";
import type { AppUser } from "@/types/next-auth"; // Adjust path as necessary

// --- Custom Error Classes (Define these once) ---
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
  constructor(message = "This account was created using an OAuth provider. Please sign in with the original method.") {
    super(message);
    this.name = "MissingPasswordError";
  }
}
// --- End Custom Error Classes ---

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // The adapter handles user creation. Profile creation is handled in events.
    }),
    MicrosoftEntraIDProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!, // Ensure this is set for Entra ID
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials.password) {
          throw new InvalidCredentialsError("Missing email or password.");
        }
        const email = credentials.email as string;
        const password = credentials.password as string;

        const userFromDb = await prisma.user.findUnique({
          where: { email: email },
          include: { 
            profile: true,      // To get profileId and role
            subscriptions: true // To get subscriptionStatus
          }
        });

        if (!userFromDb) {
          throw new UserNotFoundError("No user found with that email.");
        }

        if (!userFromDb.password) {
          // User exists but has no password (e.g., signed up via OAuth)
          throw new MissingPasswordError("This account does not have a password set. Try an alternative sign-in method.");
        }

        const isValidPassword = await bcrypt.compare(password, userFromDb.password);
        if (!isValidPassword) {
          throw new InvalidCredentialsError("Incorrect password.");
        }
        
        // Construct and return the AppUser object
        const authorizedUser: AppUser = {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name,
          image: userFromDb.image,
          emailVerified: userFromDb.emailVerified, // From your AppUser definition
          // Custom fields from AppUser definition
          profileId: userFromDb.profile?.id,
          role: userFromDb.profile?.role,
          subscriptionStatus: userFromDb.subscriptions?.status,
        };
        return authorizedUser;
      }
    })
  ],
  session: {
    strategy: 'jwt', // Using JWTs for session management
  },
  callbacks: {
    // The signIn callback can be used for access control or to link accounts.
    // Profile creation for OAuth is better handled in the 'events.createUser' callback.
    async signIn({ user, account, profile }) {
      // console.log("signIn callback", { user, account, profile });
      return true; // Allow sign-in
    },

    // The jwt callback is called when a JWT is created or updated.
    // `user` is only passed on initial sign-in.
    // `token` is the existing token (if any).
    // `account` is provider details (only on initial OAuth sign-in).
    async jwt({ token, user, account, profile, trigger, isNewUser }) {
        // `user` here can be NextAuthUser (from next-auth) or AdapterUser.
        // We need to ensure we are working with our AppUser structure for the token.
        const augmentedToken = token as AugmentedJWT; // Cast to our augmented JWT type
      if (user) { // This block is primarily for initial sign-in
        let userDetailsToPopulateToken: AppUser;

        if (account) { // OAuth sign-in (Google, Microsoft)
          // The `user` object from an OAuth provider might be basic.
          // Fetch the full user details from your database to ensure all custom fields are included.
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { profile: true, subscriptions: true },
          });

          if (!dbUser) {
            // This should ideally not happen if the adapter and events.createUser are working.
            console.error(`JWT: User with ID ${user.id} not found in database during OAuth.`);
            return augmentedToken; // Return original token to avoid errors
          }
          
          userDetailsToPopulateToken = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            emailVerified: dbUser.emailVerified,
            profileId: dbUser.profile?.id,
            role: dbUser.profile?.role,
            subscriptionStatus: dbUser.subscriptions?.status,
          };

        } else { // Credentials sign-in
          // `user` comes from the `authorize` function, which returns `AppUser`.
          userDetailsToPopulateToken = user as AppUser;
        }

        const currentUserId = userDetailsToPopulateToken.id;
       
        if (typeof currentUserId !== 'string' || currentUserId.trim() === '') {
          // This is a critical issue if user.id is not a valid string.
          // Log the error and throw an exception to prevent an invalid token.
          console.error('CRITICAL: User ID from userDetailsToPopulateToken is not a valid string:', currentUserId);
          throw new Error('User ID is missing or invalid; cannot create JWT.');
        }
        augmentedToken.userId = currentUserId;
        augmentedToken.profileId = userDetailsToPopulateToken.profileId;
        augmentedToken.role = userDetailsToPopulateToken.role;
        augmentedToken.subscriptionStatus = userDetailsToPopulateToken.subscriptionStatus;
        augmentedToken.emailVerified = userDetailsToPopulateToken.emailVerified; // Add if needed on JWT

        // Also ensure standard claims are present if needed, Auth.js usually handles these
        // but being explicit can be good.
        augmentedToken.name = userDetailsToPopulateToken.name;
        augmentedToken.email = userDetailsToPopulateToken.email;
        augmentedToken.picture = userDetailsToPopulateToken.image;
      }
      return augmentedToken;
    },

    // The session callback is called when a session is checked.
    // `token` is the JWT from the `jwt` callback.
    // `session` is the session object.
    async session({ session, token }) {
      // `session.user` should be our augmented AppUser type due to types/next-auth.d.ts
      // `token` is our augmented JWT type.
      const augmentedToken = token as AugmentedJWT;
      if (augmentedToken && session.user) {
        session.user.id = augmentedToken.userId; // id is standard on User, but ensure it's from our userId claim
        
        // Assign custom properties from token to session.user
        // TypeScript should recognize these properties on session.user due to augmentation.
        const sUser = session.user as AppUser;
        sUser.profileId = augmentedToken.profileId;
        sUser.role = augmentedToken.role;
        sUser.subscriptionStatus = augmentedToken.subscriptionStatus;
        sUser.emailVerified = augmentedToken.emailVerified;
      }
      return session;
    },
  },
  events: {
    // This event is triggered after a user is created by the adapter (e.g., first OAuth sign-in).
    // It's a reliable place to create related records like the Profile.
    async createUser(message) {
      const userId = message.user.id;
      const userName = message.user.name;

      if (!userId) {
        console.error("createUser event: User ID is undefined. Cannot create profile.");
        return;
      }

      try {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: userId },
        });

        if (!existingProfile) {
          await prisma.profile.create({
            data: {
              userId: userId,
              full_name: userName, // Populate from user data
              // role: 'user', // Set a default role if desired
            },
          });
          // console.log(`Profile created for new user: ${userId}`);
        }
      } catch (error) {
        console.error(`Error creating profile for user ${userId} in createUser event:`, error);
      }
    },
  },
  pages: {
    signIn: '/login', // Your custom login page
    error: '/login',  // Redirect to login page on error (error codes in query params)
    // verifyRequest: '/auth/verify-request', // For email magic links
    // newUser: '/auth/new-user' // Redirect new users here (if not using events.createUser for setup)
  },
  // secret: process.env.NEXTAUTH_SECRET, // In v5, NEXTAUTH_SECRET env var is automatically used.
  // trustHost: true, // Set if deploying to environments where NEXTAUTH_URL might be misconfigured.
  debug: process.env.NODE_ENV === 'development', // Enable more logs in development
} satisfies NextAuthConfig; // Use "satisfies" for strong type checking against NextAuthConfig

// Export handlers and helper functions
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
