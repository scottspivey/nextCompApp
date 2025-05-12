// lib/auth.ts
// This is the central file for your NextAuth.js setup.
// It initializes NextAuth with your configuration and exports common utilities.

import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // Import your AuthConfig

// Initialize NextAuth.js with your configuration
// This exports handlers (GET, POST), auth (for session management), signIn, and signOut.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// You can also export authConfig itself if needed elsewhere, though it's less common.
// export { authConfig };
