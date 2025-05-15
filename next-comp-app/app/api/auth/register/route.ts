// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const { email, password, name, /* other user fields if any */ 
            // Profile specific fields if provided at registration
            full_name, firm_name, phone_number, role: profileRole 
          } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields: email, password, and name are required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name, // This is User.name
          password: hashedPassword,
          // emailVerified: null, // Set if you have an email verification flow
        },
      });

      // Create a profile linked to the new user
      // Use provided profile fields or defaults
      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          full_name: full_name || name, // Default to user.name if full_name not provided
          firm_name: firm_name,
          phone_number: phone_number,
          role: profileRole || 'user', // Default role for Profile
        },
      });

      // Exclude password from the returned user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      return { user: userWithoutPassword, profile: newProfile };
    });


    return NextResponse.json({ 
      message: 'User and profile created successfully.', 
      user: result.user,
      profileId: result.profile.id // Send back the new profileId
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('email')) { // Check if it's the email field on User
          return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
        }
        // Could also be a unique constraint on Profile.userId if something went wrong,
        // though the transaction should handle it.
        return NextResponse.json({ message: 'A unique constraint was violated during registration.' }, { status: 409 });
      }
    }
    console.error('Registration error:', error); 
    return NextResponse.json({ message: 'An unexpected error occurred during registration. Please try again.' }, { status: 500 });
  }
}
