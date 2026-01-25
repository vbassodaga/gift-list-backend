import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { getUserForPermission } from '@/utils/permissions';

const BLOB_STORE_ID = process.env.BLOB_STORE_ID || '';

function getKey(userId: number, giftId: number): string {
  return `cart/${userId}/${giftId}.json`;
}

// GET - Obter itens no carrinho de um usuário
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
    await getUserForPermission(userId); // Verificar se usuário existe

    // Buscar todos os itens no carrinho deste usuário
    const { blobs } = await list({
      prefix: `cart/${userId}/`,
      limit: 1000
    });

    const cartItems = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        const data = await response.json();
        return {
          giftId: data.giftId,
          userId: data.userId,
          addedAt: data.addedAt
        };
      })
    );

    return NextResponse.json(cartItems);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get cart items' },
      { status: 500 }
    );
  }
}

// POST - Adicionar item ao carrinho
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, giftId } = body;

    if (!userId || !giftId) {
      return NextResponse.json(
        { error: 'userId and giftId are required' },
        { status: 400 }
      );
    }

    await getUserForPermission(userId);

    const key = getKey(userId, giftId);
    const cartItem = {
      userId,
      giftId,
      addedAt: new Date().toISOString()
    };

    await put(key, JSON.stringify(cartItem), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    // Verificar quantos outros usuários têm este item no carrinho
    let otherUsersCount = 0;
    try {
      const { blobs } = await list({
        prefix: `cart/`,
        limit: 1000
      });

      otherUsersCount = blobs.filter(blob => {
        const urlParts = blob.url.split('/');
        const blobGiftId = urlParts[urlParts.length - 1].replace('.json', '');
        return parseInt(blobGiftId) === giftId && !blob.url.includes(`/${userId}/`);
      }).length;
    } catch (error) {
      console.error('Erro ao verificar outros usuários:', error);
    }

    return NextResponse.json({
      success: true,
      otherUsersCount
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remover item do carrinho
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId');
    const giftIdParam = searchParams.get('giftId');
    
    if (!userIdParam || !giftIdParam) {
      return NextResponse.json(
        { error: 'userId and giftId are required' },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam);
    const giftId = parseInt(giftIdParam);
    await getUserForPermission(userId);

    const key = getKey(userId, giftId);
    await del(key);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
