import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui-elements';
import { formatPrice } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMonthlyRevenue } from '@/lib/firestore';

export default function AdminRevenueMonthly() {
  const currentObj = new Date();
  const [month, setMonth] = useState((currentObj.getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(currentObj.getFullYear().toString());

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['monthly-revenue', year, month],
    queryFn: () => getMonthlyRevenue(Number(year), Number(month)),
  });

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gold-gradient">الإيرادات الشهرية</h1>
          <p className="text-muted-foreground mt-1">تحليل مبيعات شهر محدد</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)} className="bg-input border-2 border-border rounded-xl px-4 py-2 outline-none">
            {Array.from({ length: 12 }, (_, i) => {
              const m = (i + 1).toString().padStart(2, '0');
              return <option key={m} value={m}>شهر {m}</option>;
            })}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-input border-2 border-border rounded-xl px-4 py-2 outline-none">
            {Array.from({ length: 5 }, (_, i) => {
              const y = (currentObj.getFullYear() - i).toString();
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {isLoading ? (
        <Card className="h-96 animate-pulse bg-secondary/50 border-none" />
      ) : revenue ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="text-muted-foreground mb-2">إجمالي الإيرادات</h3>
              <p className="text-4xl font-bold text-primary">{formatPrice(revenue.total)}</p>
            </Card>
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
              <h3 className="text-muted-foreground mb-2">عدد الطلبات</h3>
              <p className="text-4xl font-bold text-blue-400">{revenue.orderCount}</p>
            </Card>
          </div>

          <Card className="p-6 h-[400px]">
            <h3 className="text-xl font-bold mb-6">الأيام الأعلى مبيعاً</h3>
            {revenue.breakdown.some(b => b.orders > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.breakdown} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                  <XAxis dataKey="label" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                  <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                  <Tooltip
                    cursor={{ fill: '#ffffff0a' }}
                    contentStyle={{ backgroundColor: '#1a0a00', border: '1px solid #4a2c11', borderRadius: '12px', color: '#fdf6e3' }}
                  />
                  <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} name="الإيرادات (₪)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">لا توجد مبيعات في هذا الشهر</div>
            )}
          </Card>
        </div>
      ) : null}
    </AdminLayout>
  );
}
