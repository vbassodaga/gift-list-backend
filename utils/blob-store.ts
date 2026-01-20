import { put, list, del, head } from '@vercel/blob';

// Token do Blob Storage (configurado via variável de ambiente)
const getToken = () => {
  return process.env.BLOB_READ_WRITE_TOKEN || '';
};

const BLOB_STORE_NAME = 'gift-list-store';

// Helper para obter chave do blob
function getKey(prefix: string, id: string | number): string {
  return `${prefix}/${id}.json`;
}

// Gifts
export async function getAllGifts(): Promise<any[]> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const { blobs } = await list({ 
      prefix: 'gifts/',
      limit: 1000,
      token
    });
    
    const gifts = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return await response.json();
      })
    );

    return gifts.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting gifts:', error);
    return [];
  }
}

export async function getGiftById(id: number): Promise<any | null> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const key = getKey('gifts', id);
    const result = await head(key, { token });
    
    if (!result) return null;
    
    const response = await fetch(result.url);
    return await response.json();
  } catch (error) {
    console.error('Error getting gift:', error);
    return null;
  }
}

export async function createGift(gift: any): Promise<any> {
  // Gerar ID único
  const gifts = await getAllGifts();
  const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : 0;
  const newId = maxId + 1;

  const newGift = {
    ...gift,
    id: newId,
    createdAt: new Date().toISOString(),
    isPurchased: false,
    purchasedByUserId: null
  };

  const token = getToken();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

  const key = getKey('gifts', newId);
  await put(key, JSON.stringify(newGift), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token
  });

  return newGift;
}

export async function updateGift(id: number, updates: Partial<any>): Promise<any | null> {
  const existing = await getGiftById(id);
  if (!existing) return null;

  const token = getToken();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

  const updated = { ...existing, ...updates };
  const key = getKey('gifts', id);
  
  await put(key, JSON.stringify(updated), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token
  });

  return updated;
}

export async function deleteGift(id: number): Promise<boolean> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const key = getKey('gifts', id);
    await del(key, { token });
    return true;
  } catch (error) {
    console.error('Error deleting gift:', error);
    return false;
  }
}

// Users
export async function getAllUsers(): Promise<any[]> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const { blobs } = await list({ 
      prefix: 'users/',
      limit: 1000,
      token
    });
    
    const users = await Promise.all(
      blobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return await response.json();
      })
    );

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function getUserById(id: number): Promise<any | null> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const key = getKey('users', id);
    const result = await head(key, { token });
    
    if (!result) return null;
    
    const response = await fetch(result.url);
    return await response.json();
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserByPhoneNumber(phoneNumber: string): Promise<any | null> {
  const users = await getAllUsers();
  return users.find(u => u.phoneNumber === phoneNumber) || null;
}

export async function createUser(user: any): Promise<any> {
  // Gerar ID único
  const users = await getAllUsers();
  const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
  const newId = maxId + 1;

  const newUser = {
    ...user,
    id: newId,
    createdAt: new Date().toISOString(),
    role: user.role || 0 // SimpleUser por padrão
  };

  const token = getToken();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

  const key = getKey('users', newId);
  await put(key, JSON.stringify(newUser), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token
  });

  return newUser;
}

// Index para phoneNumber (para busca rápida)
export async function getUserIdByPhoneNumber(phoneNumber: string): Promise<number | null> {
  try {
    const token = getToken();
    if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

    const key = `index/phone/${phoneNumber}.json`;
    const result = await head(key, { token });
    
    if (!result) return null;
    
    const response = await fetch(result.url);
    const data = await response.json();
    return data.userId;
  } catch {
    // Se não encontrar no index, busca em todos os usuários
    const user = await getUserByPhoneNumber(phoneNumber);
    return user?.id || null;
  }
}

export async function createPhoneIndex(phoneNumber: string, userId: number): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');

  const key = `index/phone/${phoneNumber}.json`;
  await put(key, JSON.stringify({ userId }), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token
  });
}
