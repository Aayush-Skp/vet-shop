"use client";

import { useState, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, ProductFormData } from "../types";
import { DEFAULT_FORM } from "../constants";

export function useProducts(showToast: (msg: string, type: "success" | "error") => void) {
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

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Detail state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Seeding state
  const [seeding, setSeeding] = useState(false);

  // ─── Fetch ───
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

  // ─── Form helpers ───
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
      onSale: product.onSale ?? false,
      highlight: product.highlight || "",
      disclaimer: product.disclaimer || "",
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

  // ─── Submit (create/update) ───
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
      const productData: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl,
        price,
        originalPrice,
        discount,
        rating: Number(formData.rating) || 0,
        category: formData.category,
        inStock: formData.inStock,
        onSale: formData.onSale,
        highlight: formData.highlight.trim(),
        disclaimer: formData.disclaimer.trim(),
        updatedAt: serverTimestamp(),
      };
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        showToast("Product updated successfully", "success");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          wishlist: 0,
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

  // ─── Delete ───
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

  // ─── Seed ───
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
          onSale: false,
          highlight: "",
          disclaimer: "",
          wishlist: 0,
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

  // ─── Filtered list ───
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  // ─── View detail (re-fetch latest from Firestore) ───
  const viewProductDetail = useCallback(
    async (product: Product) => {
      // Show immediately with cached data
      setDetailProduct(product);
      // Then silently refresh with latest Firestore data (for wishlist count etc.)
      try {
        const snap = await getDoc(doc(db, "products", product.id));
        if (snap.exists()) {
          setDetailProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch {
        // Silently keep cached data if refresh fails
      }
    },
    []
  );

  return {
    // Data
    products,
    filteredProducts,
    productsLoading,
    searchQuery,
    setSearchQuery,
    // Form
    showForm,
    editingProduct,
    formData,
    setFormData,
    imageFile,
    imagePreview,
    saving,
    formErrors,
    fileInputRef,
    openAddForm,
    openEditForm,
    closeForm,
    handleImageChange,
    handleSubmit,
    // Delete
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDeleteProduct,
    // Detail
    detailProduct,
    setDetailProduct,
    viewProductDetail,
    // Seed
    seeding,
    seedProducts,
    // Refresh
    fetchProducts,
  };
}
