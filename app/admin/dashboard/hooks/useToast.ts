"use client";

import { useState, useCallback } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}
