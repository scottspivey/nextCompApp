// app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/auth"; // Adjust path to your root auth.ts
export const { GET, POST } = handlers;