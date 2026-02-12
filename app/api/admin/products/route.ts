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

export async function GET(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  if (!isFirebaseConfigured()) {
    return NextResponse.json({
      products: [],
      error: "Firebase Admin SDK not configured. Add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to .env.local - see ADMIN_SETUP.md",
    });
  }

  try {
    const db = getFirestore();
    let snapshot;
    try {
      snapshot = await db.collection(PRODUCTS_COLLECTION).orderBy("createdAt", "desc").get();
    } catch {
      snapshot = await db.collection(PRODUCTS_COLLECTION).get();
    }

    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        image: data.image,
        price: data.price,
        originalPrice: data.originalPrice ?? data.price,
        discount: data.discount ?? 0,
        rating: data.rating ?? 0,
        category: data.category ?? "",
      };
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Admin products fetch error:", err);
    return NextResponse.json({
      products: [],
      error: "Failed to connect to Firebase. Check your credentials in .env.local",
    });
  }
}

export async function POST(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin SDK not configured. See ADMIN_SETUP.md" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { name, image, price, originalPrice, discount, rating, category } = body;

    if (!name || price == null) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const db = getFirestore();
    const docRef = await db.collection(PRODUCTS_COLLECTION).add({
      name: String(name),
      image: image || "",
      price: Number(price),
      originalPrice: originalPrice != null ? Number(originalPrice) : Number(price),
      discount: discount != null ? Number(discount) : 0,
      rating: rating != null ? Number(rating) : 0,
      category: category || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, success: true });
  } catch (err) {
    console.error("Product create error:", err);
    return NextResponse.json(
      { error: "Failed to create product. Check Firebase credentials." },
      { status: 500 }
    );
  }
}
