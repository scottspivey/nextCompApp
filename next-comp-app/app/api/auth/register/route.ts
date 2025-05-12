// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, firmName, role } = body;

    // 1. Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields: email, password, and name are required.' }, { status: 400 });
    }

    if (password.length < 6) { // Example: Enforce minimum password length
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Store and check emails in lowercase for consistency
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }

    // 3. Hash the password
    const saltRounds = 10; // Recommended salt rounds for bcrypt
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // 4. Create the new user and their profile in a transaction
    // This ensures that if profile creation fails, user creation is also rolled back.
    const newUserWithProfile = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword, // Store the hashed password
          name: name,
          // emailVerified: new Date() // Optional: if you want to auto-verify or handle verification separately
        },
      });

      // Create an associated profile
      // The profileId will be auto-generated (UUID)
      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id, // Link to the newly created user
          full_name: name,
          firm_name: firmName || null, // Handle optional fields
          role: role || null,          // Handle optional fields
        },
      });

      return { ...newUser, profile: newProfile }; // Return user with profile info
    });

    console.log('User registered successfully:', newUserWithProfile.email);

    // Don't send back the password hash in the response
    const { password: _, ...userResponse } = newUserWithProfile;


    return NextResponse.json({
        message: 'User registered successfully!',
        user: {
            id: userResponse.id,
            email: userResponse.email,
            name: userResponse.name,
            profileId: userResponse.profile.id
        }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during registration.';
    return NextResponse.json({ error: 'Failed to register user.', details: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
