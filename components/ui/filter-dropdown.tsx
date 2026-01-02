"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type FilterOption = {
  label: string;
  value: string;
  color?: string;
};

type FilterDropdownProps = {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FilterDropdown({
  options,
  value,
  onChange,
  className = "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  // Get color class based on status
  const getColorClass = (optionValue: string) => {
    switch (optionValue) {
      case "DRAFT":
        return "bg-orange-500";
      case "ACTIVE":
        return "bg-green-500";
      case "CLOSED":
        return "bg-red-500";
      case "ARCHIVED":
        return "bg-slate-400";
      default:
        return "bg-slate-300";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-[1rem] font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        {selectedOption?.value !== "All" && (
          <div
            className={`w-2 h-2 rounded-full ${getColorClass(
              selectedOption?.value || ""
            )}`}
          />
        )}
        <span>{selectedOption?.label || "Select..."}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors text-left ${
                option.value === value ? "bg-slate-50 font-medium" : ""
              } ${index === 0 ? "rounded-t-lg" : ""} ${
                index === options.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              {option.value !== "All" && (
                <div
                  className={`w-2 h-2 rounded-full ${getColorClass(
                    option.value
                  )}`}
                />
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
