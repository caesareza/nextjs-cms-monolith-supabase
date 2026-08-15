"use client";

import "../globals.css";
import {
  Axe,
  BookmarkCheck,
  KeySquare,
  LayoutGrid,
  Megaphone,
  Menu,
  Package,
  Palette,
  PersonStanding,
  Rocket,
  Tags,
  UserPen,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import StorytellerLogo from "@/components/StorytellerLogo";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/(admin)/LogoutButton";
import { createClient } from "@/utils/supabase/client"; // Import from /client

// Define your menu structure here for easy maintenance
const NAVIGATION_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "SEO Keyword", icon: KeySquare, href: "/seo-keyword" },
  { label: "Article", icon: Rocket, href: "/article" },
  { label: "Section", icon: Axe, href: "/section" },
  { label: "Category", icon: Tags, href: "/category" },
  { label: "Writer", icon: UserPen, href: "/writer" },
  { label: "Product Tag", icon: Package, href: "/product-tag" },
  { label: "Priority Product", icon: BookmarkCheck, href: "/product-priority" },
  { label: "Theme", icon: Palette, href: "/theme" },
  { label: "Persona", icon: PersonStanding, href: "/persona" },
  { label: "Campaign", icon: Megaphone, href: "/campaign" },
];

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
      active
        ? "bg-white text-slate-900 border border-slate-200/50 shadow-2xs font-bold"
        : "text-slate-500 hover:bg-slate-100/60 hover:text-slate-900 border border-transparent"
    }`}
  >
    <Icon
      size={16}
      strokeWidth={active ? 2.2 : 1.8}
      className={
        active
          ? "text-brand-red"
          : "group-hover:scale-105 transition-transform text-slate-400 group-hover:text-brand-steel-blue"
      }
    />
    <span className="text-xs font-semibold tracking-wide">{label}</span>
    {active && (
      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
    )}
  </Link>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("user", user);
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Auto-close drawer when route path changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: close drawer on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen text-slate-900 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Backdrop overlay for mobile screens when drawer is active */}
      {isSidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click handles click-out
        // biome-ignore lint/a11y/noStaticElementInteractions: backdrop clicks close drawer
        <div
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/60 flex flex-col p-4 gap-6 bg-slate-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2.5">
            <StorytellerLogo height={28} />
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase text-slate-400 px-3 mb-2 tracking-widest">
            Navigation
          </p>

          {NAVIGATION_ITEMS.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              // Logic: Is active if the current path starts with the item's href
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="mt-auto pt-4 border-t border-slate-200/80 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-200/50 overflow-hidden border border-slate-200/50 shrink-0">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg"
                alt="User"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">
                {user?.email}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.id}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/40 w-full">
        {/* Mobile Top Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <StorytellerLogo height={28} />
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/40">
          {children}
        </main>
      </div>
    </div>
  );
}
