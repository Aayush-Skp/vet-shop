/**
 * Wishlist API Route
 * POST /api/wishlist - Increment or decrement a product's wishlist count
 * Public endpoint (no auth required)
 */
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, action } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    if (action !== "add" && action !== "remove") {
      return NextResponse.json(
        { error: "action must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, {
      wishlist: increment(action === "add" ? 1 : -1),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist update error:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}
