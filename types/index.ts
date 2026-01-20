export enum UserRole {
  SimpleUser = 0,
  Admin = 1
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  fullName?: string;
  isAdmin?: boolean;
}

export interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isPurchased: boolean;
  purchasedByUserId?: number | null;
  createdAt: string;
  purchasedByUser?: User | null;
}

export interface GiftDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isPurchased: boolean;
  purchasedByUserId?: number | null;
  purchasedBy?: string | null;
  createdAt: string;
}

export interface CreateGiftDto {
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateGiftDto {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
}

export interface LoginDto {
  phoneNumber: string;
  password: string;
}

export interface MarkPurchasedDto {
  userId: number;
}
