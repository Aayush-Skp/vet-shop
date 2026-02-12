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

interface Booking {
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

interface FeaturedImage {
  id: string;
  url: string;
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  order: number;
  createdAt?: unknown;
}

type TabKey = "products" | "bookings" | "featured";

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

  // Tab
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Product form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Product detail state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState("");
  const [deleteBookingTarget, setDeleteBookingTarget] =
    useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  // Featured Images state
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [featuredAlt, setFeaturedAlt] = useState("");
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const [deleteFeaturedTarget, setDeleteFeaturedTarget] = useState<FeaturedImage | null>(null);
  const [deletingFeatured, setDeletingFeatured] = useState(false);

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

  // ─────────────────── Fetch Bookings ───────────────────
  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const snapshot = await getDocs(collection(db, "bookings"));
      const bks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Booking[];
      setBookings(bks);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      showToast("Failed to load bookings", "error");
    } finally {
      setBookingsLoading(false);
    }
  }, [showToast]);

  // ─────────────────── Fetch Featured Images ───────────────────
  const fetchFeaturedImages = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      const res = await fetch("/api/featured-images");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFeaturedImages(data.images || []);
    } catch (err) {
      console.error("Error fetching featured images:", err);
      showToast("Failed to load featured images", "error");
    } finally {
      setFeaturedLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
      fetchBookings();
      fetchFeaturedImages();
    }
  }, [authLoading, user, fetchProducts, fetchBookings, fetchFeaturedImages]);

  // ─────────────────── Logout ───────────────────
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin");
  };

  // ═══════════════════════════════════════════════════
  //                  PRODUCTS LOGIC
  // ═══════════════════════════════════════════════════

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
      setFormErrors((p) => ({ ...p, image: "Please select an image file" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((p) => ({ ...p, image: "Image must be less than 5MB" }));
      return;
    }
    setImageFile(file);
    setFormErrors((p) => ({ ...p, image: "" }));
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
        imageUrl = (await uploadRes.json()).url;
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

  const handleDeleteProduct = async () => {
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

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // ═══════════════════════════════════════════════════
  //                  BOOKINGS LOGIC
  // ═══════════════════════════════════════════════════

  const toggleBooked = async (booking: Booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        booked: !booking.booked,
      });
      showToast(
        booking.booked ? "Marked as pending" : "Marked as booked",
        "success"
      );
      fetchBookings();
    } catch (err) {
      console.error("Toggle booked error:", err);
      showToast("Failed to update booking", "error");
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingTarget) return;
    setDeletingBooking(true);
    try {
      await deleteDoc(doc(db, "bookings", deleteBookingTarget.id));
      showToast("Booking deleted", "success");
      setDeleteBookingTarget(null);
      fetchBookings();
    } catch (err) {
      console.error("Delete booking error:", err);
      showToast("Failed to delete booking", "error");
    } finally {
      setDeletingBooking(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      b.visitType?.toLowerCase().includes(q)
    );
  });

  const pendingCount = bookings.filter((b) => !b.booked).length;
  const emergencyCount = bookings.filter((b) => b.isEmergency && !b.booked).length;

  // ═══════════════════════════════════════════════════
  //              FEATURED IMAGES LOGIC
  // ═══════════════════════════════════════════════════

  const handleFeaturedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be less than 10MB", "error");
      return;
    }
    setFeaturedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFeaturedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFeaturedUpload = async () => {
    if (!featuredFile) {
      showToast("Please select an image first", "error");
      return;
    }
    setFeaturedUploading(true);
    try {
      // Step 1: Upload to Cloudinary via API route (server needs API secret)
      const formData = new FormData();
      formData.append("file", featuredFile);

      const res = await fetch("/api/featured-images", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const cloudinaryData = await res.json();

      // Step 2: Write to Firestore from client (user is authenticated here)
      const snapshot = await getDocs(collection(db, "featured_images"));
      await addDoc(collection(db, "featured_images"), {
        url: cloudinaryData.url,
        publicId: cloudinaryData.publicId,
        alt: featuredAlt || "Curavet Pet Clinic",
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        order: snapshot.size,
        createdAt: serverTimestamp(),
      });

      showToast("Featured image uploaded successfully", "success");
      setFeaturedFile(null);
      setFeaturedPreview("");
      setFeaturedAlt("");
      if (featuredFileRef.current) featuredFileRef.current.value = "";
      fetchFeaturedImages();
    } catch (err) {
      console.error("Featured upload error:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to upload image",
        "error"
      );
    } finally {
      setFeaturedUploading(false);
    }
  };

  const handleDeleteFeatured = async () => {
    if (!deleteFeaturedTarget) return;
    setDeletingFeatured(true);
    try {
      // Step 1: Delete from Cloudinary via API route
      if (deleteFeaturedTarget.publicId) {
        await fetch("/api/featured-images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: deleteFeaturedTarget.publicId }),
        });
      }

      // Step 2: Delete from Firestore from client (user is authenticated)
      await deleteDoc(doc(db, "featured_images", deleteFeaturedTarget.id));

      showToast("Featured image deleted", "success");
      setDeleteFeaturedTarget(null);
      fetchFeaturedImages();
    } catch (err) {
      console.error("Delete featured error:", err);
      showToast("Failed to delete featured image", "error");
    } finally {
      setDeletingFeatured(false);
    }
  };

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
    <div
      className="min-h-screen bg-gray-50 text-gray-900"
      style={{ colorScheme: "light" }}
    >
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ Tab Navigation ══════════ */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "bookings"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bookings
              {pendingCount > 0 && (
                <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
              {emergencyCount > 0 && (
                <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                  {emergencyCount} urgent
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "featured"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Hero Images
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {featuredImages.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* ══════════ Main Content ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ──────────── PRODUCTS TAB ──────────── */}
        {activeTab === "products" && (
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
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                                )}
                              </div>
                              <span className="font-medium text-gray-900 text-sm">{product.name}</span>
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
                              <button onClick={() => setDetailProduct(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
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
        )}

        {/* ──────────── BOOKINGS TAB ──────────── */}
        {activeTab === "bookings" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Customer visit requests &middot; {pendingCount} pending
                  {emergencyCount > 0 && (
                    <span className="text-red-600 font-medium">
                      {" "}&middot; {emergencyCount} emergency
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={fetchBookings}
                className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search by name, phone, purpose..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">
                  {bookingSearch ? "No bookings match your search" : "No bookings yet"}
                </p>
                <p className="text-gray-400 text-sm">
                  Bookings from customers will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                      booking.isEmergency && !booking.booked
                        ? "border-red-200 ring-1 ring-red-100"
                        : booking.booked
                        ? "border-gray-200 opacity-75"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Left: Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900">
                              {booking.name}
                            </h4>
                            {booking.isEmergency && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                Emergency
                              </span>
                            )}
                            {booking.booked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
                                Confirmed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                Pending
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {booking.phone}
                            </span>
                            {booking.email && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {booking.email}
                              </span>
                            )}
                            {booking.visitType && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                {booking.visitType}
                              </span>
                            )}
                            {(booking.preferredDate || booking.preferredTime) && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {booking.preferredDate}{booking.preferredDate && booking.preferredTime ? " at " : ""}{booking.preferredTime}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-700">
                            <span className="text-gray-400 font-medium">Purpose:</span>{" "}
                            {booking.purpose}
                          </p>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleBooked(booking)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                              booking.booked
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {booking.booked ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                                Undo
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
                                Confirm
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteBookingTarget(booking)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ──────────── FEATURED IMAGES TAB ──────────── */}
        {activeTab === "featured" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Hero Images</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage the homepage hero slider images &middot; {featuredImages.length} image{featuredImages.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={fetchFeaturedImages}
                className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Upload form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload New Image
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div
                    onClick={() => featuredFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      featuredPreview
                        ? "border-teal-300 bg-teal-50/30"
                        : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/50"
                    }`}
                  >
                    {featuredPreview ? (
                      <div className="space-y-2">
                        <img src={featuredPreview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                        <p className="text-sm text-gray-500">Click to change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">Click to select image</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB &middot; Recommended: 1920×1080</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={featuredFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:w-64">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text (optional)</label>
                    <input
                      type="text"
                      value={featuredAlt}
                      onChange={(e) => setFeaturedAlt(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                      placeholder="e.g., Clinic exterior"
                    />
                  </div>
                  <button
                    onClick={handleFeaturedUpload}
                    disabled={!featuredFile || featuredUploading}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
                  >
                    {featuredUploading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Image grid */}
            {featuredLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : featuredImages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No hero images yet</p>
                <p className="text-gray-400 text-sm">
                  Upload images above to display in the homepage hero slider.<br />
                  Default placeholder images will be used until you add your own.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredImages.map((img, idx) => (
                  <div key={img.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={img.url}
                        alt={img.alt || `Hero image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {img.alt || `Image ${idx + 1}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {img.width && img.height ? `${img.width}×${img.height}` : "Hero slide"}
                          {" · "}Order: {idx + 1}
                        </p>
                      </div>
                      <button
                        onClick={() => setDeleteFeaturedTarget(img)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ══════════ Add / Edit Product Modal ══════════ */}
      {showForm && (
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm ${formErrors.name ? "border-red-300" : "border-gray-300"}`} placeholder="e.g., Premium Dog Food" />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm resize-none" placeholder="Brief product description..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm bg-white">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
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
                {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                  <div className="bg-amber-50 text-amber-700 text-sm px-4 py-2.5 rounded-lg">Discount: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF</div>
                )}
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
      )}

      {/* ══════════ Product Detail Modal ══════════ */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDetailProduct(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Product Details</h3>
                  <button onClick={() => setDetailProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                {detailProduct.image && <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-64 object-cover rounded-xl mb-4" />}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">{detailProduct.name}</h4>
                  {detailProduct.description && <p className="text-gray-600 text-sm">{detailProduct.description}</p>}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs">Category</span><span className="font-medium text-gray-900">{detailProduct.category}</span></div>
                    <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs">Price</span><span className="font-medium text-gray-900">Rs. {detailProduct.price?.toLocaleString()}</span></div>
                    <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs">Original Price</span><span className="font-medium text-gray-900">Rs. {detailProduct.originalPrice?.toLocaleString()}</span></div>
                    <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500 block text-xs">Discount</span><span className="font-medium text-gray-900">{detailProduct.discount || 0}%</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button onClick={() => { const p = detailProduct; setDetailProduct(null); openEditForm(p); }} className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">Edit Product</button>
                  <button onClick={() => { const p = detailProduct; setDetailProduct(null); setDeleteTarget(p); }} className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Delete Product Confirmation ══════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong className="text-gray-700">{deleteTarget.name}</strong>? This cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleDeleteProduct} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? (<><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Deleting...</>) : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Delete Booking Confirmation ══════════ */}
      {deleteBookingTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteBookingTarget(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Booking</h3>
              <p className="text-sm text-gray-500 mb-6">Delete booking from <strong className="text-gray-700">{deleteBookingTarget.name}</strong>? This cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteBookingTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleDeleteBooking} disabled={deletingBooking} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deletingBooking ? (<><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Deleting...</>) : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Delete Featured Image Confirmation ══════════ */}
      {deleteFeaturedTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteFeaturedTarget(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Hero Image</h3>
              <div className="mb-4">
                <img src={deleteFeaturedTarget.url} alt={deleteFeaturedTarget.alt} className="w-full h-32 object-cover rounded-lg" />
              </div>
              <p className="text-sm text-gray-500 mb-6">This image will be removed from the homepage slider. This cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteFeaturedTarget(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleDeleteFeatured} disabled={deletingFeatured} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {deletingFeatured ? (<><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Deleting...</>) : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Toast ══════════ */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"}`}>
            {toast.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-1 hover:opacity-80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
