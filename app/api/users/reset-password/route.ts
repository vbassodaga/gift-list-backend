import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhoneNumber, updateUser } from '@/utils/blob-store';
import { hashPassword } from '@/utils/bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phoneNumber?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.newPassword || body.newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const user = await getUserByPhoneNumber(body.phoneNumber.trim());
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(body.newPassword);

    // Atualizar senha do usuário
    await updateUser(user.id, {
      passwordHash: newPasswordHash
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
