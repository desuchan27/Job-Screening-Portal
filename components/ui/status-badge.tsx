"use client";

type StatusBadgeProps = {
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusStyles = {
    DRAFT: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
  };

  const statusLabels = {
    DRAFT: "Draft",
    ACTIVE: "Open",
    CLOSED: "Closed",
    ARCHIVED: "Archived",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}
