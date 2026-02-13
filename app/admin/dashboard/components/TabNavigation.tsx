"use client";

import type { TabKey } from "../types";

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  productCount: number;
  pendingCount: number;
  emergencyCount: number;
  featuredCount: number;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  productCount,
  pendingCount,
  emergencyCount,
  featuredCount,
}: TabNavigationProps) {
  const tabClass = (tab: TabKey) =>
    `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-teal-600 text-teal-700"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1 -mb-px">
          <button onClick={() => onTabChange("products")} className={tabClass("products")}>
            Products
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {productCount}
            </span>
          </button>
          <button onClick={() => onTabChange("bookings")} className={tabClass("bookings")}>
            Bookings
            {pendingCount > 0 && (
              <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            {emergencyCount > 0 && (
              <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                {emergencyCount} urgent
              </span>
            )}
          </button>
          <button onClick={() => onTabChange("featured")} className={tabClass("featured")}>
            Hero Images
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {featuredCount}
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
