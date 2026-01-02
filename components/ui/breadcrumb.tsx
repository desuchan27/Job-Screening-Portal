"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      className={`flex flex-wrap items-center gap-[0.5rem] text-[0.875rem] ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-slate-600 hover:text-slate-900 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? "text-slate-900 font-semibold" : "text-slate-600"
                }
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>
        );
      })}
    </nav>
  );
}
