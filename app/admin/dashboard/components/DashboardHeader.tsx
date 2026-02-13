"use client";

import type { User } from "firebase/auth";

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-teal-700 tracking-wide">
              CURAVET
            </h1>
            <span className="text-xs text-gray-400 hidden sm:inline bg-gray-100 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user?.email}
            </span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
