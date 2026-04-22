import React, { useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui-elements';
import { ShoppingBag, DollarSign, PackageOpen, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLang } from '@/i18n';
import { getAdminStats } from '@/lib/firestore';
import { getMessaging, getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 30000,
  });
  const { t } = useLang();

  useEffect(() => {

  window.scrollTo(0, 0);

}, []);

  useEffect(() => {

  const setupNotifications = async () => {

    try {


      if (Notification.permission !== 'granted') return;

      const messaging = getMessaging();

      const token = await getToken(
        messaging,
        {
          vapidKey:
            'BPNI8-U9eQCXSgH6TDLqfmGXvPc2ctLJYkem7Z3tUvfx_6oBystcKIUAZykJoSiSc1yxjOdsEOkwYTCuH5hYyr4',
        }
      );

      if (!token) return;

      const deviceId =
        localStorage.getItem('device-id') ||
        crypto.randomUUID();

      localStorage.setItem(
        'device-id',
        deviceId
      );

      await setDoc(
        doc(
          db,
          'adminTokens',
          deviceId
        ),
        {
          token,
          updatedAt: new Date(),
          merge: true
        }
      );

    } catch (err) {
      console.error(err);
    }
  };

  setupNotifications();

}, []);


  const STAT_CARDS = [
    { title: t.admin.todayRevenue, value: formatPrice(stats?.todayRevenue || 0), icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { title: t.admin.todayOrders, value: stats?.todayOrders || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: t.admin.pendingOrders, value: stats?.pendingOrders || 0, icon: PackageOpen, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: t.admin.monthRevenue, value: formatPrice(stats?.monthRevenue || 0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <AdminLayout>


    
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gold-gradient">{t.admin.overview}</h1>
          <p className="text-muted-foreground mt-1">{t.admin.welcomeBack}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {STAT_CARDS.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
           <Card className="p-6 h-full relative overflow-hidden group">
              <div className={`absolute -end-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:bg-opacity-20 transition-all`} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  {isLoading ? (
                    <div className="h-8 w-24 bg-secondary/50 rounded animate-pulse mt-2" />
                  ) : (
                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid lg:grid-cols-2 gap-8">
        <Card className="p-6 h-full">
          <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-4">{t.admin.additionalStats}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.admin.totalActiveProducts}</span>
              <span className="font-bold text-lg">{stats?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.admin.totalOrdersHistory}</span>
              <span className="font-bold text-lg">{stats?.totalOrders || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
