"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{ bottom: 80 }}
      toastOptions={{
        duration: 3500,
        className: "font-sans text-sm !rounded-xl !shadow-lg",
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "13px",
          maxWidth: "340px",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
