export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAt?: number | null;
  stockQty: number;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  category?: Category;
  images: ProductImage[];
  reviews?: Review[];
  _avg?: { rating: number | null };
  _count?: { reviews: number };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string | null;
  placedAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  address?: Address;
  payment?: Payment | null;
  shipment?: Shipment | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  providerRef?: string | null;
  paidAt?: Date | null;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  status: string;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isApproved: boolean;
  createdAt: Date;
  user?: { name: string };
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  createdAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
