"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "@/lib/firebase-auth";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// ─────────────────────────── Types ───────────────────────────
interface Product {
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
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: string;
  category: string;
  inStock: boolean;
}

// ─────────────────────────── Constants ───────────────────────────
const CATEGORIES = [
  "Pet Food",
  "Accessories",
  "Nutrition",
  "Grooming",
  "Medications",
];

const DEFAULT_FORM: ProductFormData = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  rating: "",
  category: CATEGORIES[0],
  inStock: true,
};

// ─────────────────────────── Component ───────────────────────────
export default function AdminDashboard() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail view state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  // ─────────────────── Auth Check ───────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin");
      } else {
        setUser(u);
        setAuthLoading(false);
      }
    });
    return unsub;
  }, [router]);

  // ─────────────────── Toast Helper ───────────────────
  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  // ─────────────────── Fetch Products ───────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const snapshot = await getDocs(collection(db, "products"));
      const prods = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Product[];
      setProducts(prods);
    } catch (err) {
      console.error("Error fetching products:", err);
      showToast("Failed to load products", "error");
    } finally {
      setProductsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [authLoading, user, fetchProducts]);

  // ─────────────────── Logout ───────────────────
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin");
  };

  // ─────────────────── Form Handlers ───────────────────
  const openAddForm = () => {
    setEditingProduct(null);
    setFormData(DEFAULT_FORM);
    setImageFile(null);
    setImagePreview("");
    setFormErrors({});
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      rating: String(product.rating),
      category: product.category,
      inStock: product.inStock ?? true,
    });
    setImageFile(null);
    setImagePreview(product.image || "");
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(DEFAULT_FORM);
    setImageFile(null);
    setImagePreview("");
    setFormErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Please select an image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        image: "Image must be less than 5MB",
      }));
      return;
    }

    setImageFile(file);
    setFormErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.price || Number(formData.price) <= 0)
      errors.price = "Valid price is required";
    if (!formData.originalPrice || Number(formData.originalPrice) <= 0)
      errors.originalPrice = "Valid original price is required";
    if (Number(formData.originalPrice) < Number(formData.price))
      errors.originalPrice = "Must be >= selling price";
    if (
      formData.rating &&
      (Number(formData.rating) < 0 || Number(formData.rating) > 5)
    )
      errors.rating = "Rating must be 0-5";
    if (!editingProduct && !imageFile && !imagePreview)
      errors.image = "Image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

    try {
      let imageUrl = editingProduct?.image || "";

      // Upload image if new file selected
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error || "Image upload failed");
        }

        const uploadResult = await uploadRes.json();
        imageUrl = uploadResult.url;
      }

      const price = Number(formData.price);
      const originalPrice = Number(formData.originalPrice);
      const discount =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        price,
        originalPrice,
        discount,
        rating: Number(formData.rating) || 0,
        category: formData.category,
        inStock: formData.inStock,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        showToast("Product updated successfully", "success");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        showToast("Product added successfully", "success");
      }

      closeForm();
      fetchProducts();
    } catch (err) {
      console.error("Save error:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to save product",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────── Delete Handler ───────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteDoc(doc(db, "products", deleteTarget.id));
      showToast("Product deleted successfully", "success");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Failed to delete product", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────── Seed Sample Data ───────────────────
  const seedProducts = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/data/products.json");
      if (!res.ok) throw new Error("Failed to fetch sample data");
      const data = await res.json();
      const seedData = data.products || [];

      for (const product of seedData) {
        await addDoc(collection(db, "products"), {
          name: product.name,
          description: product.description || "",
          image: product.image || "",
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount || 0,
          rating: product.rating || 0,
          category: product.category || "Uncategorized",
          inStock: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      showToast(`Seeded ${seedData.length} products successfully`, "success");
      fetchProducts();
    } catch (err) {
      console.error("Seed error:", err);
      showToast("Failed to seed products", "error");
    } finally {
      setSeeding(false);
    }
  };

  // ─────────────────── Filtered Products ───────────────────
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // ─────────────────── Loading Screen ───────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  // ─────────────────── Main Render ───────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ colorScheme: 'light' }}>
      {/* ══════════ Header ══════════ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-teal-700 tracking-wide">
                CURAVET
              </h1>
              <span className="text-xs text-gray-400 hidden sm:inline bg-gray-100 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ Main Content ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product catalog &middot;{" "}
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {products.length === 0 && !productsLoading && (
              <button
                onClick={seedProducts}
                disabled={seeding}
                className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {seeding ? "Seeding..." : "Seed Sample Data"}
              </button>
            )}
            <button
              onClick={openAddForm}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
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

        {/* ══════════ Products Table ══════════ */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery
                ? "No products match your search"
                : "No products yet"}
            </p>
            <p className="text-gray-400 text-sm">
              {searchQuery
                ? "Try a different search term"
                : 'Click "Add Product" or "Seed Sample Data" to get started'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Product
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Price
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">
                      Discount
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Rating
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">
                      Status
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Product name + image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                          {product.category}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">
                            Rs. {product.price?.toLocaleString()}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-gray-400 line-through ml-1 text-xs">
                              Rs. {product.originalPrice?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Discount */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {product.discount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                            {product.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">&mdash;</span>
                        )}
                      </td>
                      {/* Rating */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-amber-400">&#9733;</span>
                          <span className="text-gray-700">
                            {product.rating || "\u2014"}
                          </span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            product.inStock !== false
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {product.inStock !== false
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailProduct(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
      </main>

      {/* ══════════ Add / Edit Product Modal ══════════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    onClick={closeForm}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Premium Dog Food - Adult"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Selling Price (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm ${
                        formErrors.price ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="1850"
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Original Price (Rs.){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          originalPrice: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm ${
                        formErrors.originalPrice
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="2200"
                    />
                    {formErrors.originalPrice && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.originalPrice}
                      </p>
                    )}
                  </div>
                </div>

                {/* Auto-calculated discount */}
                {formData.price &&
                  formData.originalPrice &&
                  Number(formData.originalPrice) > Number(formData.price) && (
                    <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Discount:{" "}
                      {Math.round(
                        ((Number(formData.originalPrice) -
                          Number(formData.price)) /
                          Number(formData.originalPrice)) *
                          100
                      )}
                      % OFF
                    </div>
                  )}

                {/* Rating & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          rating: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm ${
                        formErrors.rating ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="4.5"
                    />
                    {formErrors.rating && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.rating}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            inStock: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        In Stock
                      </span>
                    </label>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Image{" "}
                    {!editingProduct && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      formErrors.image
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/50"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        <p className="text-sm text-gray-500">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="w-10 h-10 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {formErrors.image && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.image}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {editingProduct ? "Updating..." : "Saving..."}
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Save Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Product Detail Modal ══════════ */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDetailProduct(null)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Product Details
                  </h3>
                  <button
                    onClick={() => setDetailProduct(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {detailProduct.image && (
                  <img
                    src={detailProduct.image}
                    alt={detailProduct.name}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                )}

                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">
                    {detailProduct.name}
                  </h4>

                  {detailProduct.description && (
                    <p className="text-gray-600 text-sm">
                      {detailProduct.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Category
                      </span>
                      <span className="font-medium text-gray-900">
                        {detailProduct.category}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Selling Price
                      </span>
                      <span className="font-medium text-gray-900">
                        Rs. {detailProduct.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Original Price
                      </span>
                      <span className="font-medium text-gray-900">
                        Rs. {detailProduct.originalPrice?.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Discount
                      </span>
                      <span className="font-medium text-gray-900">
                        {detailProduct.discount || 0}%
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Rating
                      </span>
                      <span className="font-medium text-gray-900">
                        &#9733; {detailProduct.rating || "\u2014"}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-500 block text-xs">
                        Status
                      </span>
                      <span
                        className={`font-medium ${
                          detailProduct.inStock !== false
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {detailProduct.inStock !== false
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const p = detailProduct;
                      setDetailProduct(null);
                      openEditForm(p);
                    }}
                    className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit Product
                  </button>
                  <button
                    onClick={() => {
                      const p = detailProduct;
                      setDetailProduct(null);
                      setDeleteTarget(p);
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
      )}

      {/* ══════════ Delete Confirmation Modal ══════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Delete Product
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-700">
                    {deleteTarget.name}
                  </strong>
                  ? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Toast Notification ══════════ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success"
                ? "bg-teal-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-1 hover:opacity-80"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
