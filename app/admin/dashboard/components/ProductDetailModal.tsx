"use client";

import type { Product } from "../types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {product.image && (
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-xl mb-4" />
            )}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xl font-bold text-gray-900">{product.name}</h4>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {product.onSale && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">SALE</span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
              {product.highlight && (
                <div className="flex items-center gap-2 bg-teal-50 text-teal-700 text-sm px-3 py-2 rounded-lg border border-teal-100">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <span className="font-medium">{product.highlight}</span>
                </div>
              )}
              {product.description && (
                <p className="text-gray-600 text-sm">{product.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Category</span>
                  <span className="font-medium text-gray-900">{product.category}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Price</span>
                  <span className="font-medium text-gray-900">Rs. {product.price?.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Original Price</span>
                  <span className="font-medium text-gray-900">Rs. {product.originalPrice?.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Discount</span>
                  <span className="font-medium text-gray-900">{product.discount || 0}%</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Rating</span>
                  <span className="font-medium text-gray-900">{"★".repeat(Math.floor(product.rating || 0))} {product.rating || "—"}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-gray-500 block text-xs">Wishlist</span>
                  <span className="font-medium text-gray-900">♥ {product.wishlist || 0}</span>
                </div>
              </div>
              {product.disclaimer && (
                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 text-xs px-3 py-2 rounded-lg border border-amber-100">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>{product.disclaimer}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onClose();
                  onEdit(product);
                }}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => {
                  onClose();
                  onDelete(product);
                }}
                className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
