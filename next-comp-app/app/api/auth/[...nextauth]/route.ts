// app/api/auth/[...nextauth]/route.ts

// Import handlers from central auth.ts file
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;