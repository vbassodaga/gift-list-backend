import { getUserById } from './blob-store';
import { User, UserRole } from '@/types';

export async function getUserForPermission(userId: number): Promise<User | null> {
  if (!userId) return null;
  return await getUserById(userId);
}

export function isAdmin(user: User | null): boolean {
  return user?.role === UserRole.Admin;
}

export function canManageGifts(user: User | null): boolean {
  return isAdmin(user);
}

export function canPurchaseGifts(user: User | null): boolean {
  return user !== null && !isAdmin(user);
}
