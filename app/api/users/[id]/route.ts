import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/utils/blob-store';
import { UserDto } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}
