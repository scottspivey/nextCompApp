// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client'; // Import Role if you use it

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      name, // This is for User.name (display name)
      firstName, // New: For Profile.firstName
      lastName,  // New: For Profile.lastName
      firm_name, 
      phone_number, 
      role: profileRole 
    } = await request.json();

    if (!email || !password || !name || !firstName || !lastName) {
      return NextResponse.json({ message: 'Missing required fields: email, password, name, firstName, and lastName are required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: name, // Use the provided 'name' for User.name
          password: hashedPassword,
        },
      });

      const newProfile = await tx.profile.create({
        data: {
          userId: newUser.id,
          firstName: firstName, // Use new field
          lastName: lastName,   // Use new field
          firm_name: firm_name,
          phone_number: phone_number,
          role: profileRole ? profileRole as Role : Role.USER, // Use Role enum, default to USER
        },
      });

      const { password: _, ...userWithoutPassword } = newUser;
      
      return { user: userWithoutPassword, profile: newProfile };
    });

    return NextResponse.json({ 
      message: 'User and profile created successfully.', 
      user: result.user,
      profileId: result.profile.id 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('email')) {
          return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'A unique constraint was violated during registration.' }, { status: 409 });
      }
    }
    console.error('Registration error:', error); 
    return NextResponse.json({ message: 'An unexpected error occurred during registration. Please try again.' }, { status: 500 });
  }
}