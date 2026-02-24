import { NextRequest, NextResponse } from 'next/server';
import { getUserByPhoneNumber } from '@/utils/blob-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.phoneNumber?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const user = await getUserByPhoneNumber(body.phoneNumber.trim());
    if (!user) {
      // Por segurança, retornamos sucesso mesmo se o telefone não existir
      // Isso evita que atacantes descubram quais telefones estão cadastrados
      return NextResponse.json({ success: true });
    }

    // Retorna sucesso se o usuário existe
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
