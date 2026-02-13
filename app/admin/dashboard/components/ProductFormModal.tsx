"use client";

import type { Product, ProductFormData } from "../types";
import type { RefObject } from "react";
import { CATEGORIES } from "../constants";

interface ProductFormModalProps {
  editingProduct: Product | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  imagePreview: string;
  saving: boolean;
  formErrors: Record<string, string>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  closeForm: () => void;
}

export default function ProductFormModal({
  editingProduct,
  formData,
  setFormData,
  imagePreview,
  saving,
  formErrors,
  fileInputRef,
  handleImageChange,
  handleSubmit,
  closeForm,
}: ProductFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={closeForm} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm ${formErrors.name ? "border-red-300" : "border-gray-300"}`} placeholder="e.g., Premium Dog Food" />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm resize-none" placeholder="Brief product description..." />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
              <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Selling Price (Rs.) <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="1" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm ${formErrors.price ? "border-red-300" : "border-gray-300"}`} placeholder="1850" />
                {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price (Rs.) <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="1" value={formData.originalPrice} onChange={(e) => setFormData((p) => ({ ...p, originalPrice: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm ${formErrors.originalPrice ? "border-red-300" : "border-gray-300"}`} placeholder="2200" />
                {formErrors.originalPrice && <p className="text-red-500 text-xs mt-1">{formErrors.originalPrice}</p>}
              </div>
            </div>

            {/* Discount preview */}
            {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
              <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2.5 rounded-lg">Discount: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF</div>
            )}

            {/* Rating + Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating (0-5)</label>
                <input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData((p) => ({ ...p, rating: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm ${formErrors.rating ? "border-red-300" : "border-gray-300"}`} placeholder="4.5" />
                {formErrors.rating && <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData((p) => ({ ...p, inStock: e.target.checked }))} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                  <span className="text-sm font-medium text-gray-700">In Stock</span>
                </label>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image {!editingProduct && <span className="text-red-500">*</span>}</label>
              <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${formErrors.image ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/50"}`}>
                {imagePreview ? (
                  <div className="space-y-3">
                    <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-lg object-contain" />
                    <p className="text-sm text-gray-500">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={closeForm} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {saving ? (<><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />{editingProduct ? "Updating..." : "Saving..."}</>) : editingProduct ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
