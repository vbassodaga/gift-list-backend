import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhoneNumber } from '@/utils/blob-store';
import { comparePassword } from '@/utils/bcrypt';
import { LoginDto, UserDto } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginDto = await request.json();

    if (!body.phoneNumber?.trim() || !body.password) {
      return NextResponse.json(
        { error: 'Phone number and password are required' },
        { status: 400 }
      );
    }

    const user = await getUserByPhoneNumber(body.phoneNumber.trim());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(body.password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid phone number or password' },
        { status: 401 }
      );
    }

    const userDto: UserDto = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isAdmin: user.role === 1, // UserRole.Admin
      createdAt: user.createdAt
    };

    return NextResponse.json(userDto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
