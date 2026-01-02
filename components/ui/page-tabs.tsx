"use client";

import { usePathname } from "next/navigation";
import { TabButton } from "@/components/buttons/tab-button";
import Link from "next/link";

type PageTab = {
  label: string;
  href: string;
};

type PageTabsProps = {
  tabs: PageTab[];
  className?: string;
};

export function PageTabs({ tabs, className = "" }: PageTabsProps) {
  const pathname = usePathname();

  return (
    <div className={`flex items-end gap-[0.5rem] ${className}`}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link key={tab.href} href={tab.href}>
            <TabButton
              label={tab.label}
              isActive={isActive}
              onClick={() => {}}
              className="!pb-[1rem]"
            />
          </Link>
        );
      })}
    </div>
  );
}
