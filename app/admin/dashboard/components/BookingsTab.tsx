"use client";

import type { Booking } from "../types";

interface BookingsTabProps {
  filteredBookings: Booking[];
  bookingsLoading: boolean;
  bookingSearch: string;
  setBookingSearch: (q: string) => void;
  pendingCount: number;
  emergencyCount: number;
  toggleBooked: (b: Booking) => void;
  setDeleteBookingTarget: (b: Booking) => void;
  fetchBookings: () => void;
}

export default function BookingsTab({
  filteredBookings,
  bookingsLoading,
  bookingSearch,
  setBookingSearch,
  pendingCount,
  emergencyCount,
  toggleBooked,
  setDeleteBookingTarget,
  fetchBookings,
}: BookingsTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Customer visit requests &middot; {pendingCount} pending
            {emergencyCount > 0 && (
              <span className="text-red-600 font-medium">
                {" "}&middot; {emergencyCount} emergency
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, phone, purpose..."
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {bookingsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">
            {bookingSearch ? "No bookings match your search" : "No bookings yet"}
          </p>
          <p className="text-gray-400 text-sm">
            Bookings from customers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                booking.isEmergency && !booking.booked
                  ? "border-red-200 ring-1 ring-red-100"
                  : booking.booked
                  ? "border-gray-200 opacity-75"
                  : "border-gray-200"
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{booking.name}</h4>
                      {booking.isEmergency && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Emergency
                        </span>
                      )}
                      {booking.booked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {booking.phone}
                      </span>
                      {booking.email && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          {booking.email}
                        </span>
                      )}
                      {booking.visitType && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          {booking.visitType}
                        </span>
                      )}
                      {(booking.preferredDate || booking.preferredTime) && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {booking.preferredDate}{booking.preferredDate && booking.preferredTime ? " at " : ""}{booking.preferredTime}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700">
                      <span className="text-gray-400 font-medium">Purpose:</span>{" "}
                      {booking.purpose}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleBooked(booking)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        booking.booked
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {booking.booked ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                          Undo
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>
                          Confirm
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteBookingTarget(booking)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
