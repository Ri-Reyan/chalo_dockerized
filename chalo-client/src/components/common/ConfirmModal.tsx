"use client";

import React, { useEffect } from "react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isAlertOnly?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isAlertOnly = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirmAction = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getVariantIcon = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "🛑",
          bg: "bg-rose-50 border-rose-200 text-rose-600",
          confirmBtn:
            "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
        };
      case "warning":
        return {
          icon: "⚠️",
          bg: "bg-amber-50 border-amber-200 text-amber-600",
          confirmBtn:
            "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
        };
      case "success":
        return {
          icon: "✓",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-600",
          confirmBtn:
            "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
        };
      case "info":
      default:
        return {
          icon: "ℹ️",
          bg: "bg-stone-100 border-stone-200 text-stone-700",
          confirmBtn:
            "bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] shadow-stone-200",
        };
    }
  };

  const currentVariant = getVariantIcon();

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Top Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shrink-0 shadow-2xs ${currentVariant.bg}`}
          >
            {currentVariant.icon}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#292524] leading-snug">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {isAlertOnly ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-5 rounded-2xl bg-[#FFB7B2] hover:bg-[#FF9E98] text-[#292524] font-extrabold text-sm tracking-wide shadow-xs transition-all hover:scale-[1.01] active:scale-95"
            >
              {confirmText || "Got it"}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`py-3 px-4 rounded-xl font-extrabold text-xs shadow-xs transition-all hover:scale-[1.01] active:scale-95 ${currentVariant.confirmBtn}`}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

