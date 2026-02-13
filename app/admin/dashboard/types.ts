/**
 * Admin Dashboard — Shared Types
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  category: string;
  inStock: boolean;
  onSale?: boolean;
  highlight?: string;
  disclaimer?: string;
  wishlist?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: string;
  category: string;
  inStock: boolean;
  onSale: boolean;
  highlight: string;
  disclaimer: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  purpose: string;
  preferredDate: string;
  preferredTime: string;
  visitType: string;
  isEmergency: boolean;
  booked: boolean;
  createdAt?: unknown;
}

export interface FeaturedImage {
  id: string;
  url: string;
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  order: number;
  createdAt?: unknown;
}

export type TabKey = "products" | "bookings" | "featured";
