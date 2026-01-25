import { NextRequest, NextResponse } from 'next/server';
import { getAllGifts, createGift } from '@/utils/blob-store';
import { canManageGifts, getUserForPermission } from '@/utils/permissions';
import { GiftDto, CreateGiftDto } from '@/types';

export async function GET() {
  try {
    const gifts = await getAllGifts();
    
    // Buscar usuários para preencher PurchasedBy
    const { getAllUsers } = await import('@/utils/blob-store');
    const users = await getAllUsers();
    const userMap = new Map(users.map(u => [u.id, u]));

    const giftDtos: GiftDto[] = gifts.map(gift => ({
      id: gift.id,
      name: gift.name,
      description: gift.description,
      imageUrl: gift.imageUrl,
      averagePrice: gift.averagePrice || undefined,
      isPurchased: gift.isPurchased,
      purchasedByUserId: gift.purchasedByUserId || null,
      purchasedBy: gift.purchasedByUserId 
        ? `${userMap.get(gift.purchasedByUserId)?.firstName || ''} ${userMap.get(gift.purchasedByUserId)?.lastName || ''}`.trim()
        : null,
      createdAt: gift.createdAt
    }));

    return NextResponse.json(giftDtos);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get gifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: 'Only admins can create gifts' },
        { status: 403 }
      );
    }

    const body: CreateGiftDto = await request.json();

    if (!body.name || !body.imageUrl) {
      return NextResponse.json(
        { error: 'Name and ImageUrl are required' },
        { status: 400 }
      );
    }

    const gift = await createGift({
      name: body.name,
      description: body.description || '',
      imageUrl: body.imageUrl,
      averagePrice: body.averagePrice || undefined,
      isPurchased: false,
      purchasedByUserId: null
    });

    const giftDto: GiftDto = {
      id: gift.id,
      name: gift.name,
      description: gift.description,
      imageUrl: gift.imageUrl,
      averagePrice: gift.averagePrice || undefined,
      isPurchased: gift.isPurchased,
      purchasedByUserId: null,
      purchasedBy: null,
      createdAt: gift.createdAt
    };

    return NextResponse.json(giftDto, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create gift' },
      { status: 500 }
    );
  }
}
