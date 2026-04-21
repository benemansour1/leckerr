import React from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, LogOut, Package } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n';
import { useAuth } from '@/lib/auth-context';

function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'he' : 'ar')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all"
      title="שנה שפה / تغيير اللغة"
    >
      {lang === 'ar' ? '🇮🇱 עברית' : '🇸🇦 عربي'}
    </button>
  );
}

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const cartCount = useCart((s) => s.getItemCount());
  const { user, logout } = useAuth();
  const { t } = useLang();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40">
  <div className="glass-panel max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between rounded-b-3xl">
          <Link href="/" className="flex items-center gap-3 group">
            <img src={`${import.meta.env.BASE_URL}images/lecker-logo.png`} alt="Lecker" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gold-gradient">{t.store}</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageToggle />

            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -end-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md shadow-primary/40"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

         <div className="flex items-center gap-3">

  <Link
    href="/orders"
    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
  >
    <Package className="w-5 h-5" />
    <span className="hidden sm:inline">
      {t.nav.myOrders}
    </span>
  </Link>

  {user ? (
    <button
      onClick={handleLogout}
      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
    >
      <LogOut className="w-5 h-5" />
    </button>
  ) : (
    <Link
      href="/login"
      className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-sm font-bold hover:bg-primary/20 hover:text-primary transition-colors"
    >
      <User className="w-4 h-4" />
      <span className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary rounded-xl text-sm font-bold hover:bg-primary/20 hover:text-primary transition-colors">{t.nav.login}</span>
    </Link>
  )}
</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="mt-auto border-t border-border/50 bg-background/50 py-8 text-center text-muted-foreground text-sm space-y-1">
        <p>© {new Date().getFullYear()} {t.footer.rights}</p>
        <p className="text-xs opacity-60">{t.footer.credit} <span className="font-medium">bene_mansour</span></p>
      </footer>
    </div>
  );
}
