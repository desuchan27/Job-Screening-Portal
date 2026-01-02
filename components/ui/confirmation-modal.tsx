"use client";

import { useState } from "react";
import { Button } from "@/components/buttons/button";
import { Input } from "@/components/forms/input";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?: "warning" | "destructive";
  requireSlugConfirmation?: boolean;
  slug?: string;
  slugValue?: string;
  onSlugChange?: (value: string) => void;
  isLoading?: boolean;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "warning",
  requireSlugConfirmation = false,
  slug = "",
  slugValue = "",
  onSlugChange,
  isLoading = false,
}: ConfirmationModalProps) {
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const variantStyles = {
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      highlightBg: "bg-yellow-50",
      highlightBorder: "border-yellow-200",
      highlightText: "text-yellow-800",
      highlightSlug: "text-yellow-900",
      buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    destructive: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      highlightBg: "bg-red-50",
      highlightBorder: "border-red-200",
      highlightText: "text-red-800",
      highlightSlug: "text-red-900",
      buttonClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
  };

  const styles = variantStyles[variant];
  const canConfirm = !requireSlugConfirmation || slugValue === slug;

  const handleConfirmClick = () => {
    if (!canConfirm && requireSlugConfirmation && slugValue) {
      // Trigger shake animation when slug is incorrect
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}
          >
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>

            {requireSlugConfirmation && slug && (
              <>
                <div
                  className={`${styles.highlightBg} border ${
                    styles.highlightBorder
                  } rounded-lg p-3 mb-4 ${isShaking ? "animate-shake" : ""}`}
                >
                  <p className={`text-sm ${styles.highlightText}`}>
                    To confirm, please type the job slug:
                  </p>
                  <p
                    className={`text-sm font-mono font-semibold ${styles.highlightSlug} mt-1`}
                  >
                    {slug}
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="Type job slug to confirm"
                  value={slugValue}
                  onChange={(e) => onSlugChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canConfirm) {
                      e.preventDefault();
                      onConfirm();
                    } else if (e.key === "Enter" && !canConfirm) {
                      e.preventDefault();
                      setIsShaking(true);
                      setTimeout(() => setIsShaking(false), 500);
                    } else if (e.key === "Escape") {
                      onClose();
                    }
                  }}
                  autoFocus
                  size="sm"
                  className={isShaking ? "animate-shake" : ""}
                />
              </>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmClick}
                disabled={isLoading}
                isLoading={isLoading}
                className={`flex-1 ${styles.buttonClass} ${
                  !canConfirm && !isLoading ? "opacity-50" : ""
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
