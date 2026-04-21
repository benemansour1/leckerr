import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button, Card } from '@/components/ui-elements';
import { useCart, ProductVariant } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { Plus, ShoppingCart, X, MoonStar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLang } from '@/i18n';
import { subscribeToProducts, getSettings, type Product } from '@/lib/firestore';

const CATEGORIES_DB = ['الكل', 'بانكيك', 'كريب', 'وافل', 'بوظة', 'مشروبات ساخنة', 'مشروبات باردة', 'بيرا', 'أكل', 'حلويات خاصة'];

const CATEGORY_EMOJI: Record<string, string> = {
  'بانكيك': '🥞',
  'كريب': '🫔',
  'وافل': '🧇',
  'بوظة': '🍨',
  'أكل': '🍔',
  'مشروبات ساخنة': '☕',
  'مشروبات باردة': '🥤',
  'بيرا': '🍺',
  'حلويات خاصة': '🍫',
};

function resolveImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${import.meta.env.BASE_URL}${imageUrl}`;
}

function getProductName(product: Product, lang: string): string {
  if (lang === 'he' && product.nameHe) return product.nameHe;
  return product.nameAr;
}

function VariantDialog({
  product,
  onSelect,
  onClose,
  lang,
}: {
  product: Product;
  onSelect: (variant: ProductVariant) => void;
  onClose: () => void;
  lang: string;
}) {
  const { t } = useLang();
  const variants = product.variants ?? [];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold">{getProductName(product, lang)}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground text-sm mb-5">{t.home.chooseSize}</p>
          <div className="space-y-3">
            {variants.map((v) => (
              <button
                key={v.nameAr}
                onClick={() => onSelect(v)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 border-border hover:border-primary bg-secondary/30 hover:bg-primary/10 transition-all group"
              >
                <span className="font-bold group-hover:text-primary">{v.nameAr}</span>
                <span className="font-bold text-primary text-lg">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { t, lang } = useLang();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToProducts(activeCategory, (data) => {
      setProducts(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [activeCategory]);

  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: getSettings,
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    if (storeSettings && !storeSettings.isOpen) {
      toast({ title: t.home.storeClosedToast, description: t.home.storeClosedToastDesc, variant: 'destructive', duration: 3000 });
      return;
    }
    const variants = product.variants ?? [];
    if (variants.length > 0) {
      setVariantProduct(product);
    } else {
      addItem(product as any);
      toast({ title: t.home.addedToCart, description: getProductName(product, lang), duration: 2000 });
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!variantProduct) return;
    addItem(variantProduct as any, 1, variant);
    toast({
      title: t.home.addedToCart,
      description: `${getProductName(variantProduct, lang)} — ${variant.nameAr}`,
      duration: 2000,
    });
    setVariantProduct(null);
  };

  const isClosed = storeSettings && !storeSettings.isOpen;

  return (
    <CustomerLayout>
      <AnimatePresence>
        {isClosed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center px-8 py-12 max-w-sm"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center border border-border">
                <MoonStar className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-3xl font-bold mb-3">{t.home.storeClosed}</h2>
              <p className="text-muted-foreground text-lg">{t.home.storeClosedDesc}</p>
              <p className="text-muted-foreground text-sm mt-2">{t.home.storeClosedSoon}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {variantProduct && (
        <VariantDialog
          product={variantProduct}
          onSelect={handleVariantSelect}
          onClose={() => setVariantProduct(null)}
          lang={lang}
        />
      )}

      <div className="relative rounded-3xl overflow-hidden mb-12 h-64 sm:h-80 shadow-2xl shadow-black/50 border border-border/50 group">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center p-8 sm:p-12">
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold text-gold-gradient mb-4 drop-shadow-lg"
            >
              {t.home.hero}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-muted-foreground mb-2"
            >
              {t.home.heroSub}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-sm sm:text-base text-primary/70 font-medium tracking-wide"
            >
              {t.categories['بانكيك']} &nbsp;•&nbsp; {t.categories['كريب']} &nbsp;•&nbsp; {t.categories['وافل']} &nbsp;•&nbsp; {t.categories['بوظة']} &nbsp;•&nbsp; {t.categories['حلويات خاصة']}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES_DB.map((cat) => {
          const displayLabel = cat === 'الكل' ? t.categories.all : (t.categories[cat as keyof typeof t.categories] || cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary'
              )}
            >
              {CATEGORY_EMOJI[cat] && <span>{CATEGORY_EMOJI[cat]}</span>}
              {displayLabel}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <Card key={i} className="h-60 animate-pulse bg-secondary/50 border-none" />
          ))}
        </div>
      ) : !products?.length ? (
        <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-border">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-foreground">{t.home.noProducts}</h3>
          <p className="text-muted-foreground mt-2">{t.home.noProductsDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products?.map((product, idx) => {
            const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
            const displayName = getProductName(product, lang);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <Card className="h-full flex flex-col group border-transparent hover:border-primary/50 transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                    {resolveImage(product.imageUrl) ? (
                      <img src={resolveImage(product.imageUrl)!} alt={displayName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/80 to-background/60">
                        <span className="text-5xl drop-shadow-lg select-none">
                          {CATEGORY_EMOJI[product.category ?? ''] ?? '🍬'}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 end-2 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-primary border border-primary/20 shadow">
                      {hasVariants ? `${lang === 'he' ? 'מ-' : 'من '} ${formatPrice(product.variants[0].price)}` : formatPrice(product.price)}
                    </div>
                    {hasVariants && (
                      <div className="absolute top-2 start-2 bg-amber-500/90 px-2 py-0.5 rounded-full text-xs font-bold text-background">
                        {t.home.chooseSize2}
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1">{displayName}</h3>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border border-primary/30 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {hasVariants ? t.home.chooseAdd : t.home.addToCart}
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}
