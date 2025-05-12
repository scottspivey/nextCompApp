// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma for TransactionClient type
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, firmName, role } = body;

    console.log("[REGISTER API] Received request body:", { name, email: email ? 'Email_Present' : 'Email_Missing', password: password ? 'Password_Present' : 'Password_Missing', firmName, role }); // Log received data (mask password in real prod logs)

    // 1. Validate input
    if (!email || !password || !name) {
      console.error("[REGISTER API] Validation Error: Missing required fields.");
      return NextResponse.json({ error: 'Missing required fields: email, password, and name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
        console.error("[REGISTER API] Validation Error: Password too short.");
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    console.log("[REGISTER API] Normalized email for lookup:", normalizedEmail);

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log("[REGISTER API] User already exists:", existingUser.email);
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    } else {
      console.log("[REGISTER API] No existing user found for email:", normalizedEmail);
    }

    // 3. Hash the password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    console.log("[REGISTER API] Password hashed successfully.");

    // 4. Create the new user and their profile in a transaction
    console.log("[REGISTER API] Attempting to create user and profile in transaction...");
    const newUserWithProfile = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail, // Store the normalized (lowercase) email
          password: hashedPassword,
          name: name,
        },
      });
      console.log("[REGISTER API] User created in transaction:", newUser.id);

      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          full_name: name,
          firm_name: firmName || null,
          role: role || null,
        },
      });
      console.log("[REGISTER API] Profile created in transaction:", newProfile.id);

      return { ...newUser, profile: newProfile };
    });

    console.log('[REGISTER API] User registered successfully:', newUserWithProfile.email);

    const { password: _, ...userForResponse } = newUserWithProfile;

    return NextResponse.json({
        message: 'User registered successfully!',
        user: {
            id: userForResponse.id,
            email: userForResponse.email,
            name: userForResponse.name,
            profileId: userForResponse.profile.id,
            profileRole: userForResponse.profile.role,
            profileFirmName: userForResponse.profile.firm_name
        }
    }, { status: 201 });

  } catch (error) {
    console.error('[REGISTER API] Overall Registration error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during registration.';
    return NextResponse.json({ error: 'Failed to register user.', details: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
