"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Standardized Chalo Toast Helper
 * Styled to seamlessly harmonize with Chalo's Softly design palette.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, {
      description,
      duration: 4000,
    }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, {
      description,
      duration: 5000,
    }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, {
      description,
      duration: 4000,
    }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, {
      description,
      duration: 4500,
    }),

  loading: (message: string, description?: string) =>
    sonnerToast.loading(message, {
      description,
    }),

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

export default toast;

