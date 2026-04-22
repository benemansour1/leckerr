import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Card } from '@/components/ui-elements';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import {
  Store,
  Truck,
  Lock,
} from 'lucide-react';
import {
  getSettings,
  updateSettings,
} from '@/lib/firestore';
import { useLang } from '@/i18n';

export default function AdminSettings() {

  const { t } = useLang();

  const language =
    localStorage.getItem('language') || 'ar';

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      updateSettings(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings'],
      });

      queryClient.invalidateQueries({
        queryKey: ['store-settings'],
      });
    },
  });

  const { register, reset, watch } = useForm();

  const [deliveryFee, setDeliveryFee] =
    useState(15);

  const [oldPassword, setOldPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  useEffect(() => {
    if (settings) {
      reset(settings);

      setDeliveryFee(
        settings?.deliveryFee || 15
      );
    }
  }, [settings, reset]);

  const isOpen = watch('isOpen');

  const deliveryEnabled =
    watch('deliveryEnabled');

  const handleToggle = async (
    field:
      | 'isOpen'
      | 'deliveryEnabled',
    value: boolean
  ) => {
    try {

      await updateMutation.mutateAsync({
        [field]: value,
      });

      toast({
        title: value
          ? '✅ تم التفعيل'
          : '🔴 تم الإيقاف',
      });

    } catch {

      toast({
        title:
          language === 'he'
            ? 'שגיאה בשמירה'
            : 'خطأ في الحفظ',

        variant: 'destructive',
      });
    }
  };

  const saveDeliveryFee = async () => {
    try {

      await updateMutation.mutateAsync({
        deliveryFee: Number(
          deliveryFee
        ),
      });

      toast({
        title:
          language === 'he'
            ? '✅ מחיר משלוח נשמר'
            : '✅ تم حفظ سعر التوصيل',
      });

    } catch {

      toast({
        title:
          language === 'he'
            ? 'שגיאה בשמירה'
            : 'خطأ في الحفظ',

        variant: 'destructive',
      });
    }
  };

  const changePassword = async () => {

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast({
        title:
          language === 'he'
            ? 'מלא את כל השדות'
            : 'املأ جميع الحقول',

        variant: 'destructive',
      });

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast({
        title:
          language === 'he'
            ? 'הסיסמאות אינן תואמות'
            : 'كلمات المرور غير متطابقة',

        variant: 'destructive',
      });

      return;
    }

    try {


      const currentPassword =
  (settings as any)?.adminPassword ||
  'admin123';

if (
  oldPassword !==
  currentPassword
) {

  toast({
    title:
      language === 'he'
        ? 'סיסמה נוכחית שגויה'
        : 'كلمة المرور الحالية غير صحيحة',

    variant:
      'destructive',
  });

  return;
}

      await updateMutation.mutateAsync({
        adminPassword:
          newPassword,
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title:
          language === 'he'
            ? '✅ הסיסמה עודכנה'
            : '✅ تم تحديث كلمة المرور',
      });

    } catch {

      toast({
        title:
          language === 'he'
            ? 'שגיאה בעדכון סיסמה'
            : 'خطأ بتحديث كلمة المرور',

        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <Card className="h-96 animate-pulse bg-secondary/50 border-none" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <h1 className="text-3xl font-bold text-gold-gradient mb-8">
        {language === 'he'
          ? 'הגדרות החנות'
          : 'إعدادات المتجر'}
      </h1>

      <div className="space-y-6 max-w-2xl">

        <Card className="p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
            <Store className="text-primary" />

            {language === 'he'
              ? 'מצב החנות'
              : 'حالة المتجر'}
          </h2>

          <label
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
              isOpen
                ? 'border-primary bg-primary/5'
                : 'border-border bg-secondary/30'
            }`}
            onClick={() =>
              handleToggle(
                'isOpen',
                !isOpen
              )
            }
          >
            <div>

              <p className="font-bold text-lg">
                {isOpen
                  ? (
                    language === 'he'
                      ? '🟢 החנות פתוחה'
                      : '🟢 المتجر مفتوح'
                  )
                  : (
                    language === 'he'
                      ? '🔴 החנות סגורה'
                      : '🔴 المتجر مغلق'
                  )}
              </p>

              <p className="text-sm text-muted-foreground mt-1">

                {isOpen
                  ? (
                    language === 'he'
                      ? 'לקוחות יכולים לבצע הזמנות'
                      : 'العملاء يمكنهم تصفح المنتجات وإرسال الطلبات'
                  )
                  : (
                    language === 'he'
                      ? 'הלקוחות יראו שהחנות סגורה'
                      : 'العملاء سيرون شاشة "المتجر مغلق" فوراً'
                  )}
              </p>
            </div>

            <div className="relative inline-block w-14 h-8 shrink-0">

              <input
                type="checkbox"
                {...register('isOpen')}
                className="peer sr-only"
                readOnly
                checked={!!isOpen}
              />

              <div
                className={`w-14 h-8 rounded-full transition-colors ${
                  isOpen
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
              />

              <div
                className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${
                  isOpen
                    ? 'start-1'
                    : 'end-1'
                }`}
              />
            </div>
          </label>
        </Card>

        <Card className="p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
            <Truck className="text-primary" />

            {language === 'he'
              ? 'הגדרות משלוח'
              : 'إعدادات التوصيل'}
          </h2>

          <label
            className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
              deliveryEnabled
                ? 'border-primary bg-primary/5'
                : 'border-border bg-secondary/30'
            }`}
            onClick={() =>
              handleToggle(
                'deliveryEnabled',
                !deliveryEnabled
              )
            }
          >
            <div>

              <p className="font-bold text-lg">
                {deliveryEnabled
                  ? (
                    language === 'he'
                      ? '🚗 המשלוח פעיל'
                      : '🚗 التوصيل مفعّل'
                  )
                  : (
                    language === 'he'
                      ? '⛔ המשלוח כבוי'
                      : '⛔ التوصيل موقوف'
                  )}
              </p>

              <p className="text-sm text-muted-foreground mt-1">

                {deliveryEnabled
                  ? (
                    language === 'he'
                      ? 'לקוחות יכולים לבחור משלוח לבית'
                      : 'العملاء يمكنهم اختيار التوصيل للمنزل'
                  )
                  : (
                    language === 'he'
                      ? 'איסוף עצמי בלבד'
                      : 'يمكن للعملاء الطلب للاستلام فقط'
                  )}
              </p>
            </div>

            <div className="relative inline-block w-14 h-8 shrink-0">

              <input
                type="checkbox"
                {...register(
                  'deliveryEnabled'
                )}
                className="peer sr-only"
                readOnly
                checked={
                  !!deliveryEnabled
                }
              />

              <div
                className={`w-14 h-8 rounded-full transition-colors ${
                  deliveryEnabled
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
              />

              <div
                className={`absolute top-1 bottom-1 w-6 bg-white rounded-full transition-all shadow-md ${
                  deliveryEnabled
                    ? 'start-1'
                    : 'end-1'
                }`}
              />
            </div>
          </label>
        </Card>

        <Card className="p-6">

          <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6">
            {language === 'he'
              ? 'מחיר משלוח'
              : 'سعر التوصيل'}
          </h2>

          <div className="space-y-4">

            <input
              type="number"
              value={deliveryFee}
              onChange={(e) =>
                setDeliveryFee(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full bg-input border border-border rounded-xl px-4 py-3"
            />

            <button
              onClick={
                saveDeliveryFee
              }
              className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold"
            >
              {language === 'he'
                ? 'שמור מחיר משלוח'
                : 'حفظ سعر التوصيل'}
            </button>
          </div>
        </Card>

        <Card className="p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border/50 pb-4 mb-6">

            <Lock className="text-primary" />

            {language === 'he'
              ? 'שינוי סיסמה'
              : 'تغيير كلمة المرور'}
          </h2>

          <div className="space-y-4">

            <input
              type="password"
              placeholder={
                language === 'he'
                  ? 'סיסמה נוכחית'
                  : 'كلمة المرور الحالية'
              }
              value={oldPassword}
              onChange={(e) =>
                setOldPassword(
                  e.target.value
                )
              }
              className="w-full bg-input border border-border rounded-xl px-4 py-3"
            />

            <input
              type="password"
              placeholder={
                language === 'he'
                  ? 'סיסמה חדשה'
                  : 'كلمة المرور الجديدة'
              }
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              className="w-full bg-input border border-border rounded-xl px-4 py-3"
            />

            <input
              type="password"
              placeholder={
                language === 'he'
                  ? 'אימות סיסמה'
                  : 'تأكيد كلمة المرور'
              }
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full bg-input border border-border rounded-xl px-4 py-3"
            />

            <button
              onClick={
                changePassword
              }
              className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold"
            >
              {language === 'he'
                ? 'שמור סיסמה'
                : 'حفظ كلمة المرور'}
            </button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}