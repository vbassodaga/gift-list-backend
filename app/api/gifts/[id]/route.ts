import { NextRequest, NextResponse } from 'next/server';
import { getGiftById, updateGift, deleteGift } from '@/utils/blob-store';
import { canManageGifts, getUserForPermission } from '@/utils/permissions';
import { GiftDto, UpdateGiftDto } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const gift = await getGiftById(id);

    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    // Buscar usuário se houver
    let purchasedBy = null;
    if (gift.purchasedByUserId) {
      const { getUserById } = await import('@/utils/blob-store');
      const user = await getUserById(gift.purchasedByUserId);
      if (user) {
        purchasedBy = `${user.firstName} ${user.lastName}`.trim();
      }
    }

    const giftDto: GiftDto = {
      id: gift.id,
      name: gift.name,
      description: gift.description,
      imageUrl: gift.imageUrl,
      averagePrice: gift.averagePrice || undefined,
      linkUrl: gift.linkUrl || undefined,
      isPurchased: gift.isPurchased,
      purchasedByUserId: gift.purchasedByUserId || null,
      purchasedBy,
      paymentMethod: gift.paymentMethod || undefined,
      deliveryAddress: gift.deliveryAddress || undefined,
      createdAt: gift.createdAt
    };

    return NextResponse.json(giftDto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get gift' },
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
    const user = await getUserForPermission(userId);

    if (!canManageGifts(user)) {
      return NextResponse.json(
        { error: 'Only admins can update gifts' },
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

    const body: UpdateGiftDto = await request.json();
    const updated = await updateGift(id, body);

    const giftDto: GiftDto = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      imageUrl: updated.imageUrl,
      averagePrice: updated.averagePrice || undefined,
      linkUrl: updated.linkUrl || undefined,
      isPurchased: updated.isPurchased,
      purchasedByUserId: updated.purchasedByUserId || null,
      purchasedBy: null,
      createdAt: updated.createdAt
    };

    return NextResponse.json(giftDto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update gift' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!canManageGifts(user)) {
      return NextResponse.json(
        { error: 'Only admins can delete gifts' },
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

    await deleteGift(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete gift' },
      { status: 500 }
    );
  }
}
