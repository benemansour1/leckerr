import React, { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui-elements';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Store, Truck } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/firestore';

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
  });

  const { register, reset, watch } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const isOpen = watch('isOpen');
  const deliveryEnabled = watch('deliveryEnabled');

  const handleToggle = async (field: 'isOpen' | 'deliveryEnabled', value: boolean) => {
    try {
      await updateMutation.mutateAsync({ [field]: value });
      toast({ title: value ? '✅ تم التفعيل' : '🔴 تم الإيقاف' });
    } catch {
      toast({ title: 'خطأ في الحفظ', variant: 'destructive' });
    }
  };

  if (isLoading) return <AdminLayout><Card className="h-96 animate-pulse bg-secondary/50 border-none" /></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gold-gradient mb-8">إعدادات المتجر</h1>

      <div className="space-y-6 max-w-2xl">
        <Card className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
            <Store className="text-primary" /> حالة المتجر
          </h2>
          <label
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${isOpen ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30'}`}
            onClick={() => handleToggle('isOpen', !isOpen)}
          >
            <div>
              <p className="font-bold text-lg">{isOpen ? '🟢 المتجر مفتوح' : '🔴 المتجر مغلق'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOpen
                  ? 'العملاء يمكنهم تصفح المنتجات وإرسال الطلبات'
                  : 'العملاء سيرون شاشة "المتجر مغلق" فوراً'}
              </p>
            </div>
            <div className="relative inline-block w-14 h-8 shrink-0">
              <input type="checkbox" {...register('isOpen')} className="peer sr-only" readOnly checked={!!isOpen} />
              <div className={`w-14 h-8 rounded-full transition-colors ${isOpen ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${isOpen ? 'start-1' : 'end-1'}`}></div>
            </div>
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
            <Truck className="text-primary" /> إعدادات التوصيل
          </h2>
          <label
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${deliveryEnabled ? 'border-primary bg-primary/5' : 'border-border bg-secondary/30'}`}
            onClick={() => handleToggle('deliveryEnabled', !deliveryEnabled)}
          >
            <div>
              <p className="font-bold text-lg">{deliveryEnabled ? '🚗 التوصيل مفعّل' : '⛔ التوصيل موقوف'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {deliveryEnabled
                  ? 'العملاء يمكنهم اختيار التوصيل للمنزل (15₪)'
                  : 'يمكن للعملاء الطلب للاستلام فقط'}
              </p>
            </div>
            <div className="relative inline-block w-14 h-8 shrink-0">
              <input type="checkbox" {...register('deliveryEnabled')} className="peer sr-only" readOnly checked={!!deliveryEnabled} />
              <div className={`w-14 h-8 rounded-full transition-colors ${deliveryEnabled ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${deliveryEnabled ? 'start-1' : 'end-1'}`}></div>
            </div>
          </label>
        </Card>
      </div>
    </AdminLayout>
  );
}
