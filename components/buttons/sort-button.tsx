"use client";

import { ArrowUpDown } from "lucide-react";

type SortButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

export function SortButton({
  label,
  isActive,
  onClick,
  className = "",
}: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[1rem] font-medium transition-colors rounded-lg ${
        isActive
          ? "text-black font-semibold bg-slate-100"
          : "text-slate-500 hover:text-black"
      } ${className}`}
    >
      {label}
      <ArrowUpDown className="w-3.5 h-3.5" />
    </button>
  );
}
