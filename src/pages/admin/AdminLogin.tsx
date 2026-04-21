import React, { useState } from 'react';
import { Button, Input, Card } from '@/components/ui-elements';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  // ✅ هذا اللي كان ناقص
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    if (password === "admin123") {

      // 🔥 أهم سطر (حل المشكلة)
      login({ role: 'admin' });

      toast({ title: "تم الدخول", description: "مرحباً بك في لوحة التحكم" });

      // redirect
      window.location.href = '/admin/dashboard';

    } else {
      toast({ title: "خطأ", description: "كلمة المرور غير صحيحة", variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-background via-secondary/20 to-background" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 w-full max-w-md">
        <Card className="p-8 sm:p-10 backdrop-blur-xl bg-card/90 border-primary/30 shadow-2xl shadow-primary/10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gold-gradient">لوحة إدارة ليكير</h1>
            <p className="text-muted-foreground mt-2 text-sm">دخول الأدمن فقط</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="كلمة مرور الأدمن"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-center text-lg"
              required
            />

            <Button type="submit" className="w-full text-lg py-4" isLoading={loading}>
              دخول لوحة الإدارة
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}