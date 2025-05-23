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
// Ensure your AppUser and AugmentedJWT types align with the fields you're using.
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
    }),
    MicrosoftEntraIDProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
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
            profile: true,       // To get profileId and role
            subscriptions: true  // To get subscriptionStatus
          }
        });

        if (!userFromDb) {
          throw new UserNotFoundError("No user found with that email.");
        }

        if (!userFromDb.password) {
          throw new MissingPasswordError("This account does not have a password set. Try an alternative sign-in method.");
        }

        const isValidPassword = await bcrypt.compare(password, userFromDb.password);
        if (!isValidPassword) {
          throw new InvalidCredentialsError("Incorrect password.");
        }
        
        // Construct and return the AppUser object
        // Ensure your AppUser type definition includes all these fields.
        const authorizedUser: AppUser = {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name, // This is NextAuthUser.name
          image: userFromDb.image,
          emailVerified: userFromDb.emailVerified,
          // Custom fields from AppUser definition
          profileId: userFromDb.profile?.id,
          // Assuming 'role' is on Profile model and part of AppUser
          role: userFromDb.profile?.role as AppUser['role'], 
          // Assuming 'subscriptionStatus' is on Subscription model and part of AppUser
          subscriptionStatus: userFromDb.subscriptions?.status as AppUser['subscriptionStatus'], 
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

    async jwt({ token, user, account, profile, trigger, isNewUser }) {
      const augmentedToken = token as AugmentedJWT; 

      if (user) { 
        let userDetailsToPopulateToken: AppUser;

        // For OAuth, user.id is reliable. Fetch from DB to get all AppUser fields.
        // For credentials, 'user' is already the AppUser from authorize.
        if (account || (trigger === "signUp" && user.id)) { // OAuth or initial sign-up
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id! }, // user.id should be present
            include: { profile: true, subscriptions: true },
          });

          if (!dbUser) {
            console.error(`JWT: User with ID ${user.id} not found in database.`);
            return augmentedToken; 
          }
          
          userDetailsToPopulateToken = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            emailVerified: dbUser.emailVerified,
            profileId: dbUser.profile?.id,
            role: dbUser.profile?.role as AppUser['role'],
            subscriptionStatus: dbUser.subscriptions?.status as AppUser['subscriptionStatus'],
          };
        } else if (!account && user) { // Credentials sign-in (user is already AppUser)
           userDetailsToPopulateToken = user as AppUser;
        } else {
            // Should not happen if user object is always present on initial sign-in
            return augmentedToken;
        }
        
        // Ensure critical IDs are present
        if (typeof userDetailsToPopulateToken.id !== 'string' || userDetailsToPopulateToken.id.trim() === '') {
          console.error('CRITICAL: User ID is missing or invalid; cannot create JWT from user:', userDetailsToPopulateToken);
          throw new Error('User ID is missing or invalid for JWT.');
        }
        if (userDetailsToPopulateToken.profileId && (typeof userDetailsToPopulateToken.profileId !== 'string' || userDetailsToPopulateToken.profileId.trim() === '')) {
            console.warn('WARN: profileId is present but invalid for JWT from user:', userDetailsToPopulateToken);
            // Decide if this is critical enough to throw an error or just proceed without it
        }


        augmentedToken.userId = userDetailsToPopulateToken.id;
        augmentedToken.profileId = userDetailsToPopulateToken.profileId;
        augmentedToken.role = userDetailsToPopulateToken.role;
        augmentedToken.subscriptionStatus = userDetailsToPopulateToken.subscriptionStatus;
        augmentedToken.emailVerified = userDetailsToPopulateToken.emailVerified;
        
        augmentedToken.name = userDetailsToPopulateToken.name;
        augmentedToken.email = userDetailsToPopulateToken.email;
        augmentedToken.picture = userDetailsToPopulateToken.image;
      }
      return augmentedToken;
    },

    async session({ session, token }) {
      const augmentedToken = token as AugmentedJWT;
      if (augmentedToken && session.user) {
        // Ensure session.user is treated as AppUser for assignment
        const sUser = session.user as AppUser; 
        
        sUser.id = augmentedToken.userId!; // userId in token should always be defined
        sUser.profileId = augmentedToken.profileId;
        sUser.role = augmentedToken.role;
        sUser.subscriptionStatus = augmentedToken.subscriptionStatus;
        sUser.emailVerified = augmentedToken.emailVerified;
        // Standard fields also populated from token if needed
        sUser.name = augmentedToken.name;
        sUser.email = augmentedToken.email;
        sUser.image = augmentedToken.picture;
      }
      return session;
    },
  },
  events: {
    async createUser(message) {
      const userId = message.user.id;
      const userName = message.user.name; // This is typically the full name

      if (!userId) {
        console.error("createUser event: User ID is undefined. Cannot create profile.");
        return;
      }

      // Split userName into firstName and lastName
      // This is a simple split; consider more robust parsing for complex names.
      let firstName = userName || '';
      let lastName = '';
      if (userName) {
        const nameParts = userName.split(' ');
        firstName = nameParts[0];
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ');
        }
      }


      try {
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: userId },
        });

        if (!existingProfile) {
          // Use firstName and lastName instead of full_name
          // Ensure your Profile model in schema.prisma has firstName and lastName fields.
          await prisma.profile.create({
            data: {
              userId: userId,
              firstName: firstName, 
              lastName: lastName,
              // role: 'USER', // Example: Set a default role if your Profile model has 'role'
            },
          });
          // console.log(`Profile created for new user: ${userId} with name ${firstName} ${lastName}`);
        }
      } catch (error) {
        console.error(`Error creating profile for user ${userId} in createUser event:`, error);
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
