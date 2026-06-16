'use client';

import "../globals.css";
import { LayoutGrid, Rocket, Search, Cookie, UserPen } from 'lucide-react';
import Link from "next/link";
import {usePathname} from "next/navigation";
import { createClient } from '@/utils/supabase/client'; // Import from /client
import { useEffect, useState } from 'react';
import LogoutButton from "@/app/(admin)/LogoutButton";

// Define your menu structure here for easy maintenance
const NAVIGATION_ITEMS = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/' },
    { label: 'Article', icon: Rocket, href: '/article' },
    { label: 'Category', icon: Cookie, href: '/category' },
    { label: 'Writer', icon: UserPen, href: '/writer' },
    { label: 'Product Tag', icon: UserPen, href: '/product-tag' },
];

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
            active
                ? 'bg-red-50 text-red-500 dark:bg-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
        }`}
    >
        <Icon size={18} className={active ? 'text-red-600 dark:text-red-400' : 'group-hover:scale-110 transition-transform'} />
        <span className="text-sm font-semibold">{label}</span>
        {active && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 animate-pulse" />
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
      <div className="flex h-screen bg-slate-100  text-slate-900 font-sans transition-colors duration-300">
          {/* Sidebar */}
          <aside className="w-64 border-r border-slate-300  flex flex-col p-4 gap-6 bg-slate-50">
              <div className="flex items-center gap-2 px-2 py-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                      <Rocket size={18} className="text-slate-700" />
                  </div>
                  <span className="font-bold tracking-tight text-xl">OCBC</span>
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
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
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
                          className="w-full border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-slate-400"
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
