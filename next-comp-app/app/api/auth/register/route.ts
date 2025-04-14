// app/api/auth/register/route.ts (or your actual signup route file)

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Your Prisma client instance
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types

// Define the same validation schema used on the frontend
const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  firmName: z.string().optional(),
  role: z.string().optional(),
});

export async function POST(req: Request) {
  console.log("REGISTER API HIT");
  try {
    const body = await req.json();
    console.log("REGISTER API BODY:", body);

    // 1. Validate input
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      console.log('Registration validation failed:', validation.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: 'Invalid input.', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.log("REGISTER API VALIDATION SUCCESS");

    const { email, name, password, firmName, role } = validation.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    console.log("REGISTER API EXISTING USER CHECK:", existingUser ? existingUser.email : 'None');

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 } // Conflict
      );
    }

    // 3. Hash the password
    console.log("REGISTER API HASHING PASSWORD...");
    const hashedPassword = bcrypt.hashSync(password, 10);
    console.log("REGISTER API PASSWORD HASHED");

    // 4. Create User and Profile in a transaction
    console.log("REGISTER API CREATING USER/PROFILE...");
    // Add explicit type for 'tx' parameter
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        },
      });
      console.log("REGISTER API USER CREATED:", createdUser.id);

      await tx.profile.create({
        data: {
          userId: createdUser.id,
          full_name: name,
          firm_name: firmName,
          role: role,
        }
      });
      console.log("REGISTER API PROFILE CREATED FOR:", createdUser.id);

      return createdUser;
    });
    console.log("REGISTER API TRANSACTION COMPLETE");

    console.log('User and profile created successfully:', newUser.email);

    // Manually create the object to return, excluding the password
    // This avoids the unused '_' variable from destructuring
    const userWithoutPassword = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.emailVerified, // Include other non-sensitive fields if needed
      image: newUser.image
    };

    console.log("REGISTER API RETURNING SUCCESS");
    return NextResponse.json(
      // Return the manually created object
      { user: userWithoutPassword, message: 'User created successfully' },
      { status: 201 } // Created
    );

  } catch (error) {
    console.error('REGISTER API ERROR:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}
