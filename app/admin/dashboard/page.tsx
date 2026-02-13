"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import { useRouter } from "next/navigation";

// Types
import type { TabKey } from "./types";

// Hooks
import { useToast } from "./hooks/useToast";
import { useProducts } from "./hooks/useProducts";
import { useBookings } from "./hooks/useBookings";
import { useFeaturedImages } from "./hooks/useFeaturedImages";

// Components
import DashboardHeader from "./components/DashboardHeader";
import TabNavigation from "./components/TabNavigation";
import ProductsTab from "./components/ProductsTab";
import BookingsTab from "./components/BookingsTab";
import FeaturedImagesTab from "./components/FeaturedImagesTab";
import ProductFormModal from "./components/ProductFormModal";
import ProductDetailModal from "./components/ProductDetailModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import Toast from "./components/Toast";

// ─────────────────────────── Component ───────────────────────────
export default function AdminDashboard() {
  const router = useRouter();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab
  const [activeTab, setActiveTab] = useState<TabKey>("products");

  // Hooks
  const { toast, showToast, dismissToast } = useToast();
  const productsHook = useProducts(showToast);
  const bookingsHook = useBookings(showToast);
  const featuredHook = useFeaturedImages(showToast);

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

  // ─────────────────── Fetch data on auth ───────────────────
  useEffect(() => {
    if (!authLoading && user) {
      productsHook.fetchProducts();
      bookingsHook.fetchBookings();
      featuredHook.fetchFeaturedImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // ─────────────────── Logout ───────────────────
  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin");
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
      <DashboardHeader user={user} onLogout={handleLogout} />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        productCount={productsHook.products.length}
        pendingCount={bookingsHook.pendingCount}
        emergencyCount={bookingsHook.emergencyCount}
        featuredCount={featuredHook.featuredImages.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "products" && (
          <ProductsTab
            products={productsHook.products}
            filteredProducts={productsHook.filteredProducts}
            productsLoading={productsHook.productsLoading}
            searchQuery={productsHook.searchQuery}
            setSearchQuery={productsHook.setSearchQuery}
            seeding={productsHook.seeding}
            seedProducts={productsHook.seedProducts}
            openAddForm={productsHook.openAddForm}
            openEditForm={productsHook.openEditForm}
            viewProductDetail={productsHook.viewProductDetail}
            setDeleteTarget={productsHook.setDeleteTarget}
          />
        )}

        {activeTab === "bookings" && (
          <BookingsTab
            filteredBookings={bookingsHook.filteredBookings}
            bookingsLoading={bookingsHook.bookingsLoading}
            bookingSearch={bookingsHook.bookingSearch}
            setBookingSearch={bookingsHook.setBookingSearch}
            pendingCount={bookingsHook.pendingCount}
            emergencyCount={bookingsHook.emergencyCount}
            toggleBooked={bookingsHook.toggleBooked}
            setDeleteBookingTarget={bookingsHook.setDeleteBookingTarget}
            fetchBookings={bookingsHook.fetchBookings}
          />
        )}

        {activeTab === "featured" && (
          <FeaturedImagesTab
            featuredImages={featuredHook.featuredImages}
            featuredLoading={featuredHook.featuredLoading}
            featuredUploading={featuredHook.featuredUploading}
            featuredAlt={featuredHook.featuredAlt}
            setFeaturedAlt={featuredHook.setFeaturedAlt}
            featuredFile={featuredHook.featuredFile}
            featuredPreview={featuredHook.featuredPreview}
            featuredFileRef={featuredHook.featuredFileRef}
            handleFeaturedFileChange={featuredHook.handleFeaturedFileChange}
            handleFeaturedUpload={featuredHook.handleFeaturedUpload}
            setDeleteFeaturedTarget={featuredHook.setDeleteFeaturedTarget}
            fetchFeaturedImages={featuredHook.fetchFeaturedImages}
          />
        )}
      </main>

      {/* ══════════ Modals ══════════ */}
      {productsHook.showForm && (
        <ProductFormModal
          editingProduct={productsHook.editingProduct}
          formData={productsHook.formData}
          setFormData={productsHook.setFormData}
          imagePreview={productsHook.imagePreview}
          saving={productsHook.saving}
          formErrors={productsHook.formErrors}
          fileInputRef={productsHook.fileInputRef}
          handleImageChange={productsHook.handleImageChange}
          handleSubmit={productsHook.handleSubmit}
          closeForm={productsHook.closeForm}
        />
      )}

      {productsHook.detailProduct && (
        <ProductDetailModal
          product={productsHook.detailProduct}
          onClose={() => productsHook.setDetailProduct(null)}
          onEdit={productsHook.openEditForm}
          onDelete={productsHook.setDeleteTarget}
        />
      )}

      {productsHook.deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Product"
          message={`Are you sure you want to delete <strong class="text-gray-700">${productsHook.deleteTarget.name}</strong>? This cannot be undone.`}
          onCancel={() => productsHook.setDeleteTarget(null)}
          onConfirm={productsHook.handleDeleteProduct}
          deleting={productsHook.deleting}
        />
      )}

      {bookingsHook.deleteBookingTarget && (
        <ConfirmDeleteModal
          title="Delete Booking"
          message={`Delete booking from <strong class="text-gray-700">${bookingsHook.deleteBookingTarget.name}</strong>? This cannot be undone.`}
          onCancel={() => bookingsHook.setDeleteBookingTarget(null)}
          onConfirm={bookingsHook.handleDeleteBooking}
          deleting={bookingsHook.deletingBooking}
        />
      )}

      {featuredHook.deleteFeaturedTarget && (
        <ConfirmDeleteModal
          title="Delete Hero Image"
          message="This image will be removed from the homepage slider. This cannot be undone."
          previewImage={featuredHook.deleteFeaturedTarget.url}
          previewImageAlt={featuredHook.deleteFeaturedTarget.alt}
          onCancel={() => featuredHook.setDeleteFeaturedTarget(null)}
          onConfirm={featuredHook.handleDeleteFeatured}
          deleting={featuredHook.deletingFeatured}
        />
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
