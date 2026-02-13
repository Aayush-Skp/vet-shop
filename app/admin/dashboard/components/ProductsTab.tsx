"use client";

import type { Product } from "../types";

interface ProductsTabProps {
  products: Product[];
  filteredProducts: Product[];
  productsLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  seeding: boolean;
  seedProducts: () => void;
  openAddForm: () => void;
  openEditForm: (p: Product) => void;
  viewProductDetail: (p: Product) => void;
  setDeleteTarget: (p: Product) => void;
}

export default function ProductsTab({
  products,
  filteredProducts,
  productsLoading,
  searchQuery,
  setSearchQuery,
  seeding,
  seedProducts,
  openAddForm,
  openEditForm,
  viewProductDetail,
  setDeleteTarget,
}: ProductsTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your product catalog &middot; {products.length}{" "}
            product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {products.length === 0 && !productsLoading && (
            <button
              onClick={seedProducts}
              disabled={seeding}
              className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {seeding ? "Seeding..." : "Seed Sample Data"}
            </button>
          )}
          <button
            onClick={openAddForm}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery ? "No products match your search" : "No products yet"}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? "Try a different search term" : 'Click "Add Product" or "Seed Sample Data" to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Discount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Rating</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                          )}
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold uppercase leading-none">Sold Out</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-gray-900 text-sm block truncate">{product.name}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {product.onSale && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">SALE</span>
                            )}
                            {!product.inStock && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">OUT OF STOCK</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 text-sm">Rs. {product.price?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {product.discount > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">{product.discount}% OFF</span>
                      ) : (
                        <span className="text-gray-400 text-xs">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-700">&#9733; {product.rating || "\u2014"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => viewProductDetail(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button onClick={() => openEditForm(product)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteTarget(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
