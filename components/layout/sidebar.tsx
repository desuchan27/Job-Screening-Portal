"use client";

import {
  HomeIcon,
  PlusIcon,
  BriefcaseIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/buttons/logout-button";

const RecruitmentLinks = [
  {
    href: "/",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    href: "/recruitment",
    label: "Recruitment",
    icon: BriefcaseIcon,
  },
  {
    href: "/add-job",
    label: "New Job",
    icon: PlusIcon,
  },
  {
    href: "/applicants",
    label: "Applicants",
    icon: UsersIcon,
  },
];

const AccountLinks = [
  {
    href: "/settings",
    label: "Settings",
    icon: SettingsIcon,
  },
  //   {
  //     href: "/logout",
  //     label: "Logout",
  //     icon: LogOutIcon,
  //   },
];

function SidebarLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive ? "bg-slate-100" : "hover:bg-slate-50"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{children}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  return (
    <nav className="w-48 xl:w-64 bg-white border-r border-slate-200 sticky top-0 left-0 h-screen px-[1rem] py-[1.5rem] flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="flex flex-col gap-6">
        {/* Recruitment Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-600 px-3">
            Recruitment
          </h3>
          <ul className="flex flex-col gap-1">
            {RecruitmentLinks.map((link) => (
              <SidebarLink key={link.href} href={link.href} icon={link.icon}>
                {link.label}
              </SidebarLink>
            ))}
          </ul>
        </div>

        {/* Account Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-600 px-3">Account</h3>
          <ul className="flex flex-col gap-1">
            {AccountLinks.map((link) => (
              <SidebarLink key={link.href} href={link.href} icon={link.icon}>
                {link.label}
              </SidebarLink>
            ))}
            <LogoutButton />
          </ul>
        </div>
      </div>
    </nav>
  );
}
