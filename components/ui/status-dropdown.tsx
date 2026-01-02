"use client";

import { Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { JOB_STATUS_OPTIONS } from "@/lib/job-utils";

type StatusOption = {
  value: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  label: string;
  color: string;
  icon: React.ReactNode;
};

type StatusDropdownProps = {
  value: "DRAFT" | "ACTIVE" | "CLOSED";
  onChange: (value: "DRAFT" | "ACTIVE" | "CLOSED") => void;
  disabled?: boolean;
};

// Map JOB_STATUS_OPTIONS to include icons and colors
const statusOptions: StatusOption[] = JOB_STATUS_OPTIONS.filter(
  (opt) => opt.value !== "ARCHIVED" // Exclude ARCHIVED from dropdown
).map((opt) => {
  const colorMap = {
    DRAFT: { color: "#F97316", bgClass: "bg-orange-500" },
    ACTIVE: { color: "#10B981", bgClass: "bg-green-500" },
    CLOSED: { color: "#6B7280", bgClass: "bg-gray-500" },
    ARCHIVED: { color: "#94A3B8", bgClass: "bg-slate-400" },
  };

  const { color, bgClass } = colorMap[opt.value];

  return {
    value: opt.value,
    label: opt.label,
    color,
    icon: <div className={`w-2.5 h-2.5 rounded-full ${bgClass}`} />,
  };
});

export function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = statusOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {selectedOption?.icon}
        <span className="font-medium">{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value as "DRAFT" | "ACTIVE" | "CLOSED");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                option.value === value ? "bg-slate-50" : ""
              } ${
                option.value === statusOptions[0].value
                  ? "rounded-t-lg"
                  : option.value ===
                    statusOptions[statusOptions.length - 1].value
                  ? "rounded-b-lg"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              {option.value === value && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
