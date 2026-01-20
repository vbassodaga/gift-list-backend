import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByPhoneNumber, createPhoneIndex } from '@/utils/blob-store';
import { hashPassword } from '@/utils/bcrypt';
import { RegisterUserDto, UserDto, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterUserDto = await request.json();

    // Validation
    if (!body.firstName?.trim()) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.lastName?.trim()) {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!body.phoneNumber?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirm password do not match' },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const existingUser = await getUserByPhoneNumber(body.phoneNumber.trim());
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const passwordHash = await hashPassword(body.password);
    const user = await createUser({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      phoneNumber: body.phoneNumber.trim(),
      passwordHash,
      role: UserRole.SimpleUser
    });

    // Create phone index
    await createPhoneIndex(body.phoneNumber.trim(), user.id);

    const userDto: UserDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isAdmin: user.role === UserRole.Admin,
      createdAt: user.createdAt
    };

    return NextResponse.json(userDto, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
