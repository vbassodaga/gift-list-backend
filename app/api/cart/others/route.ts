import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { getUserForPermission } from '@/utils/permissions';

// Verificar quantos outros usuários têm cada item no carrinho
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

    await getUserForPermission(userId);

    // Buscar todos os itens no carrinho
    const { blobs } = await list({
      prefix: `cart/`,
      limit: 1000
    });

    // Criar um mapa de giftId -> quantidade de outros usuários
    const othersCountMap: { [giftId: number]: number } = {};

    // Inicializar todos os giftIds com 0
    giftIds.forEach((giftId: number) => {
      othersCountMap[giftId] = 0;
    });

    // Contar quantos outros usuários têm cada item
    blobs.forEach(blob => {
      const urlParts = blob.url.split('/');
      const blobGiftId = parseInt(urlParts[urlParts.length - 1].replace('.json', ''));
      const blobUserId = parseInt(urlParts[urlParts.length - 2]);

      // Se o giftId está na lista e não é do usuário atual
      if (giftIds.includes(blobGiftId) && blobUserId !== userId) {
        othersCountMap[blobGiftId] = (othersCountMap[blobGiftId] || 0) + 1;
      }
    });

    return NextResponse.json(othersCountMap);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check other users cart' },
      { status: 500 }
    );
  }
}
