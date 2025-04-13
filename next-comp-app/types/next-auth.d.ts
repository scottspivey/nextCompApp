// types/next-auth.d.ts

import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// Extend the built-in session types
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id from the database. */
      id: string;
      // Add any other properties you want to expose to the client session here
      // role?: string;
    } & DefaultSession['user']; // Keep the default properties like name, email, image
  }

  /**
   * The shape of the user object returned in the OAuth provider callback,
   * or the second parameter of the `session` callback, when using a database.
   */
 // interface User extends DefaultUser {
    // Add any custom properties from your User model in the database here
    // role?: string;
  //}
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string;
    // Add any other properties you want to persist in the JWT
    id?: string;
    // role?: string;
  }
}

