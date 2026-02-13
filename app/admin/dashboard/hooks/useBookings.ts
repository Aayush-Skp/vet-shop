"use client";

import { useState, useCallback } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking } from "../types";

export function useBookings(showToast: (msg: string, type: "success" | "error") => void) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingSearch, setBookingSearch] = useState("");
  const [deleteBookingTarget, setDeleteBookingTarget] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  // ─── Fetch ───
  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const snapshot = await getDocs(collection(db, "bookings"));
      const bks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Booking[];
      setBookings(bks);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      showToast("Failed to load bookings", "error");
    } finally {
      setBookingsLoading(false);
    }
  }, [showToast]);

  // ─── Toggle booked status ───
  const toggleBooked = async (booking: Booking) => {
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        booked: !booking.booked,
      });
      showToast(
        booking.booked ? "Marked as pending" : "Marked as booked",
        "success"
      );
      fetchBookings();
    } catch (err) {
      console.error("Toggle booked error:", err);
      showToast("Failed to update booking", "error");
    }
  };

  // ─── Delete ───
  const handleDeleteBooking = async () => {
    if (!deleteBookingTarget) return;
    setDeletingBooking(true);
    try {
      await deleteDoc(doc(db, "bookings", deleteBookingTarget.id));
      showToast("Booking deleted", "success");
      setDeleteBookingTarget(null);
      fetchBookings();
    } catch (err) {
      console.error("Delete booking error:", err);
      showToast("Failed to delete booking", "error");
    } finally {
      setDeletingBooking(false);
    }
  };

  // ─── Filtered & computed ───
  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.purpose?.toLowerCase().includes(q) ||
      b.visitType?.toLowerCase().includes(q)
    );
  });

  const pendingCount = bookings.filter((b) => !b.booked).length;
  const emergencyCount = bookings.filter((b) => b.isEmergency && !b.booked).length;

  return {
    bookings,
    filteredBookings,
    bookingsLoading,
    bookingSearch,
    setBookingSearch,
    pendingCount,
    emergencyCount,
    toggleBooked,
    deleteBookingTarget,
    setDeleteBookingTarget,
    deletingBooking,
    handleDeleteBooking,
    fetchBookings,
  };
}
