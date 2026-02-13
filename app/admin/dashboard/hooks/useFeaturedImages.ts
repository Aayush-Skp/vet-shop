"use client";

import { useState, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FeaturedImage } from "../types";

export function useFeaturedImages(showToast: (msg: string, type: "success" | "error") => void) {
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [featuredAlt, setFeaturedAlt] = useState("");
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState("");
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const [deleteFeaturedTarget, setDeleteFeaturedTarget] = useState<FeaturedImage | null>(null);
  const [deletingFeatured, setDeletingFeatured] = useState(false);

  // ─── Fetch ───
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

  // ─── File change ───
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

  // ─── Upload ───
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

  // ─── Delete ───
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

  return {
    featuredImages,
    featuredLoading,
    featuredUploading,
    featuredAlt,
    setFeaturedAlt,
    featuredFile,
    featuredPreview,
    featuredFileRef,
    handleFeaturedFileChange,
    handleFeaturedUpload,
    deleteFeaturedTarget,
    setDeleteFeaturedTarget,
    deletingFeatured,
    handleDeleteFeatured,
    fetchFeaturedImages,
  };
}
