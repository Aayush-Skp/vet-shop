/**
 * Image Upload API Route
 * POST /api/upload - Uploads product image to Cloudinary and returns the URL
 * Used by the admin dashboard when adding/editing products
 */
import { NextResponse } from "next/server";
import { uploadImageToCloudinary, UploadError } from "@/lib/cloudinary-upload";

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
      folder: "curavet/products",
      maxWidth: 800,
      maxHeight: 800,
      maxSizeMB: 5,
      quality: "auto",
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
