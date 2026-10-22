"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export const ToasterProvider: React.FC = () => {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "chalo-toast !font-sans !rounded-2xl !p-4 !shadow-xl !border !border-stone-200/90",
        style: {
          background: "#FFFFFF",
          color: "#292524",
          fontSize: "0.875rem",
        },
      }}
    />
  );
};

export default ToasterProvider;

