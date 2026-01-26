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
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
  isPurchased: boolean;
  purchasedByUserId?: number | null;
  paymentMethod?: string; // Método de pagamento escolhido
  deliveryAddress?: string; // Endereço de entrega (se aplicável)
  createdAt: string;
  purchasedByUser?: User | null;
}

export interface GiftDto {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
  deliveryAddress?: string; // Endereço fixo de entrega (definido pelo admin)
  isPurchased: boolean;
  purchasedByUserId?: number | null;
  purchasedBy?: string | null;
  paymentMethod?: string | null; // Forma de pagamento escolhida
  createdAt: string;
}

export interface CreateGiftDto {
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
  deliveryAddress?: string; // Endereço fixo de entrega (definido pelo admin)
}

export interface UpdateGiftDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
  deliveryAddress?: string; // Endereço fixo de entrega (definido pelo admin)
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
  paymentMethod?: string;
  deliveryAddress?: string;
}
