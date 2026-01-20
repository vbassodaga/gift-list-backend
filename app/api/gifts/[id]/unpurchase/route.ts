import { NextRequest, NextResponse } from 'next/server';
import { getGiftById, updateGift } from '@/utils/blob-store';
import { isAdmin, getUserForPermission } from '@/utils/permissions';

export async function POST(
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
    const user = await getUserForPermission(userId);

    const gift = await getGiftById(id);
    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    if (!gift.isPurchased) {
      return NextResponse.json(
        { error: 'Gift is not purchased' },
        { status: 400 }
      );
    }

    // Apenas o comprador ou admin pode desmarcar
    if (!isAdmin(user) && gift.purchasedByUserId !== userId) {
      return NextResponse.json(
        { error: 'Only the purchaser or admin can unpurchase' },
        { status: 403 }
      );
    }

    await updateGift(id, {
      isPurchased: false,
      purchasedByUserId: null
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unpurchase gift' },
      { status: 500 }
    );
  }
}
