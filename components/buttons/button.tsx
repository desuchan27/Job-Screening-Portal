"use client";

import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

type ButtonProps = {
  children?: React.ReactNode;
  variant?: "primary" | "outlined" | "accent" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      rightIcon,
      iconOnly = false,
      onClick,
      type = "button",
      className = "",
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Base styles
    const baseStyles = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
    }`;

    // Size variants
    const sizeStyles = {
      sm: iconOnly ? "p-2" : "px-3 py-1.5 text-sm",
      md: iconOnly ? "p-2.5" : "px-4 py-2 text-base",
      lg: iconOnly ? "p-3" : "px-6 py-3 text-lg",
    };

    // Variant styles
    const variantStyles = {
      primary: `bg-black text-white hover:bg-gray-800 focus:ring-black ${
        isDisabled ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" : ""
      }`,
      outlined: `border-2 border-slate-200 bg-white text-black hover:bg-slate-50 focus:ring-slate-300 ${
        isDisabled
          ? "border-slate-100 text-gray-400 cursor-not-allowed hover:bg-white"
          : ""
      }`,
      accent: `bg-accent text-white font-semibold hover:bg-accent/90 focus:ring-accent ${
        isDisabled ? "bg-accent/50 cursor-not-allowed hover:bg-accent/50" : ""
      }`,
      ghost: `bg-slate-100 text-black hover:bg-slate-200 focus:ring-slate-300 ${
        isDisabled
          ? "bg-slate-50 text-gray-400 cursor-not-allowed hover:bg-slate-50"
          : ""
      }`,
      destructive: `bg-red-600 text-white font-bold hover:bg-red-700 focus:ring-red-500 ${
        isDisabled ? "bg-red-400 cursor-not-allowed hover:bg-red-400" : ""
      }`,
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!iconOnly && children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
