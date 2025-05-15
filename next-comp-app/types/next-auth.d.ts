// types/next-auth.d.ts

import type { User as CoreNextAuthUser, Session as CoreNextAuthSession } from 'next-auth';
import type { JWT as CoreJWT } from '@auth/core/jwt';

// 1. Define and EXPORT our comprehensive AppUser interface.
// This extends NextAuth's base User and adds all our custom fields.
export interface AppUser extends CoreNextAuthUser { 
  emailVerified?: Date | null;        // Standard field, ensure it's here
  profileId?: string | null;          // Your custom field
  role?: string | null;               // Your custom field
  subscriptionStatus?: string | null; // Your custom field
}

// 2. Augment NextAuth's Session type.
declare module 'next-auth' {
  /**
   * The `user` property within Session will now be our AppUser.
   */
  interface Session extends CoreNextAuthSession {
    user: AppUser; // Use our exported AppUser interface
    error?: string; // Optional: for passing custom error messages
  }

  // Optional: If you find that NextAuthUser used in callbacks isn't picking up AppUser fields,
  // you could also try augmenting the 'next-auth' User type directly, though this can sometimes
  // conflict if not done carefully. The primary approach is using your exported AppUser explicitly.
  // interface User extends AppUser {} 
}

// 3. Augment @auth/core/jwt's JWT type.
declare module '@auth/core/jwt' {
  /**
   * The JWT interface is augmented to include your custom claims.
   */
  interface JWT extends CoreJWT {
    // Standard claims that might be on the token:
    // name?: string | null;
    // email?: string | null;
    // picture?: string | null;
    // sub?: string; // Subject (usually user ID) is part of CoreJWT

    // Custom claims:
    userId: string; // Ensure this is always present (maps to user.id)
    profileId?: string | null;
    role?: string | null;
    subscriptionStatus?: string | null;
    emailVerified?: Date | null; // If you want to pass this via JWT

    error?: string; // Optional: for custom error states in token
  }
}

