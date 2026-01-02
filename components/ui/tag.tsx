"use client";

import { X } from "lucide-react";

type TagProps = {
  children: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
};

export function Tag({ children, onRemove, onClick, className = "" }: TagProps) {
  return (
    <div
      className={`inline-flex items-center gap-[0.5rem] px-3 py-1.5 bg-slate-100 text-black rounded-full text-sm ${
        onClick ? "cursor-pointer hover:bg-slate-200" : ""
      } ${className}`}
      onClick={onClick}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent tag click when clicking X
            onRemove();
          }}
          className="hover:bg-slate-300 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
