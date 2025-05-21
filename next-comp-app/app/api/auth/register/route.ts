// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma, Role, } from '@prisma/client'; // Import User and Profile for return types

// Define an interface for the expected request body
interface RegisterBody {
  email: string;
  password: string;
  name: string; // For User.name (display name)
  firstName: string; // For Profile.firstName
  lastName: string;  // For Profile.lastName
  firm_name?: string; // Optional
  phone_number?: string; // Optional
  role?: Role; // Optional, assuming Role is an enum like 'USER' | 'ADMIN'
}

export async function POST(request: Request) {
  try {
    // Explicitly type the data from request.json()
    const { 
      email, 
      password, 
      name,
      firstName,
      lastName,
      firm_name, 
      phone_number, 
      role: profileRole 
    } = await request.json() as RegisterBody;

    // Validate required fields
    if (!email || !password || !name || !firstName || !lastName) {
      return NextResponse.json({ message: 'Missing required fields: email, password, name, firstName, and lastName are required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: name, 
          password: hashedPassword,
        },
      });

      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName: firstName,
          lastName: lastName,
          firm_name: firm_name, // Will be undefined if not provided, which is fine for optional fields
          phone_number: phone_number, // Will be undefined if not provided
          role: profileRole || Role.USER, // Default to Role.USER if not provided or is undefined
        },
      });

      // Exclude password from the returned user object
      const { password: _, ...userWithoutPassword } = newUser;
      
      return { user: userWithoutPassword, profile: newProfile };
    });

    return NextResponse.json({ 
      message: 'User and profile created successfully.', 
      user: result.user, // result.user is now typed (User without password)
      profileId: result.profile.id // result.profile is now typed (Profile)
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the unique constraint violation code
      if (error.code === 'P2002') {
        // The `target` field in `error.meta` can indicate which field caused the error.
        // It's good practice to ensure `error.meta` and `error.meta.target` exist.
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('email')) {
          return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
        }
        // Generic message if the target is not email or not specified
        return NextResponse.json({ message: 'A unique constraint was violated during registration.' }, { status: 409 });
      }
    }
    // Log the error for server-side debugging
    console.error('Registration error:', error); 
    return NextResponse.json({ message: 'An unexpected error occurred during registration. Please try again.' }, { status: 500 });
  }
}
