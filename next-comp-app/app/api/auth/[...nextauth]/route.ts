// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
// Import authOptions from your new utility file
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Adjust path if needed

// Initialize NextAuth with the imported options
const handler = NextAuth(authOptions);

// Export only the required handlers for App Router
export { handler as GET, handler as POST };

