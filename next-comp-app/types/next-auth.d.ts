// types/next-auth.d.ts
import type { DefaultSession, User as CoreUser } from "@auth/core/types"; // Using CoreUser as alias for base
import type { JWT as DefaultJWT } from "@auth/core/jwt";

// These are the custom fields you want to add.
interface CustomAuthUserFields {
  profileId?: string | null;
  role?: string | null;
  subscriptionStatus?: string | null;
}

declare module "@auth/core/types" {
  /**
   * The `user` object shape available in the session.
   * Augmenting DefaultSession["user"] which includes id, name, email, image.
   */
  interface Session {
    user: {
      profileId?: string | null;
      role?: string | null;
      subscriptionStatus?: string | null;
    } & DefaultSession["user"]; 
    error?: string;
  }

  /**
   * Augmenting the User type.
   * CoreUser includes: id: string; name?: string | null; email?: string | null; image?: string | null;
   * We explicitly add emailVerified and our custom fields.
   * This augmented User type is what `authorize` should return, and what the `jwt` callback
   * should use for its fully resolved user object.
   */
  interface User extends CoreUser, CustomAuthUserFields {
    emailVerified?: Date | null; // Explicitly add emailVerified
  }
}

declare module "@auth/core/jwt" {
  /** Augmenting the JWT type */
  interface JWT extends DefaultJWT {
    userId: string; // User.id (same as token.sub)
    profileId?: string | null;
    role?: string | null;
    subscriptionStatus?: string | null;
    error?: string;
  }
}