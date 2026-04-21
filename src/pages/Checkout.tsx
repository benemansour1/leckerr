import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { useCart } from '@/hooks/use-cart';
import { Button, Input, Card } from '@/components/ui-elements';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, CreditCard, Banknote, Truck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/i18n';
import { createOrder, getSettings } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';

const DELIVERY_FEE = 15;

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const { t, lang } = useLang();
  const { user } = useAuth();

  const checkoutSchema = z.object({
    customerName: z.string().min(2, t.checkout.nameRequired),
    customerPhone: z.string().min(9, t.checkout.phoneInvalid),
    deliveryAddress: z.string().optional(),
    notes: z.string().optional(),
    paymentMethod: z.enum(['cash', 'card', 'online'] as const)
  });
  type CheckoutForm = z.infer<typeof checkoutSchema>;

  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: getSettings,
    staleTime: 15000,
  });

  useEffect(() => {
    if (storeSettings && !storeSettings.deliveryEnabled && deliveryType === 'delivery') {
      setDeliveryType('pickup');
    }
  }, [storeSettings, deliveryType]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'cash' }
  });

  const paymentMethod = watch('paymentMethod');
  const cartTotal = getCartTotal();
  const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = cartTotal + deliveryFee;

  const orderMutation = useMutation({
    mutationFn: (data: CheckoutForm) =>
      createOrder({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: deliveryType === 'delivery' ? data.deliveryAddress : undefined,
        deliveryType,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        userId: user?.phone || data.customerPhone,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          variantName: i.variant?.nameAr,
          variantPrice: i.variant?.price,
        })),
      }),
  });

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  function getProductName(product: any): string {
    if (lang === 'he' && product.nameHe) return product.nameHe;
    return product.nameAr;
  }

  const onSubmit = async (data: CheckoutForm) => {
    if (deliveryType === 'delivery' && !data.deliveryAddress) {
      toast({ title: t.error, description: t.checkout.addressRequired, variant: 'destructive' });
      return;
    }
    try {
 await orderMutation.mutateAsync(data);

// 🔥 هون بالزبط
localStorage.setItem("phone", data.customerPhone);

clearCart();

toast({
  title: t.checkout.orderSuccess,
  description: t.checkout.orderSuccessDesc,
  className: 'bg-primary text-primary-foreground border-none'
});

setLocation('/orders');
    } catch (err: any) {
      toast({ title: t.error, description: err.message || t.checkout.orderError, variant: 'destructive' });
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gold-gradient mb-8">{t.checkout.title}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <Truck className="text-primary w-5 h-5" /> {t.checkout.deliveryMethod}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {storeSettings?.deliveryEnabled !== false && (
                  <div
                    onClick={() => setDeliveryType('delivery')}
                    className={cn(
                      'cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all',
                      deliveryType === 'delivery' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className={cn('p-3 rounded-xl', deliveryType === 'delivery' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">{t.checkout.homeDelivery}</p>
                      <p className="text-sm text-muted-foreground">{t.checkout.deliveryFee} {formatPrice(DELIVERY_FEE)}</p>
                    </div>
                  </div>
                )}
                <div
                  onClick={() => setDeliveryType('pickup')}
                  className={cn(
                    'cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all',
                    deliveryType === 'pickup' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('p-3 rounded-xl', deliveryType === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">{t.checkout.pickup}</p>
                    <p className="text-sm text-muted-foreground">{t.checkout.free}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <CheckCircle2 className="text-primary w-5 h-5" /> {t.checkout.orderInfo}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label={t.checkout.fullName} {...register('customerName')} error={errors.customerName?.message} placeholder={t.checkout.enterName} />
                <Input label={t.checkout.phone} {...register('customerPhone')} error={errors.customerPhone?.message} placeholder="05XXXXXXXX" dir="ltr" className="text-right" />
              </div>
              {deliveryType === 'delivery' && (
                <Input label={t.checkout.deliveryAddress} {...register('deliveryAddress')} placeholder={t.checkout.addressPlaceholder} required />
              )}
              <Input label={t.checkout.notes} {...register('notes')} placeholder={t.checkout.notesPlaceholder} />
            </Card>

            <Card className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                <CreditCard className="text-primary w-5 h-5" /> {t.checkout.paymentMethod}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setValue('paymentMethod', 'cash')}
                  className={cn('cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all', paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50')}
                >
                  <div className={cn('p-3 rounded-xl', paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div><p className="font-bold">{t.checkout.cash}</p><p className="text-sm text-muted-foreground">{t.checkout.cashDesc}</p></div>
                </div>
                <div
                  onClick={() => {
  toast({
    title: "قريبًا",
    description: "الدفع الإلكتروني سيكون متاح قريبًا",
  });
}}
                  className={cn('cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-4 transition-all', 'border-border opacity-60 cursor-not-allowed')}
                >
                  <div className={cn('p-3 rounded-xl', paymentMethod === 'online' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div><p className="font-bold">الدفع الإلكتروني (قريبًا)</p><p className="text-sm text-muted-foreground">
  سيتم تفعيل الدفع الإلكتروني قريبًا
</p></div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border/50">{t.checkout.orderSummary}</h3>
              <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto pe-1">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{item.quantity}x</span> {getProductName(item.product)}
                    </span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>{t.checkout.subtotal}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={deliveryType === 'delivery' ? 'text-blue-400' : 'text-emerald-400'}>
                    {deliveryType === 'delivery' ? t.checkout.deliveryFeeLabel : t.checkout.pickupLabel}
                  </span>
                  <span className={deliveryType === 'delivery' ? 'text-blue-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {deliveryType === 'delivery' ? `+${formatPrice(DELIVERY_FEE)}` : t.checkout.free}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl text-primary border-t border-border/50 pt-3">
                  <span>{t.checkout.totalLabel}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-4" isLoading={orderMutation.isPending}>
                {t.checkout.confirmOrder}
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </CustomerLayout>
  );
}
