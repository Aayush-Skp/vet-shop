import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary not configured. Add credentials to .env.local" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImage(buffer);

    return NextResponse.json({ url: result.url, publicId: result.publicId });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload image: " + (err as Error).message },
      { status: 500 }
    );
  }
}
