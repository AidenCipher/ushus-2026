"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Bell, 
  CheckSquare,
  BarChart,
  Menu,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import NotificationBell from "@/components/shared/NotificationBell";
import { StarryBackground } from "@/components/StarryBackground";

const sidebarLinks = [
  { name: "Overview", href: "/organiser", icon: LayoutDashboard },
  { name: "Tasks", href: "/organiser/tasks", icon: CheckSquare },
  { name: "Gantt Chart", href: "/organiser/gantt", icon: BarChart },
  { name: "Team Directory", href: "/organiser/team", icon: Users },
  { name: "Calendar", href: "/organiser/calendar", icon: CalendarDays },
  { name: "Notifications", href: "/organiser/notifications", icon: Bell },
];

export default function OrganiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <StarryBackground />
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-background/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-white/10 bg-indigo-950/20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight leading-tight">HQ</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">USHUS 2026</span>
              </div>
            </Link>
          </div>

          {/* User Info (Mobile Only) */}
          <div className="p-4 border-b border-white/10 lg:hidden">
            <p className="font-medium truncate">{session?.user?.name || "Organiser"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.role}</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              // Special case for exact matching on overview
              const isActuallyActive = link.href === "/organiser" ? pathname === "/organiser" : isActive;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group text-sm font-medium",
                    isActuallyActive 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[inset_2px_0_0_rgba(99,102,241,1)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <link.icon className={cn("w-5 h-5", isActuallyActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground")} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="p-2 -ml-2 rounded-md lg:hidden text-muted-foreground hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold capitalize hidden sm:block">
              {pathname.split("/").pop() === "organiser" ? "HQ Overview" : pathname.split("/").pop()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                <p className="text-xs text-indigo-400 mt-1 capitalize font-medium">{session?.user?.role?.toLowerCase()}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                {session?.user?.name?.charAt(0) || "O"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 relative">
           <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-[100px]" />
           </div>
           
           <div className="relative z-10 max-w-7xl mx-auto h-full">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
}
