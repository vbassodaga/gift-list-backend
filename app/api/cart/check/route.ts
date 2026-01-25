import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { getAllGifts } from '@/utils/blob-store';

// Verificar quais itens do carrinho foram comprados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, giftIds } = body;

    if (!userId || !Array.isArray(giftIds)) {
      return NextResponse.json(
        { error: 'userId and giftIds array are required' },
        { status: 400 }
      );
    }

    // Buscar todos os presentes
    const gifts = await getAllGifts();
    const giftMap = new Map(gifts.map(g => [g.id, g]));

    // Verificar quais foram comprados
    const purchasedItems = giftIds.filter(giftId => {
      const gift = giftMap.get(giftId);
      return gift && gift.isPurchased && gift.purchasedByUserId !== userId;
    });

    return NextResponse.json({
      purchasedItems,
      hasUnavailableItems: purchasedItems.length > 0
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check cart items' },
      { status: 500 }
    );
  }
}
