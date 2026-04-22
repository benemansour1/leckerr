import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, Button, Input, Dialog } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Trash2, Power } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, createProduct, updateProduct, deleteProduct, toggleProduct, type Product } from '@/lib/firestore';
import { useLang } from '@/i18n';

const CATEGORIES = [
  {
    ar: 'بانكيك',
    he: 'פנקייק',
  },
  {
    ar: 'كريب',
    he: 'קרפ',
  },
  {
    ar: 'وافل',
    he: 'וופל',
  },
  {
    ar: 'بوظة',
    he: 'גלידה',
  },
  {
    ar: 'حلويات خاصة',
    he: 'קינוחים מיוחדים',
  },
  {
    ar: 'مشروبات ساخنة',
    he: 'שתייה חמה',
  },
  {
    ar: 'مشروبات باردة',
    he: 'שתייה קרה',
  },
  {
    ar: 'أكل',
    he: 'אוכל',
  },
  {
    ar: 'بيرا',
    he: 'בירה',
  },
];

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { t } = useLang();

const language =
  localStorage.getItem('language') || 'ar';
  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: getAllProducts,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Product, 'id' | 'createdAt'>) => createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });
  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm();

  const openCreate = () => {
    setEditingProduct(null);
    reset({ isActive: true, sortOrder: 0, category: 'بانكيك' });
    setIsDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    reset(p);
    setIsDialogOpen(true);
  };

  const handleToggle = async (p: Product) => {
    setTogglingId(p.id);
    try {
      await toggleMutation.mutateAsync(p.id);
      toast({
        title: p.isActive ? 'تم تعطيل المنتج' : 'تم تفعيل المنتج',
        description: `${p.nameAr} ${p.isActive ? 'معطل الآن' : 'متاح الآن للعملاء'}`,
      });
    } catch {
      toast({ title: 'خطأ', description: 'فشل تغيير حالة المنتج', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.nameAr || data.name,
        nameAr: data.nameAr,
        nameHe: data.nameHe || null,
        category: data.category,
        price: Number(data.price),
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive === true || data.isActive === 'true',
        sortOrder: Number(data.sortOrder || 0),
        variants: [],
      };

      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: payload });
        toast({ title: 'تم التحديث بنجاح' });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: 'تمت الإضافة بنجاح' });
      }
      setIsDialogOpen(false);
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'تم الحذف' });
      } catch {
        toast({ title: 'خطأ', variant: 'destructive' });
      }
    }
  };

  

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gold-gradient">{language === 'he' ? 'מוצרים' : 'المنتجات'}</h1>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-5 h-5" />{language === 'he' ? 'הוסף מוצר' : 'إضافة منتج'}</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-sm">
                <th className="p-4 font-medium">{language === 'he' ? 'מוצר' : 'المنتج'}</th>
                <th className="p-4 font-medium">{language === 'he' ? 'קטגוריה' : 'التصنيف'}</th>
                <th className="p-4 font-medium">{language === 'he' ? 'מחיר' : 'السعر'}</th>
                <th className="p-4 font-medium text-center">{language === 'he' ? 'הפעלה/כיבוי' : 'تفعيل/تعطيل'}</th>
                <th className="p-4 font-medium text-center">{language === 'he' ? 'פעולות' : 'إجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products?.map(p => (
                <tr key={p.id} className={cn(
                  'transition-colors',
                  p.isActive ? 'hover:bg-secondary/20' : 'bg-destructive/5 hover:bg-destructive/10 opacity-70'
                )}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.nameAr} className="w-12 h-12 rounded-xl object-cover bg-secondary flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-secondary/50 flex-shrink-0 flex items-center justify-center text-xl">
                          🍬
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{p.nameAr}</p>
                        {p.nameHe && <p className="text-xs text-muted-foreground">{p.nameHe}</p>}
                        {!p.isActive && <p className="text-xs text-destructive">{language === 'he' ? 'מושבת' : 'معطل'}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{p.category}</td>
                  <td className="p-4 font-bold text-primary">{formatPrice(p.price)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggle(p)}
                      disabled={togglingId === p.id}
                      title={p.isActive ? 'تعطيل المنتج' : 'تفعيل المنتج'}
                      className={cn(
                        'p-2.5 rounded-xl transition-all font-medium text-sm border-2',
                        p.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/30',
                        togglingId === p.id && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
       title={
  editingProduct
    ? (language === 'he'
        ? 'עריכת מוצר'
        : 'تعديل منتج')
    : (language === 'he'
        ? 'הוספת מוצר חדש'
        : 'إضافة منتج جديد')
}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input label={language === 'he'
  ? 'שם מוצר בערבית'
  : 'اسم المنتج (بالعربية)'}{...register('nameAr')} required />
          <Input label={language === 'he'
  ? 'שם מוצר בעברית'
  : 'اسم المنتج (بالعبرية)'} {...register('nameHe')} placeholder="שם המוצר בעברית" dir="rtl" />
          <div className="grid grid-cols-2 gap-4">
            <Input label={language === 'he'
  ? 'מחיר (₪)'
  : 'السعر (شيكل)'}type="number" step="0.01" {...register('price')} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground ms-1">
  {language === 'he'
    ? 'קטגוריה'
    : 'التصنيف'}
</label>
              <select {...register('category')} className="bg-input/50 border-2 border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none">
                {CATEGORIES.map((c) => (
  <option
    key={c.ar}
    value={c.ar}
  >
    {language === 'he'
      ? c.he
      : c.ar}
  </option>
))}
              </select>
            </div>
          </div>
          <Input label={language === 'he'
  ? 'תיאור'
  : 'الوصف'}{...register('description')} />
          <Input
  label={
    language === 'he'
      ? 'קישור תמונה'
      : 'رابط الصورة (URL)'
  }
  {...register('imageUrl')}
  dir="ltr"
/>
          <div className="grid grid-cols-2 gap-4">
            <Input
  label={
    language === 'he'
      ? 'סדר תצוגה'
      : 'ترتيب العرض'
  }
  type="number"
  {...register('sortOrder')}
/>
            <label className="flex items-center gap-3 mt-8 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-5 h-5 accent-primary" />
              <span>{language === 'he'
  ? 'המוצר פעיל וזמין להזמנה'
  : 'المنتج نشط ومتاح للطلب'}</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border/50">
            <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>{language === 'he' ? 'שמור' : 'حفظ'}</Button>
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>{language === 'he' ? 'ביטול' : 'إلغاء'}</Button>
          </div>
        </form>
      </Dialog>
    </AdminLayout>
  );
}
