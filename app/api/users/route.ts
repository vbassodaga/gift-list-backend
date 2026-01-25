import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/utils/blob-store';
import { canManageGifts, getUserForPermission } from '@/utils/permissions';
import { UserDto } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId');
    
    if (!userIdParam) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam);
    const user = await getUserForPermission(userId);

    if (!canManageGifts(user)) {
      return NextResponse.json(
        { error: 'Only admins can list users' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    
    // Retornar apenas informações públicas (sem senha)
    const userDtos: UserDto[] = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isAdmin: user.role === 1, // UserRole.Admin
      createdAt: user.createdAt
    }));

    return NextResponse.json(userDtos);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
