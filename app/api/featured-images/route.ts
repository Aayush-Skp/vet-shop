/**
 * Featured Images API Route
 * GET    /api/featured-images        - Fetch all featured images from Firestore
 * POST   /api/featured-images        - Upload image to Cloudinary only (returns URL)
 * DELETE /api/featured-images        - Delete image from Cloudinary only
 *
 * NOTE: Firestore read/write is handled client-side (dashboard component)
 * because Firestore security rules require authenticated user context,
 * which only exists in the browser where Firebase Auth runs.
 * The server-side GET works because rules allow public reads.
 */
import { NextResponse } from "next/server";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import cloudinary from "@/lib/cloudinary";

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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be less than 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary (hero images — high quality, wide)
    const result = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "curavet/hero",
            resource_type: "image",
            transformation: [
              {
                width: 1920,
                height: 1080,
                crop: "limit",
                quality: "auto:best",
                format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as Record<string, unknown>);
          }
        );
        uploadStream.end(buffer);
      }
    );

    // Return Cloudinary data — Firestore write happens on the client
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
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
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryErr) {
        console.warn("Cloudinary delete failed:", cloudinaryErr);
      }
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
