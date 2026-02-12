/**
 * Products API Route
 * GET /api/products - Public endpoint to fetch all products from Firestore
 * Used by static HTML pages (index.html, products.html) to load products dynamically
 */
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { products: [], error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
