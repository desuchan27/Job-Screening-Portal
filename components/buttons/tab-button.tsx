"use client";

type TabButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

export function TabButton({
  label,
  isActive,
  onClick,
  className = "",
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[1rem] font-medium transition-colors pb-[0.5rem] cursor-pointer ${
        isActive
          ? "text-black font-semibold border-b-2 border-black"
          : "text-slate-500 hover:text-slate-700"
      } ${className}`}
    >
      {label}
    </button>
  );
}
