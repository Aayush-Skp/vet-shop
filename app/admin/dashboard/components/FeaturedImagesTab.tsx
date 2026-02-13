"use client";

import type { FeaturedImage } from "../types";
import type { RefObject } from "react";

interface FeaturedImagesTabProps {
  featuredImages: FeaturedImage[];
  featuredLoading: boolean;
  featuredUploading: boolean;
  featuredAlt: string;
  setFeaturedAlt: (v: string) => void;
  featuredFile: File | null;
  featuredPreview: string;
  featuredFileRef: RefObject<HTMLInputElement | null>;
  handleFeaturedFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFeaturedUpload: () => void;
  setDeleteFeaturedTarget: (img: FeaturedImage) => void;
  fetchFeaturedImages: () => void;
}

export default function FeaturedImagesTab({
  featuredImages,
  featuredLoading,
  featuredUploading,
  featuredAlt,
  setFeaturedAlt,
  featuredFile,
  featuredPreview,
  featuredFileRef,
  handleFeaturedFileChange,
  handleFeaturedUpload,
  setDeleteFeaturedTarget,
  fetchFeaturedImages,
}: FeaturedImagesTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Images</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage the homepage hero slider images &middot; {featuredImages.length} image{featuredImages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchFeaturedImages}
          className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upload New Image
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div
              onClick={() => featuredFileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                featuredPreview
                  ? "border-teal-300 bg-teal-50/30"
                  : "border-gray-300 hover:border-teal-400 hover:bg-teal-50/50"
              }`}
            >
              {featuredPreview ? (
                <div className="space-y-2">
                  <img src={featuredPreview} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain" />
                  <p className="text-sm text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600 font-medium">Click to select image</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB &middot; Recommended: 1920×1080</p>
                </div>
              )}
            </div>
            <input
              ref={featuredFileRef}
              type="file"
              accept="image/*"
              onChange={handleFeaturedFileChange}
              className="hidden"
            />
          </div>
          <div className="flex flex-col gap-3 sm:w-64">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text (optional)</label>
              <input
                type="text"
                value={featuredAlt}
                onChange={(e) => setFeaturedAlt(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
                placeholder="e.g., Clinic exterior"
              />
            </div>
            <button
              onClick={handleFeaturedUpload}
              disabled={!featuredFile || featuredUploading}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
            >
              {featuredUploading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Image grid */}
      {featuredLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : featuredImages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">No hero images yet</p>
          <p className="text-gray-400 text-sm">
            Upload images above to display in the homepage hero slider.<br />
            Default placeholder images will be used until you add your own.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredImages.map((img, idx) => (
            <div key={img.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100">
                <img
                  src={img.url}
                  alt={img.alt || `Hero image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {img.alt || `Image ${idx + 1}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {img.width && img.height ? `${img.width}×${img.height}` : "Hero slide"}
                    {" · "}Order: {idx + 1}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteFeaturedTarget(img)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
