/**
 * Bookings API Route
 * POST /api/bookings - Save a new booking from the homepage form
 * GET  /api/bookings - Fetch all bookings (used by admin dashboard)
 */
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "bookings"));
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { bookings: [], error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!body.purpose?.trim()) {
      return NextResponse.json({ error: "Purpose is required" }, { status: 400 });
    }

    const bookingData = {
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || "",
      purpose: body.purpose.trim(),
      preferredDate: body.preferredDate || "",
      preferredTime: body.preferredTime || "",
      visitType: body.visitType || "",
      isEmergency: Boolean(body.isEmergency),
      booked: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);

    return NextResponse.json(
      { success: true, id: docRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
