/**
 * Admin Dashboard — Constants
 */
import type { ProductFormData } from "./types";

export const CATEGORIES = [
  "Pet Food",
  "Accessories",
  "Nutrition",
  "Grooming",
  "Medications",
];

export const DEFAULT_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  rating: "",
  category: CATEGORIES[0],
  inStock: true,
};
