import { NextResponse } from "next/server";
import { getFirestore, PRODUCTS_COLLECTION } from "@/lib/firebase";
import { requireAuth } from "@/lib/auth-guard";

function isFirebaseConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    !process.env.FIREBASE_CLIENT_EMAIL.includes("xxxxx") &&
    !process.env.FIREBASE_PRIVATE_KEY.includes("...")
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK not configured" }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, image, price, originalPrice, discount, rating, category } = body;

    const db = getFirestore();
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (name != null) updates.name = String(name);
    if (image != null) updates.image = image;
    if (price != null) updates.price = Number(price);
    if (originalPrice != null) updates.originalPrice = Number(originalPrice);
    if (discount != null) updates.discount = Number(discount);
    if (rating != null) updates.rating = Number(rating);
    if (category != null) updates.category = category;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product update error:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth(_request);
  if (authError) return authError;

  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase Admin SDK not configured" }, { status: 500 });
  }

  try {
    const { id } = await params;
    const db = getFirestore();
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Product delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
