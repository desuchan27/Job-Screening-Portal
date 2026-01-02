"use client";

import { useState } from "react";

type SwitchProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(checked);
  const isChecked = onChange ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;

    const newValue = !isChecked;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalChecked(newValue);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isChecked
          ? "bg-green-500 focus:ring-green-500"
          : "bg-slate-200 focus:ring-slate-300"
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isChecked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
