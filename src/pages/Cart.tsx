import React from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { useCart } from '@/hooks/use-cart';
import { Button, Card } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { Link } from 'wouter';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useLang } from '@/i18n';

function resolveImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${import.meta.env.BASE_URL}${imageUrl}`;
}

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCart();
  const { t, lang } = useLang();

  function getProductName(product: any): string {
    if (lang === 'he' && product.nameHe) return product.nameHe;
    return product.nameAr;
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-gradient mb-8">{t.cart.title}</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border/50">
            <img src={`${import.meta.env.BASE_URL}images/empty-cart.png`} alt="Empty Cart" className="w-48 h-48 mx-auto opacity-70 mb-6 drop-shadow-xl mix-blend-screen" />
            <h2 className="text-2xl font-bold mb-4">{t.cart.empty}</h2>
            <Link href="/">
              <Button>{t.cart.browseMenu}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => {
                const price = item.variant ? item.variant.price : item.product.price;
                const displayName = getProductName(item.product);
                return (
                  <Card key={item.cartKey} className="p-4 flex sm:flex-row flex-col sm:items-center gap-4 bg-card/40 backdrop-blur-sm">
                    {resolveImage(item.product.imageUrl) ? (
                      <img src={resolveImage(item.product.imageUrl)!} alt={displayName} className="w-20 h-20 rounded-xl object-cover bg-secondary" />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-3xl">
                        🍬
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{displayName}</h3>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant.nameAr}</p>
                      )}
                      <p className="text-primary font-bold">{formatPrice(price)}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-secondary/50 rounded-full px-2 py-1 border border-border">
                      <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} className="p-1.5 hover:bg-background rounded-full transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} className="p-1.5 hover:bg-background rounded-full transition-colors text-primary">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button onClick={() => removeItem(item.cartKey)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Card>
                );
              })}
            </div>

            <div className="md:col-span-1">
              <Card className="p-6 sticky top-28 border-primary/20 shadow-primary/5">
                <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border/50">{t.cart.orderSummary}</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.cart.subtotal}</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t.cart.deliveryFee}</span>
                    <span className="text-xs">{t.cart.calculatedNext}</span>
                  </div>
                  <div className="border-t border-border/50 pt-4 flex justify-between font-bold text-xl text-primary">
                    <span>{t.cart.estimatedTotal}</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full">
                  <Button className="w-full gap-2 text-lg py-4">
                    {t.cart.checkout} <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
