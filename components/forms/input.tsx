"use client";

import { CalendarIcon, X } from "lucide-react";
import { forwardRef } from "react";

type InputProps = {
  label?: string;
  isMandatory?: boolean;
  type?: "text" | "email" | "password" | "date" | "search";
  variant?: "default" | "textarea" | "search";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onKeyDown?: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClear?: () => void;
  name?: string;
  id?: string;
  rows?: number;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  autoFocus?: boolean;
  showClearButton?: boolean;
};

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(
  (
    {
      label,
      isMandatory = false,
      type = "text",
      variant = "default",
      size = "md",
      placeholder,
      value,
      onChange,
      onKeyDown,
      onClear,
      name,
      id,
      rows = 4,
      className = "",
      leftIcon,
      rightIcon,
      autoFocus = false,
      showClearButton = false,
    },
    ref
  ) => {
    // Size variants to match button sizes
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-[1rem] py-[0.5rem] text-base",
      lg: "px-6 py-3 text-lg",
    };

    const baseClasses = `w-full ${sizeClasses[size]} border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-transparent transition-all`;
    
    // Enhanced styling for search variant

    const inputId = id || name;
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon || (showClearButton && value);
    const hasClearButton = showClearButton && value && value.length > 0;

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {isMandatory && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {variant === "textarea" ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            rows={rows}
            autoFocus={autoFocus}
            className={baseClasses}
          />
        ) : type === "date" ? (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type="date"
            id={inputId}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            className={baseClasses}
          />
        ) : (leftIcon || hasRightIcon) ? (
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {leftIcon}
              </div>
            )}
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              type={type === "search" ? "text" : type}
              id={inputId}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              autoFocus={autoFocus}
              className={`${baseClasses} ${
                hasLeftIcon ? "pl-10" : ""
              } ${
                hasRightIcon ? "pr-10" : ""
              }`}
            />
            {hasRightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {hasClearButton && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {rightIcon && (
                  <div className="text-gray-400">
                    {rightIcon}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type === "search" ? "text" : type}
            id={inputId}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            className={`${baseClasses}`}
          />
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
