import { NextRequest, NextResponse } from 'next/server';
import { getGiftById, updateGift } from '@/utils/blob-store';
import { isAdmin, getUserForPermission } from '@/utils/permissions';
import { MarkPurchasedDto } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body: MarkPurchasedDto = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await getUserForPermission(body.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (isAdmin(user)) {
      return NextResponse.json(
        { error: 'Admins cannot purchase gifts' },
        { status: 403 }
      );
    }

    const gift = await getGiftById(id);
    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    if (gift.isPurchased) {
      return NextResponse.json(
        { error: 'Gift is already purchased' },
        { status: 400 }
      );
    }

    await updateGift(id, {
      isPurchased: true,
      purchasedByUserId: body.userId
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mark gift as purchased' },
      { status: 500 }
    );
  }
}
