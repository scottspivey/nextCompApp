// app/Components/providers/NextAuthProvider.tsx
"use client"; // This component must be a Client Component

import { SessionProvider } from "next-auth/react";
import React from "react";

interface NextAuthProviderProps {
  children: React.ReactNode;
  // You can pass the session object here if you're fetching it server-side
  // and want to initialize the provider with it, though often not needed
  // for basic client-side session management with useSession.
  // session?: Session | null;
}

export default function NextAuthProvider({ children }: NextAuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
