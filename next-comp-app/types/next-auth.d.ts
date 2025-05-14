// types/next-auth.d.ts

import { DefaultUser } from 'next-auth'; // DefaultSession removed
import { DefaultJWT } from 'next-auth/jwt';

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string;
    // 'id' here typically refers to the User.id from your database,
    // which you are already adding in your auth.config.ts jwt callback.
    // For clarity, let's rename it to userId to match what we set in the token.
    userId?: string; 
    // Add profileId to the JWT
    profileId?: string | null; 
    // role?: string; // Keep if you use it
  }
}

// Extend the built-in session types
declare module 'next-auth' {
  /**
   * The shape of the user object available on the client session.
   * This type is used for session.user.
   */
  interface User extends DefaultUser {
    // DefaultUser already includes: id, name, email, image.
    // 'id' on DefaultUser corresponds to the User.id from your database.
    
    // Add profileId to the User object within the session
    profileId?: string | null; 
    // role?: string; // Keep if you use it
  }

  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    // Use the augmented User type for session.user
    // This makes session.user have id, name, email, image (from DefaultUser) 
    // AND your custom profileId.
    user?: User; // Making user optional to align with DefaultSession more closely
  }
}
