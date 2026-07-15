'use client';

import "../globals.css";
import { LayoutGrid, Rocket, Search, Tags, UserPen, Package, KeySquare, Axe, Palette, PersonStanding, Megaphone } from 'lucide-react';
import Link from "next/link";
import {usePathname} from "next/navigation";
import { createClient } from '@/utils/supabase/client'; // Import from /client
import { useEffect, useState } from 'react';
import LogoutButton from "@/app/(admin)/LogoutButton";

// Define your menu structure here for easy maintenance
const NAVIGATION_ITEMS = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/' },
    { label: 'Article', icon: Rocket, href: '/article' },
    { label: 'Section', icon: Axe, href: '/section' },
    { label: 'Category', icon: Tags, href: '/category' },
    { label: 'Writer', icon: UserPen, href: '/writer' },
    { label: 'Product Tag', icon: Package, href: '/product-tag' },
    { label: 'SEO Keyword', icon: KeySquare, href: '/seo-keyword' },
    { label: 'Theme', icon: Palette, href: '/theme' },
    { label: 'Persona', icon: PersonStanding, href: '/persona' },
    { label: 'Campaign', icon: Megaphone, href: '/campaign' },
];

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
            active
                ? 'bg-brand-accent/10 text-brand-accent shadow-sm'
                : 'text-slate-500 hover:bg-brand-cream/60 hover:text-brand-navy'
        }`}
    >
        <Icon size={18} className={active ? 'text-brand-accent' : 'group-hover:scale-110 transition-transform text-slate-400 group-hover:text-brand-steel-blue'} />
        <span className="text-sm font-semibold">{label}</span>
        {active && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
        )}
    </Link>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();

    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    const getUser = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        console.log('user', user)
        setUser(user);
    };

    useEffect(() => {
        getUser();
    }, []);



  return (
      <div className="flex h-screen  text-slate-900 font-sans transition-colors duration-300">
          {/* Sidebar */}
          <aside className="w-64 border-r border-brand-light-blue/20 flex flex-col p-4 gap-6 bg-brand-cream/30">
              <div className="flex items-center gap-2.5 px-2 py-4">
                  <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shadow-lg shadow-brand-red/20">
                      <svg className="w-5 h-5 text-brand-cream" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="15" y="15" width="70" height="70" rx="20" fill="currentColor" />
                          <rect x="30" y="30" width="40" height="30" rx="8" fill="#1D3557" />
                          <path d="M35 55L32 63L43 59" fill="#1D3557" />
                      </svg>
                  </div>
                  <span className="font-extrabold tracking-tight text-xl text-brand-navy">Post<span className="text-brand-red font-light">hinks</span></span>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 px-3 mb-2 tracking-widest">
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
              <div className="mt-auto pt-4 border-t border-brand-light-blue/15">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-brand-light-blue/20 overflow-hidden border border-brand-light-blue/30">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg" alt="User" />
                      </div>
                      <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate">{user?.email}</span>
                          <span className="text-[10px] text-slate-500 truncate">{user?.id}</span>
                      </div>
                  </div>
              </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white backdrop-blur-md z-10">
                  <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                          type="text"
                          placeholder="Search projects..."
                          className="w-full border border-brand-light-blue/30 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-steel-blue/30 focus:border-brand-steel-blue transition-all placeholder:text-slate-400"
                      />
                  </div>

                  <div className="flex items-center gap-5">
                      <div className="hidden md:flex gap-5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
                      </div>
                      <LogoutButton />
                  </div>
              </header>

              {/* Content */}
              <main className="flex-1 overflow-y-auto p-8">
                  {children}
              </main>
          </div>
      </div>
  );
}
