/**
 * Featured Images API Route
 * GET    /api/featured-images - Fetch all featured images from Firestore
 * POST   /api/featured-images - Upload image to Cloudinary only (returns URL)
 * DELETE /api/featured-images - Delete image from Cloudinary only
 *
 * NOTE: Firestore read/write for featured_images is handled client-side
 * (dashboard component) because Firestore security rules require
 * authenticated user context, which only exists in the browser.
 * The server-side GET works because rules allow public reads.
 */
import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  UploadError,
} from "@/lib/cloudinary-upload";

export const dynamic = "force-dynamic";

// ─── GET: Fetch all featured images (public read — allowed by rules) ───
export async function GET() {
  try {
    const q = query(
      collection(db, "featured_images"),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    const images = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json(
      { images },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    // Fallback: try without ordering (index might not exist yet)
    try {
      const snapshot = await getDocs(collection(db, "featured_images"));
      const images = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      return NextResponse.json({ images });
    } catch {
      return NextResponse.json({ images: [] });
    }
  }
}

// ─── POST: Upload image to Cloudinary only ───
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const result = await uploadImageToCloudinary(file, {
      folder: "curavet/hero",
      maxWidth: 1920,
      maxHeight: 1080,
      maxSizeMB: 10,
      quality: "auto:best",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Featured image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove image from Cloudinary only ───
export async function DELETE(request: Request) {
  try {
    const { publicId } = await request.json();

    if (publicId) {
      await deleteImageFromCloudinary(publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete featured image error:", error);
    return NextResponse.json(
      { error: "Failed to delete from Cloudinary" },
      { status: 500 }
    );
  }
}
