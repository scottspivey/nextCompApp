// lib/auth.config.ts
import type { AuthConfig, User as NextAuthUserFromCore, Account, Profile as NextAuthProfile } from "@auth/core/types"; // Keep Account & Profile for callback signature
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "@auth/core/providers/credentials";
import prisma from "@/lib/prisma"; 
import bcrypt from 'bcryptjs';
// Import JWT type for token parameter in callbacks
import type { JWT } from "next-auth/jwt";
// Import Session and User types from next-auth (which are augmented by your next-auth.d.ts)
import type { Session } from "next-auth"; 

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
        console.log("Auth - Authorize function called."); 
        if (!credentials?.email || !credentials?.password) {
          console.error("Auth - Authorize: Missing credentials.");
          return null;
        }
        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;
        try {
          console.log(`Auth - Authorize: Attempting to find user with email: ${email}`);
          const userFromDb = await prisma.user.findUnique({ where: { email } }); 
          
          if (!userFromDb) {
            console.log(`Auth - Authorize: User not found for email: ${email}`);
            return null;
          }
          if (!userFromDb.password) {
            console.log(`Auth - Authorize: Password not set for user: ${email}`);
            return null;
          }

          const isValidPassword = bcrypt.compareSync(password, userFromDb.password);
          if (!isValidPassword) {
            console.log(`Auth - Authorize: Invalid password for user: ${email}`);
            return null;
          }
          
          console.log(`Auth - Authorize: Credentials valid for user: ${email}, ID: ${userFromDb.id}`);
          return { id: userFromDb.id, email: userFromDb.email, name: userFromDb.name };
        } catch (error) {
          console.error("Auth - Authorize: Error during authorization:", error);
          return null;
        }
      }
    }),
    // ... other providers
  ],
  callbacks: {
    // Parameters account, profile, trigger are part of the signature.
    // If not used in the logic, prefixing them in the destructuring (e.g., account: _account)
    // is the standard way to signal ESLint they are intentionally unused.
    async jwt({ token, user, account: _account, profile: _profile, trigger: _trigger }) { 
      console.log("Auth JWT Callback: Trigger is", _trigger); // Use the prefixed variable if logging
      console.log("Auth JWT Callback: Initial token received:", JSON.stringify(token, null, 2));
      console.log("Auth JWT Callback: User object received (from authorize/OAuth):", JSON.stringify(user, null, 2));
      // console.log("Auth JWT Callback: Account:", JSON.stringify(_account, null, 2));
      // console.log("Auth JWT Callback: Profile:", JSON.stringify(_profile, null, 2));

      if (user?.id) {
        token.userId = user.id; 
        console.log(`Auth JWT Callback: User ID ${user.id} present in user object. Setting token.userId.`);

        try {
          console.log(`Auth JWT Callback: Attempting to fetch profile for User ID: ${user.id}`);
          const userProfile = await prisma.profile.findUnique({
            where: { userId: user.id }, 
            select: { id: true }        
          });

          if (userProfile) {
            token.profileId = userProfile.id; 
            console.log(`Auth JWT Callback: Profile found for User ID ${user.id}. Profile ID set in token: ${userProfile.id}`);
          } else {
            console.warn(`Auth JWT Callback: Profile NOT FOUND for User ID: ${user.id}. Setting token.profileId to null.`);
            token.profileId = null; 
          }
        } catch (error) {
          console.error(`Auth JWT Callback: ERROR fetching profile for User ID ${user.id}:`, error);
          token.profileId = null;
        }
      } else if (_trigger === "update" && token?.userId) {
        console.log(`Auth JWT Callback: Trigger is 'update'. User ID from token: ${token.userId}. Re-validating profileId if necessary.`);
      } else {
         console.log("Auth JWT Callback: No user object with ID on this call (e.g., subsequent session reads, not initial sign-in). Token will be processed with existing values.");
      }
      
      console.log("Auth JWT Callback: Final token being returned:", JSON.stringify(token, null, 2));
      return token;
    },
    // Removed 'async' as there are no await operations in this function
    session({ session, token }: { session: Session; token: JWT; }) {
      console.log("Auth Session Callback: Token received from JWT callback:", JSON.stringify(token, null, 2));
      if (session.user) { 
        if (token?.userId) {
          // Removed unnecessary 'as string' assertion
          session.user.id = token.userId; 
        }
        if (token?.profileId !== undefined) { 
           session.user.profileId = token.profileId; 
        } else {
           session.user.profileId = null; 
        }
      }
      console.log("Auth Session Callback: Session object being returned:", JSON.stringify(session, null, 2));
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development", 
};
