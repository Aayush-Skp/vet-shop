"use client";

import type { ToastState } from "../hooks/useToast";

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-slide-up">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {toast.type === "success" ? (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{toast.message}</span>
        <button onClick={onDismiss} className="ml-1 hover:opacity-80">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
