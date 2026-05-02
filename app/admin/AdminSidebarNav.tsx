"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };
type NavGroup = { label: string; links: NavLink[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    label: "Humor System",
    links: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "LLM",
    links: [
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-responses", label: "Responses" },
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
    ],
  },
  {
    label: "Config",
    links: [
      { href: "/admin/terms", label: "Terms" },
      { href: "/admin/allowed-signup-domains", label: "Allowed Domains" },
      { href: "/admin/whitelist-email-addresses", label: "Whitelist Emails" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebarNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="px-3 mb-1 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "block rounded px-3 py-2 text-sm font-medium bg-indigo-600/20 text-indigo-200 border-l-2 border-indigo-400"
                      : "block rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white border-l-2 border-transparent"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
