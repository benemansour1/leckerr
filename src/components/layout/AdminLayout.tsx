import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  Settings,
  LogOut,
  BarChart3,
  CalendarDays,
  MonitorSmartphone,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n";
import { useAuth } from "@/lib/auth-context";

function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "ar" ? "he" : "ar")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-border/50 hover:bg-secondary transition"
    >
      {lang === "ar" ? "🇮🇱 עברית" : "🇸🇦 عربي"}
    </button>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logout, isAdmin } = useAuth();
  const { t } = useLang();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      setLocation("/admin/login");
    }
  }, [user, isLoading, isAdmin]);

 if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );
}


  const navItems = [
    { name: t.admin.dashboard, href: "/admin/dashboard", icon: LayoutDashboard },
    { name: t.admin.orders, href: "/admin/orders", icon: ShoppingBag },
    { name: t.admin.products, href: "/admin/products", icon: PackageOpen },
    { name: t.admin.revenueDaily, href: "/admin/revenue/daily", icon: CalendarDays },
    { name: t.admin.revenueMonthly, href: "/admin/revenue/monthly", icon: BarChart3 },
    { name: t.admin.sessions, href: "/admin/sessions", icon: MonitorSmartphone },
    { name: t.admin.settings, href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* 🔥 Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-72 bg-background z-[100] transition-transform duration-300 flex flex-col",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0 lg:relative"
        )}
      >
        <div className="h-full flex flex-col border-e border-border/50 glass-panel">

          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-border/50">
            <span className="text-lg font-bold text-gold-gradient">
              {t.admin.title}
            </span>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-xl"
            >
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 space-y-2">
            <LanguageToggle />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              {t.admin.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
        />
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* 🔥 Mobile Header */}
        <header className="flex lg:hidden items-center justify-between px-4 h-16 border-b border-border/50 glass-panel">

          {/* زر السايدبار */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-primary text-primary-foreground"
          >
            <Menu size={20} />
          </button>

          <span className="font-bold">{t.admin.title}</span>

          {/* زر اللغة (رجعناه طبيعي) */}
          <LanguageToggle />
        </header>

        {/* Content */}
      <div>
  {children}
</div>
      </main>
    </div>
  );
}