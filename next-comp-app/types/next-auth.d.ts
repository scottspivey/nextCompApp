// types/next-auth.d.ts

import type { User as CoreNextAuthUser, Session as CoreNextAuthSession } from 'next-auth';
import type { JWT as CoreJWT } from '@auth/core/jwt';

// 1. Define and EXPORT our comprehensive AppUser interface.
// This includes fields from NextAuth's base User (id, name, email, image)
// and our explicitly added fields.
export interface AppUser extends CoreNextAuthUser { 
  emailVerified?: Date | null;        // Explicitly add emailVerified
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
    error?: string;
  }
  // We do NOT augment 'next-auth''s User type directly here,
  // as we are using our own AppUser type explicitly in auth.ts where needed.
  // However, if 'next-auth' User type is used by Auth.js internally for parameters,
  // and it's not picking up AppUser structure, that's where issues arise.
  // Let's try augmenting it as well to cover all bases.
  interface User extends AppUser {}
}

// 3. Augment @auth/core/jwt's JWT type.
declare module '@auth/core/jwt' {
  interface JWT extends CoreJWT {
    userId: string; // Ensure this is present and matches what's expected.
    profileId?: string | null;
    role?: string | null;
    subscriptionStatus?: string | null;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    error?: string;
  }
}