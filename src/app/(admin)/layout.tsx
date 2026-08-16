"use client";

import "../globals.css";
import {
  Axe,
  BookmarkCheck,
  KeySquare,
  LayoutGrid,
  Loader2,
  Megaphone,
  Menu,
  Package,
  Palette,
  PersonStanding,
  Rocket,
  ShieldAlert,
  Tags,
  UserPen,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/(admin)/LogoutButton";
import StorytellerLogo from "@/components/StorytellerLogo";
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
    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${active
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
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadUserAndRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          // Query the user_roles table to get the role mapped to this email
          const { data, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("email", user.email)
            .single();

          if (error) {
            console.warn(
              "User role mapping not found. Defaulting to viewer:",
              error.message,
            );
            setRole("viewer");
          } else {
            setRole(data?.role || "viewer");
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error("Authentication mapping failed:", err);
        setRole("viewer");
      } finally {
        setLoading(false);
      }
    };
    loadUserAndRole();
  }, [supabase]);

  // Auto-close drawer when route path changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: close drawer on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const currentRole = role || "viewer";

  // Menu navigation filtration based on active user role
  const allowedNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (currentRole === "super_admin" || currentRole === "seo_analyst")
      return true;
    if (currentRole === "author") {
      return (
        item.href === "/" ||
        item.href === "/article" || item.href.startsWith("/article/")
      )
    }
    if (currentRole === "approver" || currentRole === "viewer") {
      return (
        item.href === "/" ||
        item.href === "/article" ||
        item.href.startsWith("/article/") ||
        item.href === "/seo-keyword" ||
        item.href.startsWith("/seo-keyword/")
      );
    }
    return false;
  });

  // URL Path Guarding logic
  const isRouteAllowed = (path: string, r: string): boolean => {
    if (r === "super_admin" || r === "seo_analyst") return true;

    const isHome = path === "/";
    const isArticle = path === "/" || path === "/article" || path.startsWith("/article/");
    const isSeoKeyword =
      path === "/seo-keyword" || path.startsWith("/seo-keyword/");

    if (r === "author") {
      return isArticle;
    }
    if (r === "approver" || r === "viewer") {
      return isHome || isArticle || isSeoKeyword;
    }
    return false;
  };

  const routeAllowed = loading ? true : isRouteAllowed(pathname, currentRole);

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    const selectedRole = e.target.value;
    setIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert(
          { email: user.email, role: selectedRole },
          { onConflict: "email" },
        );
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Failed to update dev role: " + (err as any).message);
    } finally {
      setIsUpdatingRole(false);
    }
  };

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
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/60 flex flex-col p-4 gap-6 bg-slate-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
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

          {allowedNavItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              // Logic: Is active if the current path starts with the item's href
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* User Profile at Bottom */}
        <div className="mt-auto pt-4 border-t border-slate-200/80 flex flex-col gap-3">
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
              <span className="text-[10px] text-slate-400 truncate uppercase tracking-widest font-black text-brand-red">
                {currentRole.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Development Role Selector Switcher */}
          {user && (
            <div className="px-2 py-2 border-t border-slate-100 flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 select-none">
                {isUpdatingRole ? (
                  <Loader2 size={10} className="animate-spin text-brand-red" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                )}
                Testing Role Selector
              </label>
              <select
                value={currentRole}
                onChange={handleRoleChange}
                disabled={isUpdatingRole}
                className="w-full p-2 bg-slate-100 border-none text-slate-700 text-xs font-black rounded-lg outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-light-blue/20 transition-all cursor-pointer"
              >
                <option value="super_admin">Super Admin</option>
                <option value="author">Author</option>
                <option value="approver">Approver</option>
                <option value="viewer">Viewer (Read-Only)</option>
                <option value="seo_analyst">SEO Analyst</option>
              </select>
            </div>
          )}

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
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/40 relative">
          {loading ? (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={24} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Loading User Account...
                </span>
              </div>
            </div>
          ) : !routeAllowed ? (
            <div className="min-h-[80vh] flex items-center justify-center p-8">
              <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Access Denied
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Restricted Path Authorization
                  </p>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  Your active role{" "}
                  <span className="font-bold text-slate-700 uppercase">
                    ({currentRole.replace("_", " ")})
                  </span>{" "}
                  does not have authorized credentials to access this menu.
                </p>
                <Link
                  href="/"
                  className="w-full inline-block py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95 text-center cursor-pointer"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
