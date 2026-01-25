import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/utils/blob-store';
import { canManageGifts, getUserForPermission } from '@/utils/permissions';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId');

    if (!userIdParam) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam);
    const currentUser = await getUserForPermission(userId);

    if (!canManageGifts(currentUser)) {
      return NextResponse.json(
        { error: 'Only admins can update users' },
        { status: 403 }
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Permitir atualizar apenas o role
    if (body.role !== undefined) {
      updates.role = body.role;
    }

    const updated = await updateUser(id, updates);

    const userDto: UserDto = {
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phoneNumber: updated.phoneNumber,
      fullName: `${updated.firstName} ${updated.lastName}`,
      role: updated.role,
      isAdmin: updated.role === 1,
      createdAt: updated.createdAt
    };

    return NextResponse.json(userDto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
